// ── firebase.js ───────────────────────────────────────────
// Centralized Firebase initialization for S.P. Coaching Classes
import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  increment,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCKrEqQ3YhKgHhuyub5kmaeujcISPqkBS0",
  authDomain: "spcoaching-b452c.firebaseapp.com",
  projectId: "spcoaching-b452c",
  storageBucket: "spcoaching-b452c.firebasestorage.app",
  messagingSenderId: "402179818311",
  appId: "1:402179818311:web:fc61bb8ed287ce0dfe0262",
  measurementId: "G-1JRGQG3PKX"
}

// Initialize Firebase (safely singleton)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

export {
  app,
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  increment,
}
