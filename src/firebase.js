import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5iPLvCxCA3_1P1DXTQaHlq9hWarNHIH8",
  authDomain: "mundo-ancestral-a5bac.firebaseapp.com",
  projectId: "mundo-ancestral-a5bac",
  storageBucket: "mundo-ancestral-a5bac.firebasestorage.app",
  messagingSenderId: "605527483823",
  appId: "1:605527483823:web:9a7ebd895fabf401e07b5a"
};

const app = initializeApp(firebaseConfig);

// 🔥 BASE DE DATOS
export const db = getFirestore(app);