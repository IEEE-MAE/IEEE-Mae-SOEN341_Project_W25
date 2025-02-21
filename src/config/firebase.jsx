import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "@firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhB-hFKYc2LDT3MqAVhFLtMJP2EziNFUk",
    authDomain: "chathaven-70700.firebaseapp.com",
    projectId: "chathaven-70700",
    storageBucket: "chathaven-70700.firebasestorage.app",
    messagingSenderId: "439127873677",
    appId: "1:439127873677:web:7275bb564bd6a84e786ac4"
};

// Initialize Firebase, Authentication, Firestore
export const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const FIREBASE_FIRESTORE = getFirestore(FIREBASE_APP);

// export authentication and firestore as easy-to-use constants
export const auth = FIREBASE_AUTH;
export const db = FIREBASE_FIRESTORE;
