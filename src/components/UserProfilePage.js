import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../services/firebase";
import {useParams} from 'react-router-dom';
import Navbar from "./Navbar";
import logo from './../images/logo.png'
function UserProfilePage(){

    let { id } = useParams();
    const isMounted = useRef(false);
    const [user,loading] = useAuthState(auth);

    const [getProfileData,setProfileData] = useState({});
    const [fullname, setFullName] = useState('');
    const [imageAsUrl, setImageAsUrl] = useState({imgUrl: ''});

    useEffect(()=>{
        isMounted.current = true;

        const fetchCurrentProfile = async()=>{
            try{
                const usersRef = db.collection('users').doc(user.uid);
                usersRef.get()
                .then((docSnapshot) => {
                    if (docSnapshot.exists) {
                        setFullName(docSnapshot.data().name);
                        setImageAsUrl({imgUrl:docSnapshot.data().imgUrl});
                    }
                });
            }
            catch(err){
                console.log(err);
            }
        }

        const fetchProfile = async () =>{
            try{
                db.collection("users").doc(id).get().then(snap=>{
                    setProfileData(snap.data());
                })
            }
            catch(err){
              console.log(err);
            }
        }
        if(isMounted.current){
            fetchProfile();
            fetchCurrentProfile();
        }
        
        return ()=>{
            isMounted.current = false;
            setProfileData({});
        }
    },[user,loading,id]);
    
    return(
        <div className="rikesh-container container-xxl">
            <Navbar isRequired={true} name={fullname} imgUrl={imageAsUrl.imgUrl?imageAsUrl.imgUrl:logo}></Navbar>
            <div className="profile-page">
                <div className="profile-page__header">
                    {
                        <img className="profile-page__display-image" width={200} height={200} src={getProfileData.imgUrl? getProfileData.imgUrl : logo} alt="profile"></img>
                    }
                    <div>
                        <h2>{getProfileData.name}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;