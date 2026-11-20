// Shared Firebase setup. Put the admin email(s) here AND in firestore.rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const ADMIN_EMAILS = ["ahmedmohyanz@gmail.com"];
const app = initializeApp({
  apiKey: "AIzaSyBS_05s62mYlD0OWOiTDQhqvjU8EJewId8",
  authDomain: "rosa-perfume.firebaseapp.com",
  projectId: "rosa-perfume",
  storageBucket: "rosa-perfume.firebasestorage.app",
  messagingSenderId: "1012584479005",
  appId: "1:1012584479005:web:13662c0c0f755974ff89f4",
  measurementId: "G-E77ZRGBQNS"
});
export const auth = getAuth(app);
// Long polling avoids requests that hang forever on some phones/networks.
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
export const isAdmin = (u) => !!u && ADMIN_EMAILS.map(e => e.toLowerCase()).includes((u.email || "").toLowerCase());
