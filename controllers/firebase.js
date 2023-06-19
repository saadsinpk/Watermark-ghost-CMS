
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApTs_tiTg427W-PqbQOjVR_bRl-_j_CPc",
  authDomain: "wartermark-a4664.firebaseapp.com",
  projectId: "wartermark-a4664",
  storageBucket: "wartermark-a4664.appspot.com",
  messagingSenderId: "910542815823",
  appId: "1:910542815823:web:7feaba5d2ea7b261f9603a",
  measurementId: "G-EVTGBFTXW0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default firebaseConfig