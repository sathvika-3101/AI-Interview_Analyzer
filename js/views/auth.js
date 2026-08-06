/**
 * Authentication View Controller
 * Handles Email/Password sign up, login, email verification alerts,
 * password strength evaluation, show/hide password toggles, and password reset.
 */

import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  resendVerificationEmail, 
  sendPasswordReset, 
  checkEmailVerified 
} from "../firebase-service.js";

export function initAuthViews(onAuthSuccess) {
  setupPasswordVisibilityToggles();
  setupPasswordStrengthMeter();
  setupForgotPasswordModal();

  // --------------------------------------------------
  // 1. LOGIN FORM HANDLER
  // --------------------------------------------------
  const loginForm = document.getElementById("form-login");
  const loginErr = document.getElementById("login-error-msg");
  const loginErrText = document.getElementById("login-error-text");
  const loginBtn = document.getElementById("btn-login-submit");
  const verifBanner = document.getElementById("login-verification-banner");
  const verifSuccess = document.getElementById("login-verification-success");

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (loginErr) loginErr.classList.add("hidden");
      if (verifBanner) verifBanner.classList.add("hidden");
      if (verifSuccess) verifSuccess.classList.add("hidden");

      setLoadingState(loginBtn, true, "Logging in...");

      try {
        const res = await loginWithEmail(email, password);
        setLoadingState(loginBtn, false, "Log In to Account");

        if (res.success) {
          if (res.emailVerified === false && !res.isMock) {
            // Show verification banner warning
            if (verifBanner) verifBanner.classList.remove("hidden");
          }
          if (onAuthSuccess) {
            onAuthSuccess(res.user);
          }
        }
      } catch (err) {
        setLoadingState(loginBtn, false, "Log In to Account");
        if (loginErr) {
          if (loginErrText) loginErrText.textContent = formatAuthErrorMessage(err.code || err.message);
          loginErr.classList.remove("hidden");
        }
      }
    };
  }

  // Resend Email Verification button on login banner
  const btnResendVerif = document.getElementById("btn-resend-verification");
  if (btnResendVerif) {
    btnResendVerif.onclick = async () => {
      try {
        await resendVerificationEmail();
        if (verifSuccess) verifSuccess.classList.remove("hidden");
      } catch (err) {
        alert("Failed to send verification email: " + (err.message || "Please try again later."));
      }
    };
  }

  // Check Email Verification status button
  const btnCheckVerif = document.getElementById("btn-check-verification");
  if (btnCheckVerif) {
    btnCheckVerif.onclick = async () => {
      try {
        const isVerified = await checkEmailVerified();
        if (isVerified) {
          alert("Your email has been verified! Redirecting to Dashboard...");
          if (verifBanner) verifBanner.classList.add("hidden");
          if (onAuthSuccess) {
            onAuthSuccess(null); // Triggers route refresh
          }
        } else {
          alert("Email is not verified yet. Please check your inbox and click the verification link.");
        }
      } catch (err) {
        console.warn("Check verification error:", err);
      }
    };
  }

  // --------------------------------------------------
  // 2. REGISTER FORM HANDLER
  // --------------------------------------------------
  const regForm = document.getElementById("form-register");
  const regErr = document.getElementById("register-error-msg");
  const regErrText = document.getElementById("register-error-text");
  const regBtn = document.getElementById("btn-register-submit");
  const regSuccessBox = document.getElementById("register-success-box");
  const regSentEmail = document.getElementById("register-sent-email");
  const mismatchMsg = document.getElementById("password-mismatch-msg");

  if (regForm) {
    regForm.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("reg-confirm-password").value;

      if (regErr) regErr.classList.add("hidden");
      if (mismatchMsg) mismatchMsg.classList.add("hidden");

      // Password mismatch check
      if (password !== confirmPassword) {
        if (mismatchMsg) mismatchMsg.classList.remove("hidden");
        return;
      }

      setLoadingState(regBtn, true, "Creating account...");

      try {
        const res = await registerWithEmail(name, email, password);
        setLoadingState(regBtn, false, "Create Account & Send Verification");

        if (res.success) {
          if (regSuccessBox) {
            if (regSentEmail) regSentEmail.textContent = email;
            regSuccessBox.classList.remove("hidden");
            regForm.reset();
          }

          if (onAuthSuccess) {
            onAuthSuccess(res.user);
          }
        }
      } catch (err) {
        setLoadingState(regBtn, false, "Create Account & Send Verification");
        if (regErr) {
          if (regErrText) regErrText.textContent = formatAuthErrorMessage(err.code || err.message);
          regErr.classList.remove("hidden");
        }
      }
    };
  }

  // --------------------------------------------------
  // 3. GOOGLE OAUTH BUTTONS
  // --------------------------------------------------
  const googleBtnLogin = document.getElementById("btn-google-login");
  const googleBtnReg = document.getElementById("btn-google-register");

  const handleGoogleClick = async () => {
    try {
      const res = await loginWithGoogle();
      if (res.success && onAuthSuccess) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert("Google Sign In failed: " + (err.message || "Unknown error"));
      }
    }
  };

  if (googleBtnLogin) googleBtnLogin.onclick = handleGoogleClick;
  if (googleBtnReg) googleBtnReg.onclick = handleGoogleClick;
}

