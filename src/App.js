import "./App.scss";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Reset from "./components/Reset";
import Dashboard from "./components/Dashboard";
import AccountDetail from "./components/AccountDetail";
import UserProfilePage from "./components/UserProfilePage";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./services/firebase";
import dummy from './images/profile.png';
import loader from './images/loader.gif';
import React, { useEffect,useRef,useState } from "react";
function App() {
  const isMounted = useRef(false);
  const [user, loading] = useAuthState(auth);
  const [name ,setName] = useState();
  const [imgUrl, setImgUrl]= useState(dummy);
  
  useEffect(()=>{
    isMounted.current = true;

    const fetchUserName = async (id) => {
      try {
        let mainUser = await user;
        const usersRef = await db.collection('users').doc(mainUser.uid);
        usersRef.get()
          .then((docSnapshot) => {
            if (docSnapshot.exists) {
              setName(docSnapshot.data().name);
              setImgUrl(docSnapshot.data().imgUrl?docSnapshot.data().imgUrl:dummy);
            } 
        });
        
      } catch (err) {
        console.error(err);
      }
    };

    if(isMounted.current){
      if(user){
        fetchUserName(user.uid);
      }
    }

    return()=>{
      setName();
      setImgUrl();
      isMounted.current = false;
    }
  },[user,loading])

  return (
    <React.Fragment>
      {
        loading ? 
          <div className="loader">
            <img src={loader} alt="loader"></img>
          </div>
        :
        <div className="app">
          <Router>
            <Switch>
              <Route exact path="/" component={Login} />
              <Route exact path="/register" component={Register}/>
              <Route exact path="/reset" component={Reset} />
              <Route exact path="/dashboard" component={() => (<Dashboard name={name} imgUrl={imgUrl} />)} />
              <Route exact path="/account" component={AccountDetail} />
              <Route exact path="/profile/:id" component={UserProfilePage}></Route>
            </Switch>
          </Router>
        </div>
      }
    </React.Fragment>
  );
}

export default App;
