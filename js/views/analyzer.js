/**
 * Interview Analyzer View Controller
 * Handles candidate response submission, sample questions, loading feedback state, and AI analysis trigger
 */

import { AIService } from "../ai-service.js";
import { saveInterviewData } from "../firebase-service.js";

const SAMPLE_QUESTIONS = [
  {
    title: "Technical Conflict",
    question: "Tell me about a time you had a technical disagreement with a colleague. How did you resolve it?",
    answer: "In a previous project, my peer wanted to build a custom caching layer while I advocated for Redis. I organized a quick benchmark spike comparing build effort and cache hit latency. Presenting empirical data helped us align on Redis, saving 2 weeks of development."
  },
  {
    title: "System Design & Scaling",
    question: "How do you approach designing a system that needs to handle 100k concurrent web requests?",
    answer: "I start by decoupling microservices, utilizing an NGINX load balancer, horizontally scaling application pods with Kubernetes, and using Redis for session caching. Database read-heavy operations are offloaded to read replicas."
  },
  {
    title: "Debugging Complex Bug",
    question: "Describe a complex production bug you encountered and how you diagnosed and resolved it.",
    answer: "We experienced intermittent memory leaks in our Node.js service under high CPU load. I collected heap snapshots using Chrome DevTools memory profiler and discovered unhandled event listeners accumulating on WebSocket disconnects."
  },
  {
    title: "Behavioral Leadership",
    question: "How do you prioritize competing deadlines when multiple critical tasks arise simultaneously?",
    answer: "I apply the Eisenhower matrix to evaluate urgency versus impact, consult with product managers to align on core business priorities, communicate transparently about trade-offs, and delegate non-critical tasks."
  }
];

export function initAnalyzerView(currentUser, onAnalysisComplete) {
  const form = document.getElementById("form-analyzer");
  const questionInput = document.getElementById("input-question");
  const answerInput = document.getElementById("input-answer");
  const samplePillsContainer = document.getElementById("sample-questions-pills");
  const loaderModal = document.getElementById("analyzer-loader-modal");
  const loaderText = document.getElementById("analyzer-loader-text");

  if (!form) return;

  // Render Sample Question Pills
  if (samplePillsContainer) {
    samplePillsContainer.innerHTML = SAMPLE_QUESTIONS.map((item, idx) => `
      <button type="button" data-idx="${idx}" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 border border-slate-700/60 transition flex items-center gap-1.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-400"></i>
        <span>${item.title}</span>
      </button>
    `).join("");

    samplePillsContainer.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"));
        const sample = SAMPLE_QUESTIONS[idx];
        if (sample) {
          questionInput.value = sample.question;
          answerInput.value = sample.answer;
        }
      });
    });
  }

  // Clear button handler
  const clearBtn = document.getElementById("btn-clear-analyzer");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      questionInput.value = "";
      answerInput.value = "";
    });
  }

  // Handle Submit
  form.onsubmit = async (e) => {
    e.preventDefault();

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
      alert("Please provide both an Interview Question and your Candidate Answer.");
      return;
    }

    // Show Loading Modal
    if (loaderModal) loaderModal.classList.remove("hidden");
    
    const loadingSteps = [
      "Connecting to Gemini 2.5 Flash AI...",
      "Evaluating technical accuracy and depth...",
      "Analyzing communication style and grammar...",
      "Synthesizing constructive feedback & tips...",
      "Generating exemplary STAR-method answer..."
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % loadingSteps.length;
      if (loaderText) loaderText.textContent = loadingSteps[stepIdx];
    }, 900);

    try {
      // Call AI Service
      const aiFeedback = await AIService.analyzeInterview(question, answer);
      
      // Save report
      const userId = currentUser ? currentUser.uid : "guest_user";
      const savedReport = await saveInterviewData(userId, question, answer, aiFeedback);

      clearInterval(interval);
      if (loaderModal) loaderModal.classList.add("hidden");

      if (onAnalysisComplete) {
        onAnalysisComplete(savedReport);
      }
    } catch (error) {
      clearInterval(interval);
      if (loaderModal) loaderModal.classList.add("hidden");
      console.error("Analysis process error:", error);
      alert("An error occurred while analyzing the interview response: " + error.message);
    }
  };
}
