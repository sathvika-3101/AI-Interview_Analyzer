/**
 * Results View Controller
 * Displays complete AI evaluation report with circular meters, sub-score bars, strengths/weaknesses, and improved answer
 */

export function renderResultsView(reportData) {
  if (!reportData || !reportData.aiFeedback) return;

  const fb = reportData.aiFeedback;

  // Question & Candidate Answer
  const qEl = document.getElementById("res-question");
  const aEl = document.getElementById("res-answer");
  if (qEl) qEl.textContent = reportData.question || "N/A";
  if (aEl) aEl.textContent = reportData.answer || "N/A";

  // Demo mode banner toggle
  const demoBanner = document.getElementById("res-demo-banner");
  if (demoBanner) {
    if (fb.isDemoMode) {
      demoBanner.classList.remove("hidden");
    } else {
      demoBanner.classList.add("hidden");
    }
  }

  // Overall Score Circular Progress Ring
  const overallScore = fb.overall_score || 0;
  const scoreNumberEl = document.getElementById("res-overall-score-num");
  const ringCircle = document.getElementById("res-score-ring");

  if (scoreNumberEl) scoreNumberEl.textContent = `${overallScore}%`;

  if (ringCircle) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    ringCircle.style.strokeDasharray = `${circumference}`;
    const offset = circumference - (overallScore / 100) * circumference;
    setTimeout(() => {
      ringCircle.style.strokeDashoffset = `${offset}`;
    }, 100);
  }

  // Sub-score progress bars
  setSubScore("res-grammar-score", "res-grammar-bar", fb.grammar_score || 0);
  setSubScore("res-technical-score", "res-technical-bar", fb.technical_accuracy || 0);
  setSubScore("res-communication-score", "res-communication-bar", fb.communication_score || 0);
  setSubScore("res-confidence-score", "res-confidence-bar", fb.confidence_score || 0);

  // Lists
  renderList("res-strengths-list", fb.strengths, "check-circle", "text-emerald-400", "bg-emerald-500/10");
  renderList("res-weaknesses-list", fb.weaknesses, "alert-circle", "text-amber-400", "bg-amber-500/10");
  renderList("res-missing-list", fb.missing_topics, "help-circle", "text-purple-400", "bg-purple-500/10");
  renderList("res-tips-list", fb.interview_tips, "lightbulb", "text-cyan-400", "bg-cyan-500/10");

  // Improved Answer
  const improvedEl = document.getElementById("res-improved-answer");
  if (improvedEl) {
    improvedEl.textContent = fb.improved_answer || "No improved answer generated.";
  }

  // Copy button
  const copyBtn = document.getElementById("btn-copy-improved");
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(fb.improved_answer || "");
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Copied!`;
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    };
  }

  // Share button
  const shareBtn = document.getElementById("btn-share-report");
  if (shareBtn) {
    shareBtn.onclick = () => {
      const textToShare = `PrepRoom Report\nQuestion: ${reportData.question}\nScore: ${overallScore}%\n`;
      if (navigator.share) {
        navigator.share({ title: 'Interview Report', text: textToShare });
      } else {
        navigator.clipboard.writeText(textToShare);
        alert("Report summary copied to clipboard!");
      }
    };
  }

  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 50);
  }
}

function setSubScore(numId, barId, val) {
  const num = document.getElementById(numId);
  const bar = document.getElementById(barId);
  if (num) num.textContent = `${val}%`;
  if (bar) {
    setTimeout(() => {
      bar.style.width = `${val}%`;
    }, 100);
  }
}

function renderList(containerId, items = [], iconName, iconColorClass, bgClass) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || !items.length) {
    container.innerHTML = `<li class="text-xs text-slate-500 italic">None noted.</li>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
      <div class="p-1 rounded-md ${bgClass} ${iconColorClass} shrink-0 mt-0.5">
        <i data-lucide="${iconName}" class="w-4 h-4"></i>
      </div>
      <span>${item}</span>
    </li>
  `).join("");
}
