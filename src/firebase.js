// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoXfkxACJgQ13LKAKpiDX2zu4Pq2i9vJ4",
  authDomain: "divelog-b2e61.firebaseapp.com",
  projectId: "divelog-b2e61",
  storageBucket: "divelog-b2e61.firebasestorage.app",
  messagingSenderId: "290570652766",
  appId: "1:290570652766:web:8a127b77b47fd518f8b8cf",
  measurementId: "G-D6X1MYJHX8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
