import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js"; //para sa images sana gumana LORD

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAxpj-v5W9YN_onrP-P_meEJVoMwJUsopA",
  authDomain: "ceasfind.firebaseapp.com",
  projectId: "ceasfind",
  storageBucket: "ceasfind.firebasestorage.app",
  messagingSenderId: "721673444524",
  appId: "1:721673444524:web:5e7dfed9375b5dbed0d309",
  measurementId: "G-1FHYW39Z56"
};

const app = initializeApp(firebaseConfig);

// services
export const db = getFirestore(app);
export const auth = getAuth(app); 
export const storage = getStorage(app); // Exporting storage for image uploads