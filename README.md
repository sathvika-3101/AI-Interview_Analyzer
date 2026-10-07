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
```

---

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

### Frontend

**HTML5** · **CSS3** · **JavaScript** · **Tailwind CSS**

### Backend & Services

**Firebase Authentication** · **Cloud Firestore** · **Gemini 2.5 Flash API**

### Deployment & Development

**GitHub Pages** · **GitHub Actions** · **Git** · **Visual Studio Code**

---

## 🏗️ Architecture

PrepRoom follows a simple client-side architecture that connects the user interface with authentication, AI evaluation, and data storage services.

**User**  
↓  
**PrepRoom Web Interface**  
↓  
**Firebase Authentication** + **Gemini 2.5 Flash API**  
↓  
**Cloud Firestore**  
↓  
**Interview History & Analytics**

### Main Components

- **Frontend** — Provides the landing page, dashboard, interview analyzer, history, analytics, profile, and evaluation views.
- **Firebase Authentication** — Handles Google sign-in and authenticated user sessions.
- **Gemini 2.5 Flash** — Evaluates interview responses and generates personalized feedback.
- **Cloud Firestore** — Stores user profiles and interview records.
- **GitHub Pages** — Hosts the deployed application.

---

## 📁 Project Structure

### Core Files

- **`index.html`** — Main application entry point
- **`README.md`** — Project documentation

### Styles

- **`css/styles.css`** — Application styling and responsive UI

### JavaScript

- **`js/app.js`** — Application initialization and view management
- **`js/ai-service.js`** — Gemini AI integration and response evaluation
- **`js/config.js`** — Application configuration
- **`js/firebase-service.js`** — Firebase Authentication and Firestore operations
- **`js/router.js`** — Application routing

### Application Views

- **`landing.js`** — Landing page
- **`auth.js`** — Authentication interface
- **`dashboard.js`** — User dashboard
- **`analyzer.js`** — Interview answer analysis
- **`history.js`** — Previous interview records
- **`analytics.js`** — Performance analytics
- **`profile.js`** — User profile and API key settings
- **`results.js`** — AI evaluation report

### Deployment

- **`.github/workflows/deploy.yml`** — Automated GitHub Pages deployment using GitHub Actions

---

## 🔐 Security & Data Protection

PrepRoom uses **Firebase Authentication** to manage user accounts and **Cloud Firestore security rules** to protect user-specific interview data.

Each interview record is associated with the authenticated user, helping ensure that users can access only their own interview data.

> **Note:** API keys and other sensitive credentials should never be committed directly to the repository.

---

## 💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sathvika-3101/AI-Interview_Analyzer.git
cd AI-Interview_Analyzer
```

### 2. Open the Project

Open the project folder in **Visual Studio Code**.

```bash
code .
```

### 3. Run Locally

Launch the application using a local development server such as **VS Code Live Server**.

> Firebase Authentication, Cloud Firestore, and Gemini API configuration are required for the complete application experience.

---

## 🔮 Future Enhancements

- Voice-based interview practice
- Speech and pronunciation analysis
- Role-specific interview preparation
- Resume-based interview questions
- Advanced performance analytics
- Personalized interview coaching
- Progress and achievement tracking

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