// ----------------------------------------------------
// PASSWORD VISIBILITY TOGGLE HELPERS
// ----------------------------------------------------
function setupPasswordVisibilityToggles() {
  const togglePairs = [
    { btnId: "btn-toggle-login-password", inputId: "login-password" },
    { btnId: "btn-toggle-reg-password", inputId: "reg-password" },
    { btnId: "btn-toggle-reg-confirm-password", inputId: "reg-confirm-password" }
  ];

  togglePairs.forEach(({ btnId, inputId }) => {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (btn && input) {
      btn.onclick = () => {
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.innerHTML = isPassword 
          ? `<i data-lucide="eye-off" class="w-4 h-4 text-indigo-400"></i>`
          : `<i data-lucide="eye" class="w-4 h-4 text-slate-400"></i>`;
        if (window.lucide) window.lucide.createIcons();
      };
    }
  });
}

// ----------------------------------------------------
// DYNAMIC PASSWORD STRENGTH METER
// ----------------------------------------------------
function setupPasswordStrengthMeter() {
  const regPassword = document.getElementById("reg-password");
  const strengthContainer = document.getElementById("password-strength-container");
  const strengthBar = document.getElementById("password-strength-bar");
  const strengthText = document.getElementById("password-strength-text");

  if (!regPassword || !strengthBar || !strengthText) return;

  regPassword.oninput = () => {
    const val = regPassword.value;
    if (!val) {
      if (strengthContainer) strengthContainer.classList.add("hidden");
      return;
    }

    if (strengthContainer) strengthContainer.classList.remove("hidden");

    let score = 0;
    if (val.length >= 6) score += 1;
    if (val.length >= 10) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    strengthBar.className = "strength-bar";
    if (score <= 2) {
      strengthBar.classList.add("strength-bar-weak");
      strengthText.textContent = "Weak";
      strengthText.className = "font-semibold text-rose-400";
    } else if (score <= 4) {
      strengthBar.classList.add("strength-bar-medium");
      strengthText.textContent = "Medium";
      strengthText.className = "font-semibold text-amber-400";
    } else {
      strengthBar.classList.add("strength-bar-strong");
      strengthText.textContent = "Strong";
      strengthText.className = "font-semibold text-emerald-400";
    }
  };
}

// ----------------------------------------------------
// FORGOT PASSWORD MODAL HANDLERS
// ----------------------------------------------------
function setupForgotPasswordModal() {
  const triggerBtn = document.getElementById("btn-forgot-password-trigger");
  const modal = document.getElementById("modal-forgot-password");
  const closeBtn = document.getElementById("btn-close-forgot-modal");
  const form = document.getElementById("form-forgot-password");
  const statusMsg = document.getElementById("forgot-status-msg");

  if (!triggerBtn || !modal) return;

  triggerBtn.onclick = () => {
    modal.classList.remove("hidden");
    if (statusMsg) statusMsg.classList.add("hidden");
  };

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.add("hidden");
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById("forgot-email").value.trim();
      const submitBtn = document.getElementById("btn-send-reset-link");

      setLoadingState(submitBtn, true, "Sending link...");

      try {
        await sendPasswordReset(email);
        setLoadingState(submitBtn, false, "Send Reset Link");
        if (statusMsg) {
          statusMsg.className = "p-3.5 rounded-2xl text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2";
          statusMsg.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 shrink-0 text-emerald-400"></i> Password reset email sent! Check your inbox.`;
          statusMsg.classList.remove("hidden");
          if (window.lucide) window.lucide.createIcons();
        }
      } catch (err) {
        setLoadingState(submitBtn, false, "Send Reset Link");
        if (statusMsg) {
          statusMsg.className = "p-3.5 rounded-2xl text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2";
          statusMsg.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 shrink-0 text-rose-400"></i> ${formatAuthErrorMessage(err.code || err.message)}`;
          statusMsg.classList.remove("hidden");
          if (window.lucide) window.lucide.createIcons();
        }
      }
    };
  }
}

// Helper: Button Loading Spinner State
function setLoadingState(button, isLoading, originalText) {
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <div class="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
      <span>${originalText}</span>
    `;
  } else {
    button.disabled = false;
    button.innerHTML = `<span>${originalText}</span>`;
  }
}

function formatAuthErrorMessage(code) {
  if (!code) return "An authentication error occurred.";
  if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) {
    return "Invalid email address or password.";
  }
  if (code.includes("email-already-in-use")) {
    return "This email address is already registered. Try logging in.";
  }
  if (code.includes("weak-password")) {
    return "Password should be at least 6 characters long.";
  }
  if (code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code.includes("too-many-requests")) {
    return "Access blocked due to multiple failed attempts. Please try again later.";
  }
  return "Authentication error: " + code;
}
