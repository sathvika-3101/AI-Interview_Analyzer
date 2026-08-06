/**
 * Firebase Authentication & Firestore Service
 * Uses Firebase Modular v10 SDK via CDN with Local Fallback
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { ConfigManager } from "./config.js";

let app;
let auth;
let db;
let isFirebaseActive = false;

// Initialize Firebase SDK
export function initFirebase() {
  try {
    const config = ConfigManager.getFirebaseConfig();
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseActive = true;
    console.log("🔥 Firebase initialized successfully.");
  } catch (err) {
    console.warn("⚠️ Firebase init failed or running in demo mode. Falling back to client state.", err.message);
    isFirebaseActive = false;
  }
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

export async function registerWithEmail(name, email, password) {
  if (isFirebaseActive) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      
      let emailSent = false;
      try {
        await sendEmailVerification(user);
        emailSent = true;
        console.log("✉️ Email verification sent to:", email);
      } catch (verr) {
        console.warn("Could not send email verification automatically:", verr.message);
      }

      // Create user record in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
        totalInterviews: 0,
        highestScore: 0,
        avgScore: 0
      });

      return { success: true, user, emailVerificationSent: emailSent };
    } catch (error) {
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid') {
        const mockUser = createMockUser(name, email);
        ConfigManager.setLocalUser(mockUser);
        return { success: true, user: mockUser, isMock: true, emailVerificationSent: true };
      }
      throw error;
    }
  } else {
    const mockUser = createMockUser(name, email);
    ConfigManager.setLocalUser(mockUser);
    return { success: true, user: mockUser, isMock: true, emailVerificationSent: true };
  }
}

export async function loginWithEmail(email, password) {
  if (isFirebaseActive) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return { 
        success: true, 
        user, 
        emailVerified: user.emailVerified 
      };
    } catch (error) {
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid') {
        const mockUser = createMockUser(email.split('@')[0], email);
        ConfigManager.setLocalUser(mockUser);
        return { success: true, user: mockUser, isMock: true, emailVerified: true };
      }
      throw error;
    }
  } else {
    const mockUser = createMockUser(email.split('@')[0], email);
    ConfigManager.setLocalUser(mockUser);
    return { success: true, user: mockUser, isMock: true, emailVerified: true };
  }
}

export async function resendVerificationEmail(userTarget = null) {
  const targetUser = userTarget || (auth ? auth.currentUser : null);
  if (!targetUser) {
    throw new Error("No active user found to send verification email.");
  }
  await sendEmailVerification(targetUser);
  return true;
}

export async function sendPasswordReset(email) {
  if (!isFirebaseActive || !auth) {
    console.log("Demo mode: simulated password reset email to", email);
    return true;
  }
  await sendPasswordResetEmail(auth, email);
  return true;
}

export async function checkEmailVerified() {
  if (isFirebaseActive && auth && auth.currentUser) {
    await reload(auth.currentUser);
    return auth.currentUser.emailVerified;
  }
  return true;
}

export async function loginWithGoogle() {
  if (isFirebaseActive) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Ensure Firestore user doc exists
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          name: user.displayName || "Interview Candidate",
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          totalInterviews: 0,
          highestScore: 0,
          avgScore: 0
        });
      }
      return { success: true, user };
    } catch (error) {
      if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid' || error.code === 'auth/popup-closed-by-user') {
        if (error.code === 'auth/popup-closed-by-user') throw error;
        const mockUser = createMockUser("Google Candidate", "candidate@example.com");
        ConfigManager.setLocalUser(mockUser);
        return { success: true, user: mockUser, isMock: true };
      }
      throw error;
    }
  } else {
    const mockUser = createMockUser("Google Candidate", "candidate@example.com");
    ConfigManager.setLocalUser(mockUser);
    return { success: true, user: mockUser, isMock: true };
  }
}

export async function logoutUser() {
  ConfigManager.setLocalUser(null);
  if (isFirebaseActive && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Signout warning:", e);
    }
  }
}

export function subscribeAuthState(callback) {
  if (isFirebaseActive && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(user);
      } else {
        const localUser = ConfigManager.getLocalUser();
        callback(localUser);
      }
    });
  } else {
    const localUser = ConfigManager.getLocalUser();
    callback(localUser);
    return () => {};
  }
}

function createMockUser(name, email) {
  return {
    uid: "mock_user_" + Date.now(),
    displayName: name || "Demo User",
    email: email || "demo@interview.ai",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    metadata: { creationTime: new Date().toLocaleDateString() }
  };
}

// ----------------------------------------------------
// FIRESTORE INTERVIEW DATA OPERATIONS
// ----------------------------------------------------

export async function saveInterviewData(userId, question, answer, aiFeedback) {
  const interviewObj = {
    userId,
    question,
    answer,
    aiFeedback,
    createdAt: new Date().toISOString(),
    timestamp: Date.now()
  };

  let savedId = null;

  if (isFirebaseActive && db) {
    try {
      const docRef = await addDoc(collection(db, "interviews"), {
        ...interviewObj,
        createdServerTime: serverTimestamp()
      });
      savedId = docRef.id;
      interviewObj.id = savedId;
      await updateUserStats(userId);
    } catch (e) {
      console.warn("Firestore save failed, saving to local storage.", e.message);
    }
  }

  if (!savedId) {
    interviewObj.id = "interview_" + Date.now();
    ConfigManager.saveLocalInterview(interviewObj);
  }

  return interviewObj;
}

export async function getUserInterviews(userId) {
  let firebaseList = [];

  if (isFirebaseActive && db && userId) {
    try {
      const q = query(
        collection(db, "interviews"), 
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        firebaseList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by newest first
      firebaseList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (e) {
      console.warn("Firestore fetch error, fallback to local storage:", e.message);
    }
  }

  const localList = ConfigManager.getLocalHistory();
  
  // Combine and deduplicate
  const combined = [...firebaseList];
  localList.forEach(item => {
    if (!combined.some(c => c.id === item.id)) {
      combined.push(item);
    }
  });

  return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

export async function deleteInterviewData(interviewId) {
  if (isFirebaseActive && db && !interviewId.startsWith("interview_")) {
    try {
      await deleteDoc(doc(db, "interviews", interviewId));
    } catch (e) {
      console.warn("Firestore delete failed:", e.message);
    }
  }
  ConfigManager.deleteLocalInterview(interviewId);
  return true;
}

export async function updateUserStats(userId) {
  const interviews = await getUserInterviews(userId);
  if (!interviews.length) return { total: 0, highest: 0, avg: 0 };

  const total = interviews.length;
  const scores = interviews.map(i => i.aiFeedback?.overall_score || 0);
  const highest = Math.max(...scores);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / total);

  if (isFirebaseActive && db && userId && !userId.startsWith("mock_")) {
    try {
      await setDoc(doc(db, "users", userId), {
        totalInterviews: total,
        highestScore: highest,
        avgScore: avg
      }, { merge: true });
    } catch (e) {
      console.warn("Could not update user stats in Firestore:", e);
    }
  }

  return { total, highest, avg };
}
