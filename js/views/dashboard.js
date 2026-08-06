/**
 * Dashboard View Controller
 * Renders user statistics, score widgets, and recent interview cards
 */

import { getUserInterviews } from "../firebase-service.js";

export async function initDashboardView(currentUser, onSelectInterview) {
  if (!currentUser) return;

  // Welcome user name
  const nameEl = document.getElementById("dash-user-name");
  if (nameEl) {
    nameEl.textContent = currentUser.displayName || currentUser.email.split('@')[0] || "Candidate";
  }

  const interviews = await getUserInterviews(currentUser.uid);

  // Calculate Metrics
  const total = interviews.length;
  const scores = interviews.map(i => i.aiFeedback?.overall_score || 0);
  const highest = total ? Math.max(...scores) : 0;
  const avg = total ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;

  // Update Stat Widgets
  const avgEl = document.getElementById("dash-avg-score");
  const maxEl = document.getElementById("dash-max-score");
  const countEl = document.getElementById("dash-total-count");

  if (avgEl) avgEl.textContent = total ? `${avg}%` : "N/A";
  if (maxEl) maxEl.textContent = total ? `${highest}%` : "N/A";
  if (countEl) countEl.textContent = total;

  // Render Recent Interviews
  const recentContainer = document.getElementById("dash-recent-list");
  if (!recentContainer) return;

  if (total === 0) {
    recentContainer.innerHTML = `
      <div class="col-span-full text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <i data-lucide="sparkles" class="w-6 h-6"></i>
        </div>
        <h4 class="text-base font-semibold text-slate-200">No interviews recorded yet</h4>
        <p class="text-sm text-slate-400 mt-1 max-w-md mx-auto">Start your first practice interview session to receive instant AI evaluation and track your progress over time.</p>
        <a href="#interview" class="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-semibold text-white gradient-btn rounded-xl shadow-lg shadow-indigo-500/20">
          <i data-lucide="play" class="w-4 h-4"></i> Start Practicing
        </a>
      </div>
    `;
    return;
  }

  const recentItems = interviews.slice(0, 4);
  recentContainer.innerHTML = recentItems.map(item => {
    const score = item.aiFeedback?.overall_score || 0;
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
    
    let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score < 70) badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (score < 50) badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

    return `
      <div class="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between cursor-pointer group" data-id="${item.id}">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-xs font-medium text-slate-400">${dateStr}</span>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}">
              Score: ${score}%
            </span>
          </div>
          <h4 class="text-sm font-semibold text-slate-200 line-clamp-2 mb-2 group-hover:text-indigo-400 transition">
            "${item.question}"
          </h4>
          <p class="text-xs text-slate-400 line-clamp-2 italic">
            "${item.answer}"
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-medium">
          <span>View Report</span>
          <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition"></i>
        </div>
      </div>
    `;
  }).join("");

  // Add click handlers
  recentContainer.querySelectorAll("[data-id]").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const found = interviews.find(i => i.id === id);
      if (found && onSelectInterview) {
        onSelectInterview(found);
      }
    });
  });
}
