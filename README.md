# ✨ PrepRoom

### Practice Smarter. Interview Better.

> An AI-powered interview practice platform that provides instant feedback, scoring, and personalized suggestions to help users improve their interview performance.

🔗 **[Live Demo](https://sathvika-3101.github.io/AI-Interview_Analyzer/)**

---

## 📌 About the Project

**PrepRoom** is a web-based AI interview practice platform designed to help students and job seekers prepare for technical and professional interviews.

Users can submit their interview answers and receive AI-generated feedback on **technical accuracy, relevance, clarity, communication, confidence, and overall response quality**.

The platform also allows users to review previous interviews and track their performance over time.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🔐 **Google Authentication** | Secure sign-in using Firebase Authentication |
| 🤖 **AI Evaluation** | Analyze interview answers using Gemini 2.5 Flash |
| 📊 **Performance Scoring** | Get an overall score with detailed evaluation |
| 📝 **Detailed Feedback** | Identify strengths, weaknesses, and areas for improvement |
| 📚 **Interview History** | Access previously evaluated interview responses |
| 📈 **Analytics** | Track interview performance and progress |
| 👤 **User Profile** | Manage your profile and API configuration |
| 🔗 **Report Sharing** | Share generated interview reports |
| 🌐 **Live Deployment** | Hosted using GitHub Pages |

---

## ⚙️ How It Works

```text
User
  │
  ▼
Google Authentication
  │
  ▼
Enter Interview Question + Answer
  │
  ▼
PrepRoom
  │
  ▼
Gemini 2.5 Flash
  │
  ▼
AI Evaluation
  │
  ├── Overall Score
  ├── Strengths
  ├── Weaknesses
  ├── Feedback
  └── Recommendations
  │
  ▼
History & Analytics

## 🧠 AI Evaluation

PrepRoom analyzes interview responses across key areas to provide meaningful and actionable feedback.

### Evaluation Criteria

- **Technical Accuracy** — Checks the correctness and depth of the response.
- **Relevance** — Measures how well the answer addresses the question.
- **Clarity** — Evaluates how clearly the ideas are explained.
- **Communication** — Reviews the effectiveness and quality of expression.
- **Confidence** — Assesses the confidence reflected in the response.
- **Structure** — Evaluates the organization and logical flow of the answer.

The evaluation produces an overall score along with strengths, areas for improvement, and personalized recommendations.

---

## 🛠️ Technology Stack

**Frontend**

`HTML5` · `CSS3` · `JavaScript` · `Tailwind CSS`

**Backend & Services**

`Firebase Authentication` · `Cloud Firestore` · `Gemini 2.5 Flash API`

**Deployment & Development**

`GitHub Pages` · `GitHub Actions` · `Git` · `Visual Studio Code`

---

## 🏗️ Architecture

```text
                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │      PrepRoom       │
                    │    Web Interface    │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │ Firebase Auth   │         │ Gemini 2.5 Flash│
        │  Authentication │         │       API       │
        └────────┬────────┘         └────────┬────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Cloud Firestore   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ History & Analytics │
                    └─────────────────────┘

---

## 📁 Project Structure

```text
AI-Interview_Analyzer/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── css/
│   └── styles.css
│
├── js/
│   ├── app.js
│   ├── ai-service.js
│   ├── config.js
│   ├── firebase-service.js
│   ├── router.js
│   └── views/
│       ├── landing.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── analyzer.js
│       ├── history.js
│       ├── analytics.js
│       ├── profile.js
│       └── results.js
│
├── index.html
└── README.md

---

## 🔐 Security & Data Protection

PrepRoom uses **Firebase Authentication** to manage user accounts and **Cloud Firestore security rules** to protect user-specific interview data.

Each interview record is associated with the authenticated user, helping ensure that users can access only their own interview data.

> **Note:** API keys and other sensitive credentials should never be committed directly to the repository.

💻 Getting Started
1. Clone the repository
git clone https://github.com/sathvika-3101/AI-Interview_Analyzer.git

2. Navigate to the project
cd AI-Interview_Analyzer

3. Open in VS Code
code .

4. Run locally
Use a local development server such as VS Code Live Server to launch the application.
Firebase and Gemini configuration must be properly configured before using authentication and AI evaluation locally.

## 🔮 Future Enhancements
- 🎙️ Voice-based interview practice
- 🗣️ Speech and pronunciation analysis
- 🎯 Role-specific interview questions
- 📄 Resume-based interview preparation
- 📈 Advanced performance tracking
- 💬 Personalized interview coaching
- 🏆 Progress and achievement system
---

## 🌐 Live Demo

**[Visit PrepRoom →](https://sathvika-3101.github.io/AI-Interview_Analyzer/)**

Try an interview question, receive AI-powered feedback, and track your interview performance.

---

## 👩‍💻 Author

**Jalluri Surya Sri Sathvika**

B.Tech — Computer Science and Engineering

Interested in **Software Development, Data Analytics, and AI-powered applications**.

---

## ⭐ Support

If you find **PrepRoom** useful, consider giving the repository a star on GitHub.

---

### Practice Smarter. Interview Better.
