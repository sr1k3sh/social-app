import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { auth ,database, storage} from "./../firebase";
import dummy from './../images/profile.png'
import './AccountDetail.scss';

function AccountDetail() {
    const [user, loading] = useAuthState(auth);
    const history = useHistory();

    const [imageAsFile, setImageAsFile] = useState('');
    const [imageAsUrl, setImageAsUrl] = useState({imgUrl: ''});

    useEffect(() => {
        if (loading) return;
        if (!user) return history.replace("/");

        const fetchProfile = async()=>{
            try{
                const db = await database.ref("users");
                db.on('value',function(snapshot){
                    snapshot.forEach(snap=>{
                        if(snap.val().uid === user.uid){
                            setImageAsUrl({imgUrl:snap.val().imgUrl});
                        }
                    });
                });
            }
            catch(err){
                console.log(err);
            }
        }

        fetchProfile();

    }, [user, loading, history]);

    const fetchUserData = async(url) => {
        try{
            const db = await database.ref("users");
            db.on('value',function(snapshot){
                snapshot.forEach(snap=>{
                    if(snap.val().uid === user.uid){
                        database.ref('users/'+snap.getRef().getKey()).update({
                            imgUrl:url
                        });
                    }
                });
            });
        }
        catch(err){
            console.log(err);
        }

    }

    const onFileupload = (e) =>{
        e.preventDefault();
        const image = e.target.files[0]
        setImageAsFile(imageFile => (image))
    }

    const handleSubmit = (e) =>{
        e.preventDefault();
        if(imageAsFile === '') {
            console.error(`not an image, the image file is a ${typeof(imageAsFile)}`)
        }
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
                 console.log(fireBaseUrl)
               setImageAsUrl(prevObject => ({...prevObject, imgUrl: fireBaseUrl}));
               fetchUserData(fireBaseUrl);
            });
        });
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
        <div className="col-xxl-12">
            <form onSubmit={handleSubmit}>
                <div className="account-section__image-wrapper">
                    <img className="account-section__image" src={imageAsUrl.imgUrl?imageAsUrl.imgUrl:dummy} alt="profile detail"></img>
                    <label htmlFor="change-profile-pic">change profile pic</label>
                    <input className="account-section__hidden" id="change-profile-pic" type="file" onChange={onFileupload}></input>
                </div>
                {/* <div>
                    <label className="form-label">Email address</label>
                    <input className="form-control"></input>
                </div>
                <div>
                    <label className="form-label">Full name</label>
                    <input className="form-control"></input>
                </div> */}
                <button type="submit" className="btn btn-primary">submit</button>
            </form>
        </div>
        </div>
    );
}

export default AccountDetail;
