// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRGsUohHdwkWVJAddENZxjjT0hnUbC5_A",
  authDomain: "cyberinterpret-3022a.firebaseapp.com",
  projectId: "cyberinterpret-3022a",
  storageBucket: "cyberinterpret-3022a.firebasestorage.app",
  messagingSenderId: "571224405899",
  appId: "1:571224405899:web:22c7a5dba24243fcc6618e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);