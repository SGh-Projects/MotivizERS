import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD99CJlncT7I-NvKdEpy_NpomZ3dF31wVc",
  authDomain: "student-incentive-8215m.firebaseapp.com",
  projectId: "student-incentive-8215m",
  storageBucket: "student-incentive-8215m.appspot.com",
  messagingSenderId: "404956497165",
  appId: "1:404956497165:web:e0ad13290b5518ffa29c44",
  measurementId: "G-N3JZ9DFQM6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initialize Firestore database
export const db = getFirestore(app);
export const auth = getAuth()

const analytics = getAnalytics(app);
