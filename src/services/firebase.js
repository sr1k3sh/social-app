import firebase from "firebase/app";
import "firebase/auth";
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage'



const firebaseConfig = {
  apiKey: "AIzaSyA259JpoCiv8NKItvocbT7aU89-WnZ4SWE",
  authDomain: "socialmedia1-bd732.firebaseapp.com",
  projectId: "socialmedia1-bd732",
  storageBucket: "socialmedia1-bd732.appspot.com",
  messagingSenderId: "41858980286",
  appId: "1:41858980286:web:6fb88aa99a2313e9aec1ef",
  measurementId: "G-XHN911M6EY",
  // databaseURL:"https://socialmedia-24396-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const db = firebase.firestore();
const auth = app.auth();

const googleProvider = new firebase.auth.GoogleAuthProvider();

// console.log(db.collection('users').doc('0fZucWrQWgclUhFo7wPTmjWu6eD2'))

const signInWithGoogle = async () => {
  try {
    const res = await auth.signInWithPopup(googleProvider);
    const user = res.user;

    const usersRef = db.collection('users').doc(user.uid);
    usersRef.get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          console.log('user already registered')
        } else {
          // usersRef.set({...}) // create the document
          usersRef.set({
            uid:user.uid,
            name:user.displayName,
            authProvider: "google",
            email:user.email
          });
        }
    });
    
  } catch (err) {
    console.error(err);
    alert(err.message);
  }

  return null;
};

const signInWithEmailAndPassword = async (email, password) => {
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }

  return null;
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await auth.createUserWithEmailAndPassword(email, password);
    const user = res.user;
    await database.ref("users").push({
      uid:user.uid,
      name:name,
      authProvider:'local',
      email:email
    })
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
  return null;
};

const sendPasswordResetEmail = async (email) => {
  try {
    await auth.sendPasswordResetEmail(email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }

  return null;
};

const logout = () => {
  auth.signOut();
};

const storage = firebase.storage()

export {
  auth,
  signInWithGoogle,
  signInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordResetEmail,
  logout,
  database,
  storage,
  db
};
