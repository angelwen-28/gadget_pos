// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyClvPouLMqbfBjJcGBNjBpzjIu2S71U4lU",
  authDomain: "gadgetpos-28.firebaseapp.com",
  projectId: "gadgetpos-28",
  storageBucket: "gadgetpos-28.firebasestorage.app",
  messagingSenderId: "74731572266",
  appId: "1:74731572266:web:fa61352e36087882d5c753",
  measurementId: "G-MHTEWR6L16"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
