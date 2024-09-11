import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "student-incentive-demo.firebaseapp.com",
  projectId: "student-incentive-demo",
  storageBucket: "student-incentive-demo.appspot.com",
  messagingSenderId: "635037364757",
  appId: "1:635037364757:web:45e3dedeb2c459799f541c",
  measurementId: "G-Y9LB8JZH58"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize Firestore database
export const db = getFirestore(app);
export const auth = getAuth()

const analytics = getAnalytics(app);
