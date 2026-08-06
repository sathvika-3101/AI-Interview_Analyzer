/**
 * Analytics View Controller
 * Integrates Chart.js visualizations for candidate progress and skill distribution
 */

import { getUserInterviews } from "../firebase-service.js";
import { renderAnalyticsCharts } from "../charts.js";

export async function initAnalyticsView(currentUser) {
  if (!currentUser) return;

  const interviews = await getUserInterviews(currentUser.uid);

  // Calculate Metrics
  const total = interviews.length;
  const scores = interviews.map(i => i.aiFeedback?.overall_score || 0);
  const highest = total ? Math.max(...scores) : 0;
  const avg = total ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;

  // Estimate Weekly Practice Frequency
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weeklyCount = interviews.filter(i => (i.timestamp || 0) > oneWeekAgo).length;

  // Update KPIs
  const avgEl = document.getElementById("analytics-avg-score");
  const maxEl = document.getElementById("analytics-max-score");
  const freqEl = document.getElementById("analytics-frequency");

  if (avgEl) avgEl.textContent = total ? `${avg}%` : "0%";
  if (maxEl) maxEl.textContent = total ? `${highest}%` : "0%";
  if (freqEl) freqEl.textContent = `${weeklyCount} / week`;

  // Render Chart.js
  renderAnalyticsCharts(interviews);
}
