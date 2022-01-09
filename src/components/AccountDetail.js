import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { useRef } from "react/cjs/react.development";
import { auth , storage ,db} from "../services/firebase";
import dummy from './../images/profile.png'
import './AccountDetail.scss';

function AccountDetail() {
    const [user, loading] = useAuthState(auth);
    const history = useHistory();

    const [imageAsFile, setImageAsFile] = useState('');
    const [imageAsUrl, setImageAsUrl] = useState({imgUrl: ''});

    const [fullname, setFullName] = useState('');
    const [email, setEmail] = useState('');

    const isMounted = useRef(false);

    useEffect(() => {
        if (loading) return;
        if (!user) return history.replace("/");

        isMounted.current = true;

        const fetchProfile = async()=>{
            try{
                const usersRef = db.collection('users').doc(user.uid);
                usersRef.get()
                .then((docSnapshot) => {
                    if (docSnapshot.exists) {
                        setImageAsUrl({imgUrl:docSnapshot.data().imgUrl});
                        setFullName(docSnapshot.data().name);
                        setEmail(docSnapshot.data().email);
                    }
                });
            }
            catch(err){
                console.log(err);
            }
        }

        if(isMounted.current){
            fetchProfile();
        }

        return () => isMounted.current = false;

    }, [user, loading, history]);

    const fetchUserData = async(url) => {
        if(isMounted.current){
            try{
                const usersRef = db.collection('users').doc(user.uid);
                usersRef.get()
                .then((docSnapshot) => {
                    if (docSnapshot.exists) {
                        usersRef.update({
                            imgUrl:url
                        });
                    }
                });
            }
            catch(err){
                console.log(err);
            }
        }

    }

    const onFileupload = (e) =>{
        e.preventDefault();
        const image = e.target.files[0]
        if(isMounted.current){
            setImageAsFile(imageFile => (image))
            setImageAsUrl({imgUrl:URL.createObjectURL(image)});
        }
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        if(isMounted.current){
            if(imageAsFile === '') {
                history.push('/');
                return;
            }
            else{
                const uploadTask = storage.ref(`/images/${imageAsFile.name}`).put(imageAsFile)
                  //initiates the firebase side uploading 
                uploadTask.on('state_changed', (snapShot) => {
                    //takes a snap shot of the process as it is happening
                    console.log(snapShot)
                    }, (err) => {
                    //catches the errors
                        console.log(err)
                    }, () => {
                    // gets the functions from storage refences the image storage in firebase by the children
                    // gets the download url then sets the image from firebase as the value for the imgUrl key:
                    storage.ref('images').child(imageAsFile.name).getDownloadURL()
                     .then(fireBaseUrl => {
                       setImageAsUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}));
                       fetchUserData(fireBaseUrl);
                       history.push('/')
                    });
                });
            }
        }
    }
 
    return (
        <div className="rikesh-nav container-xxl">
        <nav className="navbar navbar-light bg-light">
            <div className="container">
            <Link className="navbar-brand" to="/dashboard">
                <img src="./logo192.png" alt="" width="30" height="30"/>
            </Link>
            </div>
        </nav>
        <div className="col-xxl-12 account-section">
            <form className="account-section__form" onSubmit={handleSubmit}>
                <div className="account-section__image-wrapper">
                    <div>
                        <img className="account-section__image" src={imageAsUrl.imgUrl?imageAsUrl.imgUrl:dummy} alt="profile detail"></img>
                    </div>
                    <label className="account-section__label account-section__label--profile" htmlFor="change-profile-pic">change profile pic</label>
                    <input className="account-section__hidden" id="change-profile-pic" type="file" onChange={onFileupload}></input>
                </div>
                <div className="account-section__form-element">
                    <label className="form-label">Email address</label>
                    <input disabled className="form-control" defaultValue={email}></input>
                </div>
                <div className="account-section__form-element">
                    <label className="form-label">Full name</label>
                    <input disabled className="form-control" defaultValue={fullname}></input>
                </div>
                <div className="account-section__form-element account-section__form-element--button">
                    <button type="submit" className="btn btn-outline-primary">Apply changes</button>
                </div>
            </form>
        </div>
        </div>
    );
}

export default AccountDetail;
