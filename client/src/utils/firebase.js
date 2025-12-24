import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

  const firebaseConfig = {
    apiKey: "AIzaSyAPdyhDFPX-v7idQRaf8ogKdW9sSRT_c2o",
    authDomain: "brandbite-bb43a.firebaseapp.com",
    projectId: "brandbite-bb43a",
    storageBucket: "brandbite-bb43a.firebasestorage.app",
    messagingSenderId: "129770247846",
    appId: "1:129770247846:web:f81ce1431064b3d8604667",
    measurementId: "G-30HPP8HZJD"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


