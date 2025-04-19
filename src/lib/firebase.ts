import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDUUOq1tC55glGr45dLo8T2nuD_-ELLWXc",
  authDomain: "app-l-m-primer-etapa.firebaseapp.com",
  projectId: "app-l-m-primer-etapa",
  storageBucket: "app-l-m-primer-etapa.firebasestorage.app",
  messagingSenderId: "632233436576",
  appId: "1:632233436576:web:e49ad8a9122701b38430c5",
  measurementId: "G-6P8GLWGBY8"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
