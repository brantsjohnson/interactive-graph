import { initializeApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKnoHNtc30ErcdqjjLhlW7jqrsgPy6GhI",
  authDomain: "interactive-graph-b845f.firebaseapp.com",
  projectId: "interactive-graph-b845f",
  storageBucket: "interactive-graph-b845f.firebasestorage.app",
  messagingSenderId: "648366577340",
  appId: "1:648366577340:web:4a94b0a5afbfbe5996a2b9",
  measurementId: "G-FD1G1HXWXG",
  databaseURL: "https://interactive-graph-b845f-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export both the app and the database URL
export const FIREBASE_DB_URL = firebaseConfig.databaseURL;
export default app; 