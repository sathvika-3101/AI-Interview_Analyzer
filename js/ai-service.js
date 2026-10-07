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
 * Generate a new interview question using Gemini 2.5 Flash
 * @param {string} topic - Interview topic or role
 * @param {string} difficulty - Easy, Medium, or Hard
 * @returns {Promise<string>} Generated interview question
 */
  static async generateInterviewQuestion(
    topic,
    difficulty = "Medium",
    previousQuestion = "",
    previousAnswer = ""
  ) {
    const apiKey = ConfigManager.getGeminiApiKey();

    const hasPreviousAnswer =
      previousQuestion.trim() && previousAnswer.trim();

    const context = hasPreviousAnswer
      ? `
Previous interview question:
${previousQuestion}

Candidate's previous answer:
${previousAnswer}

Generate the NEXT question as a natural follow-up to the candidate's answer.

The new question MUST:
- Relate directly to the previous answer.
- Test a deeper or connected concept.
- Feel like a real interviewer is continuing the conversation.
- Avoid repeating the previous question.
- Do not suddenly switch to an unrelated topic.
`
      : `
This is the first question of the interview.
Start with a realistic question for the selected topic and difficulty.
`;

    const prompt = `
You are a friendly and professional technical interviewer conducting an adaptive interview.

Interview topic: ${topic}
Current difficulty: ${difficulty}

${context}

Generate exactly ONE interview question.

The question should:
- Be appropriate for a real job interview.
- Match the topic.
- Match the requested difficulty.
- Be conversational and natural.
- Encourage the candidate to explain their reasoning.
- Be concise.

Return ONLY valid JSON in this format:

{
  "question": "Your interview question here"
}
`;

    try {
      if (!apiKey) {
        return generateFallbackQuestion(topic, difficulty);
      }

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const parsed = cleanAndParseJSON(rawText);

      if (!parsed?.question) {
        throw new Error("Invalid question response from Gemini");
      }

      return parsed.question;

    } catch (error) {
      console.error("Interview question generation error:", error);

      return this.generateFallbackQuestion(topic, difficulty);
    }
  }

  /**
   * Provides a fallback question when Gemini is unavailable
   */
  static generateFallbackQuestion(topic, difficulty) {

    const fallbackQuestions = {
      Java: [
        "Can you explain the difference between method overloading and method overriding in Java?",
        "What are the main principles of object-oriented programming in Java?",
        "How does exception handling work in Java?"
      ],

      Python: [
        "What is the difference between a list and a tuple in Python?",
        "Can you explain how dictionaries work in Python?",
        "What are decorators in Python and when would you use them?"
      ],

      "Data Structures": [
        "What is the difference between a stack and a queue?",
        "How does binary search work and what is its time complexity?",
        "When would you choose a linked list over an array?"
      ],

      SQL: [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "What is normalization in a relational database?",
        "How would you find duplicate records in a SQL table?"
      ],

      "Data Analytics": [
        "How would you handle missing values in a dataset?",
        "What is the difference between correlation and causation?",
        "How would you explain an important data insight to a non-technical manager?"
      ],

      HR: [
        "Tell me about yourself.",
        "Why should we hire you?",
        "Tell me about a time you faced a difficult challenge and how you handled it."
      ]
    };

    const questions = fallbackQuestions[topic];

    if (questions) {
      return questions[
        Math.floor(Math.random() * questions.length)
      ];
    }

    return `Can you explain an important concept related to ${topic} that you have learned recently?`;
  }

  /**
 * Evaluate an answer and decide how the AI interviewer should continue
 * @param {string} question
 * @param {string} answer
 * @param {string} topic
 * @param {string} difficulty
 * @param {number} questionNumber
 * @param {number} totalQuestions
 * @returns {Promise<Object>}
 */
  static async evaluateAdaptiveInterview(
    question,
    answer,
    topic,
    difficulty = "Medium",
    questionNumber = 1,
    totalQuestions = 5
  ) {
    const apiKey = ConfigManager.getGeminiApiKey();

    const prompt = `You are PrepRoom, a friendly and supportive AI interviewer.

You are conducting a realistic mock interview.

Interview topic: ${topic}
Current difficulty: ${difficulty}
Question ${questionNumber} of ${totalQuestions}

Question asked:
"${question}"

Candidate's answer:
"${answer}"

Analyze the candidate's answer carefully.

Consider:
- Technical correctness
- Relevance to the question
- Completeness
- Communication clarity
- Confidence
- Whether the candidate needs a follow-up
- Whether the next question should become easier, stay similar, or become harder

IMPORTANT:
You are a friendly interviewer, not a strict examiner.

Your response should sound encouraging and natural.
Do not insult or discourage the candidate.
Do not reveal the evaluation process to the candidate.

Choose ONE next_action:
- "increase_difficulty"
- "same_difficulty"
- "decrease_difficulty"
- "clarify_answer"

If the answer is strong, normally increase the difficulty.
If the answer is reasonable but incomplete, normally keep the difficulty similar.
If the answer is weak or incorrect, decrease the difficulty or ask for clarification.

If next_action is "clarify_answer", next_question should be a helpful follow-up question about the same concept.

If this is the final question, set next_action to "complete_interview" and next_question to an empty string.

Return ONLY valid JSON using exactly this structure:

{
  "answer_quality": "strong",
  "score": 85,
  "interviewer_response": "Nice! That's a solid explanation. Let's take it one step further.",
  "strengths": [
    "Clearly explained the main concept"
  ],
  "improvement": "Add a practical example to make the explanation stronger.",
  "next_action": "increase_difficulty",
  "next_question": "Can you explain how this concept works in a real-world application?",
  "next_difficulty": "Hard"
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
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.6,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 700,
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));

          throw new Error(
            errData.error?.message || `API HTTP ${response.status}`
          );
        }

        const data = await response.json();

        const rawText =
          data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawText) {
          const parsed = this.cleanAndParseJSON(rawText);

          if (
            parsed &&
            typeof parsed.score === "number" &&
            parsed.next_action &&
            typeof parsed.interviewer_response === "string"
          ) {
            return parsed;
          }
        }

      } catch (error) {
        console.warn(
          "Adaptive interview evaluation failed:",
          error.message
        );
      }
    }

    // Safe fallback if Gemini is unavailable
    return this.generateAdaptiveFallback(
      question,
      answer,
      topic,
      difficulty,
      questionNumber,
      totalQuestions
    );
  }

  /**
   * Friendly fallback for adaptive interview mode
   */
  static generateAdaptiveFallback(
    question,
    answer,
    topic,
    difficulty,
    questionNumber,
    totalQuestions
  ) {
    const wordCount = answer.trim().split(/\s+/).length;

    let answerQuality = "partial";
    let score = 65;

    if (wordCount >= 80) {
      answerQuality = "strong";
      score = 85;
    } else if (wordCount < 25) {
      answerQuality = "weak";
      score = 55;
    }

    if (questionNumber >= totalQuestions) {
      return {
        answer_quality: answerQuality,
        score,
        interviewer_response:
          "Great job! You've completed the interview. Let's take a look at your overall performance.",
        strengths: [
          "You attempted the interview question."
        ],
        improvement:
          "Try to support your answers with specific examples.",
        next_action: "complete_interview",
        next_question: "",
        next_difficulty: difficulty
      };
    }

    if (answerQuality === "strong") {
      return {
        answer_quality: "strong",
        score,
        interviewer_response:
          "Nice! That's a solid answer. Let's make the next one a little more challenging.",
        strengths: [
          "Provided a detailed response."
        ],
        improvement:
          "Keep supporting your answers with practical examples.",
        next_action: "increase_difficulty",
        next_question: "",
        next_difficulty: "Hard"
      };
    }

    if (answerQuality === "weak") {
      return {
        answer_quality: "weak",
        score,
        interviewer_response:
          "No worries! You're on the right track. Let's try a simpler question.",
        strengths: [
          "You addressed the question."
        ],
        improvement:
          "Try explaining your answer with a little more detail.",
        next_action: "decrease_difficulty",
        next_question: "",
        next_difficulty: "Easy"
      };
    }

    return {
      answer_quality: "partial",
      score,
      interviewer_response:
        "Good start! Let's explore that idea a little further.",
      strengths: [
        "You identified an important part of the topic."
      ],
      improvement:
        "Adding an example would make your answer stronger.",
      next_action: "same_difficulty",
      next_question: "",
      next_difficulty: difficulty
    };
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
