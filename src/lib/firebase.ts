// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdz-2bJjg8zyUY30MRvQI-ZQ9UwKvizPM",
  authDomain: "gameroom-booking.firebaseapp.com",
  projectId: "gameroom-booking",
  storageBucket: "gameroom-booking.appspot.com",
  messagingSenderId: "505009384076",
  appId: "1:505009384076:web:f285d98d0f6dbd6a23a9a9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { db, auth, app };
