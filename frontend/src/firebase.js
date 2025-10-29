// src/firebase.js




// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBr9Yiry7nlZSJZFVwF4p5qd5H-4uuUZTw",
  authDomain: "event-booking-app-b207b.firebaseapp.com",
  projectId: "event-booking-app-b207b",
  storageBucket: "event-booking-app-b207b.firebasestorage.app",
  messagingSenderId: "906770363999",
  appId: "1:906770363999:web:b34a9a29ecfa189ad58dea",
  measurementId: "G-SZFF9MVCQC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);