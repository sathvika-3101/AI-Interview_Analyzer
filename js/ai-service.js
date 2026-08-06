/**
 * AI Integration Service powering Gemini 2.5 Flash REST API
 * Evaluates candidate responses with structured feedback
 */

import { ConfigManager } from "./config.js";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export class AIService {
  /**
   * Analyze interview answer with Gemini 2.5 Flash
   * @param {string} question 
   * @param {string} answer 
   * @returns {Promise<Object>} Structured Evaluation JSON
   */
  static async analyzeInterview(question, answer) {
    const apiKey = ConfigManager.getGeminiApiKey();

    const systemPrompt = `You are a Senior Technical Interviewer and Hiring Specialist.
Analyze the candidate's interview answer thoroughly and objectively.

Interview Question: "${question}"
Candidate Answer: "${answer}"

Evaluate the response across technical correctness, communication clarity, grammar, and projected confidence.
Provide constructive, actionable feedback and an exemplary improved STAR-method formatted response.

You MUST return ONLY valid JSON matching this exact structure with no surrounding markdown formatting or additional prose:
{
  "overall_score": 85,
  "grammar_score": 90,
  "communication_score": 80,
  "technical_accuracy": 88,
  "confidence_score": 82,
  "strengths": [
    "Specific example highlighted",
    "Clear problem statement"
  ],
  "weaknesses": [
    "Could provide quantitative metrics",
    "Pacing could be tighter"
  ],
  "missing_topics": [
    "Edge-case handling",
    "System scalability considerations"
  ],
  "improved_answer": "In my previous role, I addressed this by...",
  "interview_tips": [
    "Structure your answers using Situation, Task, Action, Result (STAR).",
    "Always state concrete business impact numbers when summarizing outcomes."
  ]
}`;

    if (apiKey) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn("Gemini API Error:", errData);
          throw new Error(errData.error?.message || `API HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          const parsed = this.cleanAndParseJSON(rawText);
          if (parsed && typeof parsed.overall_score === 'number') {
            return parsed;
          }
        }
      } catch (err) {
        console.warn("Gemini Live API call failed, using intelligent analyzer fallback:", err.message);
      }
    }

    // Intelligent Fallback Generator if API key missing or request throttled
    return this.generateSmartFallback(question, answer);
  }

  /**
   * Safely strip markdown codeblocks and parse JSON
   */
  static cleanAndParseJSON(raw) {
    try {
      let cleaned = raw.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
      }
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON response:", e, raw);
      return null;
    }
  }

  /**
   * Generates analytical realistic feedback if API key is in demo mode
   */
  static generateSmartFallback(question, answer) {
    const wordCount = answer.trim().split(/\s+/).length;
    const isTech = /code|system|database|api|architecture|react|node|algorithm|design|scale|sql/i.test(question + answer);
    
    let baseScore = Math.min(95, Math.max(55, 60 + Math.round(wordCount / 4)));
    if (wordCount < 20) baseScore = 50;

    const techScore = isTech ? Math.min(98, baseScore + 6) : baseScore - 4;
    const commScore = Math.min(95, baseScore + 3);
    const gramScore = Math.min(96, baseScore + 5);
    const confScore = Math.min(92, baseScore - 2);

    const overall = Math.round((techScore + commScore + gramScore + confScore) / 4);

    return {
      overall_score: overall,
      grammar_score: gramScore,
      communication_score: commScore,
      technical_accuracy: techScore,
      confidence_score: confScore,
      strengths: [
        "Directly addresses key core points of the question.",
        "Maintains professional tone throughout the explanation.",
        wordCount > 50 ? "Provides sufficient detail and context." : "Concise and to the point."
      ],
      weaknesses: [
        wordCount < 40 ? "Answer is slightly brief; consider expanding on key actions taken." : "Could further structure using the STAR method (Situation, Task, Action, Result).",
        "Could include specific quantifiable impact (e.g., % improvement, latency reduction)."
      ],
      missing_topics: [
        "Trade-offs considered during technical decision-making.",
        "Error handling, monitoring, or post-mortem reflections."
      ],
      improved_answer: `Here is a refined version of your answer using the STAR framework:

"When faced with this scenario, my primary goal was to deliver a resilient solution while maintaining team alignment. 

Situation & Task: In my project, we needed to tackle ${question.slice(0, 40)}...
Action: I analyzed the core requirements, collaborated with senior engineers, and implemented: ${answer.slice(0, 100)}...
Result: This approach successfully eliminated bottleneck issues, improved system stability, and delivered the feature on schedule with positive feedback."`,
      interview_tips: [
        "Structure long answers: Start with a 1-sentence summary, then detail Situation, Action, and Business Impact.",
        "Quantify achievements whenever possible (e.g., 'reduced load time by 35%').",
        "Pause briefly before answering to collect thoughts rather than using filler words."
      ],
      isDemoMode: true
    };
  }
}
