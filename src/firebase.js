import firebase from "firebase/app";
import "firebase/auth";
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/storage'



const firebaseConfig = {
  apiKey: "AIzaSyDkbAsvsyEqJrTK-2SRgk7jfyxfS1seKzg",
  authDomain: "socialmedia-24396.firebaseapp.com",
  projectId: "socialmedia-24396",
  storageBucket: "socialmedia-24396.appspot.com",
  messagingSenderId: "239001032769",
  appId: "1:239001032769:web:7346ffda9387216d810ec0",
  measurementId: "G-MDR5LKNMX1",
  databaseURL:"https://socialmedia-24396-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = app.auth();

const googleProvider = new firebase.auth.GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const res = await auth.signInWithPopup(googleProvider);
    const user = res.user;
    const query = await database.ref('users');
    query
    .orderByChild('uid')
    .equalTo(user.uid).once("value")
    .then(snap=>{
      if(snap.exists()){
        return;  
      }
      else{
        query.push({
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
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
  storage
};
