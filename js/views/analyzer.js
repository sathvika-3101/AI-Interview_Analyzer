/**
 * Interview Analyzer View Controller
 * Handles candidate response submission, sample questions,
 * voice practice, loading feedback state, and AI analysis trigger
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

  // ==========================================
  // SAMPLE QUESTIONS
  // ==========================================

  if (samplePillsContainer) {
    samplePillsContainer.innerHTML = SAMPLE_QUESTIONS.map((item, idx) => `
      <button type="button"
        data-idx="${idx}"
        class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 border border-slate-700/60 transition flex items-center gap-1.5">

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

  // ==========================================
  // CLEAR BUTTON
  // ==========================================

  const clearBtn = document.getElementById("btn-clear-analyzer");

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      questionInput.value = "";
      answerInput.value = "";
    });
  }

  // ==========================================
  // QUESTION VOICE / TEXT-TO-SPEECH
  // ==========================================

  const speakQuestionBtn = document.getElementById("btn-speak-question");

  if (speakQuestionBtn) {
    speakQuestionBtn.addEventListener("click", () => {

      const question = questionInput.value.trim();

      if (!question) {
        alert("Please enter or select an interview question first.");
        return;
      }

      // Stop any speech that may already be playing
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(question);

      speech.lang = "en-US";
      speech.rate = 0.95;
      speech.pitch = 1;

      speech.onstart = () => {
        speakQuestionBtn.innerHTML = "🔊 Speaking...";
        speakQuestionBtn.classList.remove("bg-purple-600");
        speakQuestionBtn.classList.add("bg-green-600");
      };

      speech.onend = () => {
        speakQuestionBtn.innerHTML = "🔊 Read Question";
        speakQuestionBtn.classList.remove("bg-green-600");
        speakQuestionBtn.classList.add("bg-purple-600");
      };

      speech.onerror = () => {
        speakQuestionBtn.innerHTML = "🔊 Read Question";
        speakQuestionBtn.classList.remove("bg-green-600");
        speakQuestionBtn.classList.add("bg-purple-600");
      };

      window.speechSynthesis.speak(speech);
    });
  }

  // ==========================================
  // INTERVIEW MODE
  // ==========================================

  const userQuestionModeBtn = document.getElementById("mode-user-question");
  const aiQuestionModeBtn = document.getElementById("mode-ai-question");
  const aiInterviewOptions = document.getElementById("ai-interview-options");
  const generateQuestionBtn = document.getElementById("btn-generate-question");
  const aiTopicSelect = document.getElementById("ai-topic");
  const aiDifficultySelect = document.getElementById("ai-difficulty");

  let interviewMode = "user";

  // Adaptive AI Interview State
  let currentQuestionNumber = 0;
  let totalInterviewQuestions = 5;
  let currentInterviewTopic = "Java";
  let currentInterviewDifficulty = "Medium";
  let adaptiveInterviewActive = false;

  // User Question Mode
  if (userQuestionModeBtn) {
    userQuestionModeBtn.addEventListener("click", () => {

      interviewMode = "user";

      // Show user mode as active
      userQuestionModeBtn.classList.add(
        "border-indigo-500/50",
        "bg-indigo-600/20"
      );

      userQuestionModeBtn.classList.remove(
        "border-slate-700",
        "bg-slate-900/40"
      );

      // Reset AI mode
      if (aiQuestionModeBtn) {
        aiQuestionModeBtn.classList.remove(
          "border-indigo-500/50",
          "bg-indigo-600/20"
        );

        aiQuestionModeBtn.classList.add(
          "border-slate-700",
          "bg-slate-900/40"
        );
      }

      // Hide AI options
      if (aiInterviewOptions) {
        aiInterviewOptions.classList.add("hidden");
      }

      if (generateQuestionBtn) {
        generateQuestionBtn.classList.add("hidden");
      }
    });
  }


  // AI Interviewer Mode
  if (aiQuestionModeBtn) {
    aiQuestionModeBtn.addEventListener("click", () => {

      interviewMode = "ai";

      // Show AI mode as active
      aiQuestionModeBtn.classList.add(
        "border-indigo-500/50",
        "bg-indigo-600/20"
      );

      aiQuestionModeBtn.classList.remove(
        "border-slate-700",
        "bg-slate-900/40"
      );

      // Reset user mode
      if (userQuestionModeBtn) {
        userQuestionModeBtn.classList.remove(
          "border-indigo-500/50",
          "bg-indigo-600/20"
        );

        userQuestionModeBtn.classList.add(
          "border-slate-700",
          "bg-slate-900/40"
        );
      }

      // Show AI options
      if (aiInterviewOptions) {
        aiInterviewOptions.classList.remove("hidden");
      }

      if (generateQuestionBtn) {
        generateQuestionBtn.classList.remove("hidden");
      }
    });
  }


  // Generate AI Interview Question
  if (generateQuestionBtn) {
    generateQuestionBtn.addEventListener("click", async () => {

      const topic = aiTopicSelect ? aiTopicSelect.value : "Java";
      const difficulty = aiDifficultySelect
        ? aiDifficultySelect.value
        : "Medium";

      const previousQuestion = questionInput.value.trim();
      const previousAnswer = answerInput.value.trim();
      // Start adaptive interview
      adaptiveInterviewActive = true;
      currentQuestionNumber = 1;
      currentInterviewTopic = topic;
      currentInterviewDifficulty = difficulty;

      generateQuestionBtn.disabled = true;
      generateQuestionBtn.innerHTML = "⏳ Generating Question...";

      try {

        const generatedQuestion =
          await AIService.generateInterviewQuestion(
            topic,
            difficulty,
            previousQuestion,
            previousAnswer
          );

        // Put generated question into question box
        questionInput.value = generatedQuestion;

        // Clear previous answer
        answerInput.value = "";

        // Friendly AI interviewer voice
        speakFriendlyQuestion(generatedQuestion);

      } catch (error) {

        console.error(
          "Question generation error:",
          error
        );

        alert(
          "Unable to generate a question. Please try again."
        );

      } finally {

        generateQuestionBtn.disabled = false;
        generateQuestionBtn.innerHTML =
          "🤖 Generate Interview Question";
      }
    });
  }


  // Friendly interviewer voice
  function speakFriendlyQuestion(question) {

    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const friendlyIntro =
      "Alright! Let's try this one. Take your time and answer when you're ready.";

    const fullSpeech =
      `${friendlyIntro} ${question}`;

    const speech =
      new SpeechSynthesisUtterance(fullSpeech);

    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.pitch = 1.1;
    speech.volume = 1;

    // Try to select a natural English voice
    const voices =
      window.speechSynthesis.getVoices();

    const preferredVoice = voices.find(voice =>
      voice.lang.startsWith("en") &&
      (
        voice.name.toLowerCase().includes("natural") ||
        voice.name.toLowerCase().includes("google") ||
        voice.name.toLowerCase().includes("samantha") ||
        voice.name.toLowerCase().includes("zira")
      )
    );

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    speech.onstart = () => {
      if (generateQuestionBtn) {
        generateQuestionBtn.innerHTML =
          "🔊 Asking Question...";
      }
    };

    speech.onend = () => {
      if (generateQuestionBtn) {
        generateQuestionBtn.innerHTML =
          "🤖 Generate Interview Question";
      }
    };

    window.speechSynthesis.speak(speech);
  }

  // ==========================================
  // VOICE PRACTICE
  // ==========================================

  const voiceBtn = document.getElementById("btn-voice-practice");
  const voiceStatus = document.getElementById("voice-status");
  const voiceTimer = document.getElementById("voice-timer");

  let recognition = null;
  let isListening = false;
  let voiceSeconds = 0;
  let voiceInterval = null;
  let finalTranscript = "";

  // Check browser support
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (voiceBtn) {
      voiceBtn.disabled = true;
      voiceBtn.textContent = "🎙️ Voice Not Supported";
      voiceBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
  } else {
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isListening = true;

      voiceSeconds = 0;
      if (voiceTimer) voiceTimer.textContent = "00:00";

      if (voiceStatus) {
        voiceStatus.textContent = "🔴 Listening... Speak your answer";
        voiceStatus.classList.remove("text-slate-400");
        voiceStatus.classList.add("text-red-400");
      }

      if (voiceBtn) {
        voiceBtn.innerHTML = "⏹️ Stop Speaking";
        voiceBtn.classList.remove("bg-indigo-600");
        voiceBtn.classList.add("bg-red-600");
      }

      voiceInterval = setInterval(() => {
        voiceSeconds++;

        const minutes = String(Math.floor(voiceSeconds / 60)).padStart(2, "0");
        const seconds = String(voiceSeconds % 60).padStart(2, "0");

        if (voiceTimer) {
          voiceTimer.textContent = `${minutes}:${seconds}`;
        }
      }, 1000);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      answerInput.value =
        finalTranscript + interimTranscript;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        alert(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      } else if (event.error === "no-speech") {
        if (voiceStatus) {
          voiceStatus.textContent = "🎙️ No speech detected. Try again.";
        }
      }

      stopVoicePractice();
    };

    recognition.onend = () => {
      if (isListening) {
        stopVoicePractice();
      }
    };
  }

  function startVoicePractice() {
    if (!recognition) return;

    finalTranscript = answerInput.value.trim();

    try {
      recognition.start();
    } catch (error) {
      console.log("Speech recognition already running.");
    }
  }

  function stopVoicePractice() {
    isListening = false;

    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.log("Speech recognition already stopped.");
      }
    }

    if (voiceInterval) {
      clearInterval(voiceInterval);
      voiceInterval = null;
    }

    if (voiceStatus) {
      voiceStatus.textContent = "✅ Voice answer captured";
      voiceStatus.classList.remove("text-red-400");
      voiceStatus.classList.add("text-green-400");
    }

    if (voiceBtn) {
      voiceBtn.innerHTML = "🎙️ Start Speaking";
      voiceBtn.classList.remove("bg-red-600");
      voiceBtn.classList.add("bg-indigo-600");
    }
    if (adaptiveInterviewActive) {
      setTimeout(() => {
        processAdaptiveInterviewAnswer();
      }, 500);
    }
  }

  // ==========================================
  // ADAPTIVE AI INTERVIEW PROCESSOR
  // ==========================================

  async function processAdaptiveInterviewAnswer() {

    if (!adaptiveInterviewActive) {
      return;
    }

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
      return;
    }

    if (currentQuestionNumber > totalInterviewQuestions) {
      return;
    }

    // Show processing status
    if (voiceStatus) {
      voiceStatus.textContent = "🧠 Thinking about your answer...";
      voiceStatus.classList.remove("text-green-400");
      voiceStatus.classList.add("text-indigo-400");
    }

    try {

      const result = await AIService.evaluateAdaptiveInterview(
        question,
        answer,
        currentInterviewTopic,
        currentInterviewDifficulty,
        currentQuestionNumber,
        totalInterviewQuestions
      );

      console.log("Adaptive interview result:", result);

      // Friendly interviewer response
      if (result.interviewer_response) {
        speakInterviewerResponse(result.interviewer_response);
      }

      // Check if interview is complete
      if (
        result.next_action === "complete_interview" ||
        currentQuestionNumber >= totalInterviewQuestions
      ) {

        adaptiveInterviewActive = false;

        if (voiceStatus) {
          voiceStatus.textContent = "🎉 Interview completed!";
          voiceStatus.classList.remove("text-indigo-400");
          voiceStatus.classList.add("text-green-400");
        }

        return;
      }

      // Update difficulty
      if (result.next_difficulty) {
        currentInterviewDifficulty = result.next_difficulty;
      }

      // Move to next question
      currentQuestionNumber++;

      // Use Gemini's next question if available
      if (result.next_question) {

        questionInput.value = result.next_question;
        answerInput.value = "";

        setTimeout(() => {
          speakFriendlyQuestion(result.next_question);
        }, 1800);

        return;
      }

      // Generate a new question if Gemini didn't provide one
      const nextQuestion =
        await AIService.generateInterviewQuestion(
          currentInterviewTopic,
          currentInterviewDifficulty,
          question,
          answer
        );

      questionInput.value = nextQuestion;
      answerInput.value = "";

      setTimeout(() => {
        speakFriendlyQuestion(nextQuestion);
      }, 1800);

    } catch (error) {

      console.error("Adaptive interview error:", error);

      if (voiceStatus) {
        voiceStatus.textContent =
          "⚠️ I couldn't process that answer. Please try again.";

        voiceStatus.classList.remove("text-indigo-400");
        voiceStatus.classList.add("text-red-400");
      }
    }
  }


  // ==========================================
  // FRIENDLY INTERVIEWER RESPONSE
  // ==========================================

  function speakInterviewerResponse(message) {

    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    speech.lang = "en-US";

    // Friendly and conversational
    speech.rate = 0.9;
    speech.pitch = 1.1;
    speech.volume = 1;

    // Try to select a natural English voice
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice = voices.find(voice =>
      voice.lang.startsWith("en") &&
      (
        voice.name.toLowerCase().includes("natural") ||
        voice.name.toLowerCase().includes("google") ||
        voice.name.toLowerCase().includes("samantha") ||
        voice.name.toLowerCase().includes("zira")
      )
    );

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    window.speechSynthesis.speak(speech);
  }

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (isListening) {
        stopVoicePractice();
      } else {
        startVoicePractice();
      }
    });
  }

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================

  form.onsubmit = async (e) => {
    e.preventDefault();

    // Stop voice recording if still active
    if (isListening) {
      stopVoicePractice();
    }

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
      alert(
        "Please provide both an Interview Question and your Candidate Answer."
      );
      return;
    }

    // Show Loading Modal
    if (loaderModal) {
      loaderModal.classList.remove("hidden");
    }

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

      if (loaderText) {
        loaderText.textContent = loadingSteps[stepIdx];
      }
    }, 900);

    try {
      // Call AI Service
      const aiFeedback = await AIService.analyzeInterview(
        question,
        answer
      );

      // Save report
      const userId = currentUser ? currentUser.uid : "guest_user";

      const savedReport = await saveInterviewData(
        userId,
        question,
        answer,
        aiFeedback
      );

      clearInterval(interval);

      if (loaderModal) {
        loaderModal.classList.add("hidden");
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(savedReport);
      }

    } catch (error) {
      clearInterval(interval);

      if (loaderModal) {
        loaderModal.classList.add("hidden");
      }

      console.error("Analysis process error:", error);

      alert(
        "An error occurred while analyzing the interview response: " +
        error.message
      );
    }
  };
}
