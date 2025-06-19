import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCluRZqyfHyhH8peLpEC1pKAbyRE9iqNr0",
  authDomain: "flowpizzeria.firebaseapp.com",
  projectId: "flowpizzeria",
  storageBucket: "flowpizzeria.appspot.com",
  messagingSenderId: "123647443274",
  appId: "1:123647443274:web:2d55464a8c84bd924b81b3",
  measurementId: "G-LQDRRWEL2X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db }; 