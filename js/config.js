/**
 * Configuration & Credentials Manager
 * Supports dynamic user settings with local storage fallback
 */

const STORAGE_KEYS = {
  GEMINI_API_KEY: 'ai_interview_gemini_key',
  FIREBASE_CONFIG: 'ai_interview_firebase_config',
  LOCAL_INTERVIEWS: 'ai_interview_local_history',
  LOCAL_USER: 'ai_interview_local_user'
};

// Public Firebase project configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAfHHsJbPb5x-F0H1O6nida7mLJR5JH25M",
  authDomain: "ai-interview-analyzer-c5539.firebaseapp.com",
  projectId: "ai-interview-analyzer-c5539",
  storageBucket: "ai-interview-analyzer-c5539.firebasestorage.app",
  messagingSenderId: "1032100761016",
  appId: "1:1032100761016:web:2ce855fdfc12658071134d"
};

export class ConfigManager {
  static getGeminiApiKey() {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || "";
  }

  static setGeminiApiKey(key) {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    }
  }

  static getFirebaseConfig() {
    const saved = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse saved Firebase config, using default.");
      }
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  static setFirebaseConfig(configObj) {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(configObj));
  }

  static getLocalHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_INTERVIEWS) || '[]');
    } catch (e) {
      return [];
    }
  }

  static saveLocalInterview(interview) {
    const history = this.getLocalHistory();
    history.unshift(interview); // Newest first
    localStorage.setItem(STORAGE_KEYS.LOCAL_INTERVIEWS, JSON.stringify(history));
    return history;
  }

  static deleteLocalInterview(interviewId) {
    let history = this.getLocalHistory();
    history = history.filter(item => item.id !== interviewId);
    localStorage.setItem(STORAGE_KEYS.LOCAL_INTERVIEWS, JSON.stringify(history));
    return history;
  }

  static getLocalUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_USER) || 'null');
    } catch (e) {
      return null;
    }
  }

  static setLocalUser(userObj) {
    if (userObj) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(userObj));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOCAL_USER);
    }
  }
}
