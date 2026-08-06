/**
 * Profile View Controller
 * Displays user credentials, stats, joined date, and Gemini API key settings
 */

import { getUserInterviews } from "../firebase-service.js";
import { ConfigManager } from "../config.js";

export async function initProfileView(currentUser) {
  if (!currentUser) return;

  // Name & Email
  const nameEl = document.getElementById("profile-name");
  const emailEl = document.getElementById("profile-email");
  const joinedEl = document.getElementById("profile-joined");
  const avatarEl = document.getElementById("profile-avatar-container");

  if (nameEl) nameEl.textContent = currentUser.displayName || "Interview Candidate";
  if (emailEl) emailEl.textContent = currentUser.email || "candidate@example.com";
  
  const createdDate = currentUser.metadata?.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : "Recently";
  if (joinedEl) joinedEl.textContent = `Member since ${createdDate}`;

  // Avatar Initials
  const initials = (currentUser.displayName || currentUser.email || "UC").slice(0, 2).toUpperCase();
  if (avatarEl) {
    avatarEl.innerHTML = currentUser.photoURL 
      ? `<img src="${currentUser.photoURL}" class="w-full h-full rounded-full object-cover"/>`
      : `<span class="text-2xl font-bold text-white">${initials}</span>`;
  }

  // Stats
  const interviews = await getUserInterviews(currentUser.uid);
  const total = interviews.length;
  const scores = interviews.map(i => i.aiFeedback?.overall_score || 0);
  const highest = total ? Math.max(...scores) : 0;
  const avg = total ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;

  const totalEl = document.getElementById("profile-stat-total");
  const highEl = document.getElementById("profile-stat-highest");
  const avgStatEl = document.getElementById("profile-stat-avg");

  if (totalEl) totalEl.textContent = total;
  if (highEl) highEl.textContent = total ? `${highest}%` : "0%";
  if (avgStatEl) avgStatEl.textContent = total ? `${avg}%` : "0%";

  // API Key Settings Form
  const apiKeyInput = document.getElementById("input-gemini-key");
  const btnSaveKey = document.getElementById("btn-save-gemini-key");
  const keyStatusMsg = document.getElementById("key-status-msg");
  const toggleKeyVisibility = document.getElementById("btn-toggle-key-vis");

  if (apiKeyInput) {
    apiKeyInput.value = ConfigManager.getGeminiApiKey();
  }

  if (toggleKeyVisibility && apiKeyInput) {
    toggleKeyVisibility.onclick = () => {
      if (apiKeyInput.type === "password") {
        apiKeyInput.type = "text";
        toggleKeyVisibility.innerHTML = `<i data-lucide="eye-off" class="w-4 h-4 text-slate-400"></i>`;
      } else {
        apiKeyInput.type = "password";
        toggleKeyVisibility.innerHTML = `<i data-lucide="eye" class="w-4 h-4 text-slate-400"></i>`;
      }
      if (window.lucide) window.lucide.createIcons();
    };
  }

  if (btnSaveKey && apiKeyInput) {
    btnSaveKey.onclick = () => {
      const newKey = apiKeyInput.value.trim();
      ConfigManager.setGeminiApiKey(newKey);
      
      if (keyStatusMsg) {
        keyStatusMsg.classList.remove("hidden");
        keyStatusMsg.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i> Gemini API Key updated successfully!`;
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          keyStatusMsg.classList.add("hidden");
        }, 3000);
      }
    };
  }
}
