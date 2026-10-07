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

🧠 AI Evaluation
PrepRoom evaluates interview responses across multiple dimensions:
- Technical Accuracy – correctness of the answer
- Relevance – how well the response addresses the question
- Clarity – how clearly the idea is communicated
- Communication – quality and effectiveness of expression
- Confidence – confidence reflected in the response
- Structure – organization and flow of the answer
The system generates an overall score along with actionable recommendations for improvement.

🛠️ Tech Stack
Frontend
- HTML5
- CSS3
- JavaScript
- Tailwind CSS
Backend & Services
- Firebase Authentication
- Cloud Firestore
- Google Gemini 2.5 Flash API
Deployment & Tools
- GitHub Pages
- GitHub Actions
- Git
- Visual Studio Code
🏗️ Project Architecture
                    ┌─────────────────┐
                    │      User       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    PrepRoom     │
                    │   Web Interface │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌─────────────────┐           ┌─────────────────┐
     │ Firebase Auth   │           │ Gemini 2.5      │
     │                 │           │ Flash API       │
     └────────┬────────┘           └────────┬────────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Cloud Firestore │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ History &       │
                    │ Analytics       │
                    └─────────────────┘

📁 Project Structure
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
│   │
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
├── package-lock.json
└── README.md

🔐 Security
PrepRoom uses Firebase Authentication and Cloud Firestore security rules to manage authenticated users and protect user-specific interview data.
API keys and sensitive credentials should never be committed directly to the repository.
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

🔮 Future Enhancements
- 🎙️ Voice-based interview practice
- 🗣️ Speech and pronunciation analysis
- 🎯 Role-specific interview questions
- 📄 Resume-based interview preparation
- 📈 Advanced performance tracking
- 💬 Personalized interview coaching
- 🏆 Progress and achievement system
🌐 Live Demo
🚀 Try PrepRoom
Practice your answers, receive AI feedback, and improve your interview performance.
👩‍💻 Author
Sathvika
B.Tech – Computer Science and Engineering
Interested in Software Development, Data Analytics, and AI-powered applications.
⭐ Support
If you find PrepRoom useful, consider giving the repository a ⭐ on GitHub.
✨ Practice Smarter. Interview Better.

**That's the complete file.** Copy from `# ✨ PrepRoom` all the way down to `### ✨ Practice Smarter. Interview Better.` and paste it into GitHub's README editor.

Then commit with:

**Commit message:** `Improve README documentation`

**Commit directly to `main`** → **Commit changes**.
