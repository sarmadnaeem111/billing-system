import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVTq89H0x_KzlgxiobbCGUhdnqICsBi48",
  authDomain: "customer-abe40.firebaseapp.com",
  projectId: "customer-abe40",
  storageBucket: "customer-abe40.firebasestorage.app",
  messagingSenderId: "566208631479",
  appId: "1:566208631479:web:540f9812eceb08690cb332",
  measurementId: "G-BKJVVKWWV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app; 