import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyZ2tufHNuQQRgu75X_Q8fN18IaiGfpkM",
  authDomain: "flowly-68e8f.firebaseapp.com",
  projectId: "flowly-68e8f",
  storageBucket: "flowly-68e8f.firebasestorage.app",
  messagingSenderId: "773900346527",
  appId: "1:773900346527:web:fe962ea38dd83f1428eeaa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth};