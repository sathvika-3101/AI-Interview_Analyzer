/**
 * History View Controller
 * Handles interview report list, live keyword search, score sorting, report view modal, and doc deletion
 */

import { getUserInterviews, deleteInterviewData } from "../firebase-service.js";

let currentInterviewsCache = [];

export async function initHistoryView(currentUser, onSelectInterview) {
  if (!currentUser) return;

  const searchInput = document.getElementById("history-search");
  const sortSelect = document.getElementById("history-sort");

  // Fetch interviews
  currentInterviewsCache = await getUserInterviews(currentUser.uid);

  renderHistoryList(currentInterviewsCache, onSelectInterview, currentUser);

  // Search input handler
  if (searchInput) {
    searchInput.oninput = () => {
      applyFiltersAndRender(onSelectInterview, currentUser);
    };
  }

  // Sort handler
  if (sortSelect) {
    sortSelect.onchange = () => {
      applyFiltersAndRender(onSelectInterview, currentUser);
    };
  }
}

function applyFiltersAndRender(onSelectInterview, currentUser) {
  const searchInput = document.getElementById("history-search");
  const sortSelect = document.getElementById("history-sort");

  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const sortBy = sortSelect ? sortSelect.value : "latest";

  let filtered = currentInterviewsCache.filter(item => {
    const q = (item.question || "").toLowerCase();
    const a = (item.answer || "").toLowerCase();
    return q.includes(query) || a.includes(query);
  });

  if (sortBy === "latest") {
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } else if (sortBy === "highest") {
    filtered.sort((a, b) => (b.aiFeedback?.overall_score || 0) - (a.aiFeedback?.overall_score || 0));
  } else if (sortBy === "lowest") {
    filtered.sort((a, b) => (a.aiFeedback?.overall_score || 0) - (b.aiFeedback?.overall_score || 0));
  }

  renderHistoryList(filtered, onSelectInterview, currentUser);
}

function renderHistoryList(items, onSelectInterview, currentUser) {
  const container = document.getElementById("history-list-container");
  const emptyState = document.getElementById("history-empty-state");

  if (!container) return;

  if (!items.length) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  container.innerHTML = items.map(item => {
    const score = item.aiFeedback?.overall_score || 0;
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Previous';

    let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score < 70) badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (score < 50) badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

    return `
      <div class="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between relative group" data-id="${item.id}">
        <div>
          <div class="flex items-center justify-between gap-3 mb-3">
            <span class="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-500"></i>
              ${dateStr}
            </span>
            
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}">
                Overall Score: ${score}%
              </span>

              <button type="button" data-delete-id="${item.id}" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition" title="Delete Interview">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <h3 class="text-base font-semibold text-slate-100 line-clamp-2 mb-2 group-hover:text-indigo-400 transition">
            "${item.question}"
          </h3>
          <p class="text-xs sm:text-sm text-slate-400 line-clamp-3 italic mb-4">
            "${item.answer}"
          </p>
        </div>

        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div class="flex items-center gap-3 text-slate-400">
            <span>Tech: <strong class="text-slate-200">${item.aiFeedback?.technical_accuracy || 0}%</strong></span>
            <span>Comm: <strong class="text-slate-200">${item.aiFeedback?.communication_score || 0}%</strong></span>
          </div>

          <button type="button" data-view-id="${item.id}" class="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold flex items-center gap-1.5 transition">
            <span>Open Full Report</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Event Listeners for Open Report
  container.querySelectorAll("[data-view-id]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-view-id");
      const found = items.find(i => i.id === id);
      if (found && onSelectInterview) {
        onSelectInterview(found);
      }
    });
  });

  // Event Listeners for Delete
  container.querySelectorAll("[data-delete-id]").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-delete-id");
      if (confirm("Are you sure you want to delete this interview analysis report?")) {
        await deleteInterviewData(id);
        currentInterviewsCache = currentInterviewsCache.filter(i => i.id !== id);
        applyFiltersAndRender(onSelectInterview, currentUser);
      }
    });
  });

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 50);
  }
}
