// FIX: The user reported an error "Module 'firebase/app' has no exported member 'initializeApp'".
// Changed from a named import to a namespace import for firebase/app to resolve the module resolution error.
import * as firebase from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 사용자께서 제공해주신 Firebase 프로젝트 설정 값입니다.
const firebaseConfig = {
  apiKey: "AIzaSyAQIGjniKFtc02aG3zWsecqd5mbwQJk-2o",
  authDomain: "hyeyum-903f5.firebaseapp.com",
  projectId: "hyeyum-903f5",
  storageBucket: "hyeyum-903f5.appspot.com",
  messagingSenderId: "307037424858",
  appId: "1:307037424858:web:ce08a4efe98075fabea9e3",
  measurementId: "G-0ST340KVL8"
};

// Firebase 앱을 초기화합니다.
const app = firebase.initializeApp(firebaseConfig);

// 다른 파일에서 사용할 수 있도록 Firestore 데이터베이스와 Auth 서비스를 내보냅니다.
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
