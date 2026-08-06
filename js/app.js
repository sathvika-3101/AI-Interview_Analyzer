/**
 * Main Application Orchestrator
 * Bootstraps Firebase, Router, Views, and Auth Observers
 */

import { initFirebase, subscribeAuthState, logoutUser } from "./firebase-service.js";
import { Router } from "./router.js";

// Views
import { initLandingView } from "./views/landing.js";
import { initAuthViews } from "./views/auth.js";
import { initDashboardView } from "./views/dashboard.js";
import { initAnalyzerView } from "./views/analyzer.js";
import { renderResultsView } from "./views/results.js";
import { initHistoryView } from "./views/history.js";
import { initAnalyticsView } from "./views/analytics.js";
import { initProfileView } from "./views/profile.js";

let currentUser = null;
let currentActiveReport = null;
let router = null;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  // Init Firebase
  initFirebase();

  // Route Handlers Map
  const routesMap = {
    landing: () => {
      initLandingView();
    },
    login: () => {
      initAuthViews((user) => {
        currentUser = user;
        router.navigate("dashboard");
      });
    },
    register: () => {
      initAuthViews((user) => {
        currentUser = user;
        router.navigate("dashboard");
      });
    },
    dashboard: () => {
      initDashboardView(currentUser, (selectedReport) => {
        currentActiveReport = selectedReport;
        router.navigate("results");
      });
    },
    interview: () => {
      initAnalyzerView(currentUser, (newReport) => {
        currentActiveReport = newReport;
        router.navigate("results");
      });
    },
    results: () => {
      renderResultsView(currentActiveReport);
    },
    history: () => {
      initHistoryView(currentUser, (selectedReport) => {
        currentActiveReport = selectedReport;
        router.navigate("results");
      });
    },
    analytics: () => {
      initAnalyticsView(currentUser);
    },
    profile: () => {
      initProfileView(currentUser);
    }
  };

  // Instantiate Router
  router = new Router(routesMap, () => currentUser);

  // Subscribe Auth state
  subscribeAuthState((user) => {
    currentUser = user;
    router.handleRoute();
  });

  // Global Event Listeners (Logout, Mobile Menu, API key Header)
  document.addEventListener("click", async (e) => {
    // Logout button
    if (e.target.closest("#btn-logout-nav") || e.target.closest("#btn-logout-profile")) {
      await logoutUser();
      currentUser = null;
      router.navigate("landing");
    }

    // API Key Header button
    if (e.target.closest("#btn-api-key-header")) {
      router.navigate("profile");
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = e.target.closest("#btn-mobile-menu");
    if (mobileMenuBtn) {
      const mobileDrawer = document.getElementById("mobile-menu-drawer");
      if (mobileDrawer) mobileDrawer.classList.toggle("hidden");
    }

    // Close Mobile Drawer on Link click
    if (e.target.closest("#mobile-menu-drawer a")) {
      const mobileDrawer = document.getElementById("mobile-menu-drawer");
      if (mobileDrawer) mobileDrawer.classList.add("hidden");
    }
  });

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});
