/**
 * Hash SPA Router
 * Controls view navigation, protected route guards, and nav state
 */

const PROTECTED_ROUTES = [
  "dashboard",
  "interview",
  "results",
  "history",
  "analytics",
  "profile"
];

export class Router {
  constructor(routesMap, getCurrentUserFn) {
    this.routesMap = routesMap;
    this.getCurrentUser = getCurrentUserFn;
    this.currentRoute = "landing";

    window.addEventListener("hashchange", () => this.handleRoute());
  }

  init() {
    this.handleRoute();
  }

  navigate(routeHash) {
    window.location.hash = routeHash;
  }

  handleRoute() {
    let rawHash = window.location.hash.replace(/^#\/?/, "").trim();
    if (!rawHash) rawHash = "landing";

    const user = this.getCurrentUser();

    // Route guard check
    if (PROTECTED_ROUTES.includes(rawHash) && !user) {
      console.log(`Protected route '#${rawHash}' requested without auth. Redirecting to login.`);
      window.location.hash = "login";
      return;
    }

    // If logged in and hitting auth pages, redirect to dashboard
    if (user && (rawHash === "login" || rawHash === "register")) {
      window.location.hash = "dashboard";
      return;
    }

    this.currentRoute = rawHash;
    this.updateActiveView(rawHash);
    this.updateNavbarUI(user, rawHash);

    // Call route controller callback if exists
    if (this.routesMap[rawHash]) {
      this.routesMap[rawHash]();
    }

    // Scroll top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh icons
    if (window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 50);
    }
  }

  updateActiveView(route) {
    const sections = document.querySelectorAll(".view-section");
    sections.forEach(sec => {
      sec.classList.remove("active");
    });

    const target = document.getElementById(`view-${route}`);
    if (target) {
      target.classList.add("active");
    } else {
      // Default fallback
      const defaultSec = document.getElementById("view-landing");
      if (defaultSec) defaultSec.classList.add("active");
    }
  }

  updateNavbarUI(user, activeRoute) {
    const navAuthContainer = document.getElementById("nav-auth-container");
    const navAppLinks = document.getElementById("nav-app-links");
    const mobileNavAppLinks = document.getElementById("mobile-nav-app-links");

    if (user) {
      if (navAppLinks) navAppLinks.classList.remove("hidden");
      if (mobileNavAppLinks) mobileNavAppLinks.classList.remove("hidden");
      
      if (navAuthContainer) {
        const initials = (user.displayName || user.email || "U").slice(0, 2).toUpperCase();
        navAuthContainer.innerHTML = `
          <div class="flex items-center gap-3">
            <button id="btn-api-key-header" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition" title="Gemini API Key Settings">
              <i data-lucide="key" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>API Key</span>
            </button>
            
            <a href="#profile" class="flex items-center gap-2 group">
              <div class="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:ring-2 group-hover:ring-indigo-400 transition">
                ${user.photoURL ? `<img src="${user.photoURL}" class="w-full h-full rounded-full object-cover"/>` : initials}
              </div>
              <span class="hidden md:inline text-sm font-medium text-slate-200 group-hover:text-white">${user.displayName || 'Profile'}</span>
            </a>

            <button id="btn-logout-nav" class="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition" title="Log Out">
              <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
          </div>
        `;
      }
    } else {
      if (navAppLinks) navAppLinks.classList.add("hidden");
      if (mobileNavAppLinks) mobileNavAppLinks.classList.add("hidden");

      if (navAuthContainer) {
        navAuthContainer.innerHTML = `
          <div class="flex items-center gap-3">
            <a href="#login" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition">Login</a>
            <a href="#register" class="px-4 py-2 text-sm font-semibold text-white gradient-btn rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition">Sign Up</a>
          </div>
        `;
      }
    }

    // Highlight active nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href") || "";
      const routeName = href.replace("#", "");
      if (routeName === activeRoute) {
        link.classList.add("text-indigo-400", "font-semibold");
        link.classList.remove("text-slate-400");
      } else {
        link.classList.remove("text-indigo-400", "font-semibold");
        link.classList.add("text-slate-400");
      }
    });
  }
}
