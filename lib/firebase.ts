
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// This will be initialized with the user's provided config
let db: any = null;

export const initializeFirebase = (config: any) => {
  try {
    const app = initializeApp(config);
    db = getFirestore(app);
    return db;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return null;
  }
};

export const syncStateToCloud = async (projectId: string, state: any) => {
  if (!db || !projectId) return;
  try {
    const docRef = doc(db, "linkfes_projects", projectId);
    await setDoc(docRef, state, { merge: true });
  } catch (error) {
    console.error("Error syncing to cloud:", error);
  }
};

export const subscribeToCloudState = (projectId: string, callback: (state: any) => void) => {
  if (!db || !projectId) return () => {};
  const docRef = doc(db, "linkfes_projects", projectId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  });
};
