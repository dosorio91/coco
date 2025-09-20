// Firebase core & services
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyA8OhEWaZSHfxhNnxltu2n8RgyvglmpTGc",
	authDomain: "fenix-c5aa7.firebaseapp.com",
	projectId: "fenix-c5aa7",
	storageBucket: "fenix-c5aa7.appspot.com",
	messagingSenderId: "119500576214",
	appId: "1:119500576214:web:58d246fe56d587999a4077",
	measurementId: "G-5SWWCQDSTC"
};

// Prevent re-initialization in Next.js hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
