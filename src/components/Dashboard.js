import React, { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import "./Dashboard.scss";
import { auth, storage, db} from "../services/firebase";
import uniqid from 'uniqid';
import dummy from './../images/profile.png';
import upload from './../images/upload.svg';
import Navbar from "./Navbar";
import {StorySkeleton} from "./StorySkeleton";

function Dashboard(props) {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const [story , setStory] = useState();
  const [imgUrl, setImgUrl] = useState(dummy);

  const isMounted = useRef(false)

  const history = useHistory();
  const [postData, setPostData] = useState([]);

  const [textarea, setTextarea] = useState("");

  const [didMount, setDidMount] = useState(false); 

  const [localImg, setLocalImg] = useState("");

  const [imageAsFile, setImageAsFile] = useState('');

  const [sharePost, setSharePost] = useState(false);
  
  const {refPhoto,refPost} = useRef(null);

  const {imageRef} = useRef(null);

  const [getComment, setComment] = useState([]);

  const [getProfileData, setProfileData] = useState([]);

  const isPostLoader = useRef(true);

  useEffect(() => {
    if (loading) return;
    if (!user) return history.replace("/");

    isMounted.current = true;
    isPostLoader.current = true;
  
    const post = async () =>{
      try{
        await db.collection("feeds").onSnapshot(d=>{
          isPostLoader.current = false;
          setPostData(d.docs.map(m=>m.data()));
        });

      }
      catch(err){
        console.log(err);
      }
    }

    const fetchProfile = async () =>{
      try{
        await db.collection("users").onSnapshot(snap=>{
          setProfileData(snap.docs.map(m=>m.data()));
        })
      }
      catch(err){
        console.log(err);
      }
    }

    const fetchComments = async() =>{
      try{
        let comments = await db.collection('comments');
        comments.onSnapshot(c=>{
          setComment(c.docs.map(d=>d.data()))
        });
      }
      catch(err){
        console.log(err);
      }
    }

    if(isMounted.current){
      
      fetchProfile();

      setName(props.name);
      setImgUrl(props.imgUrl);
  
      fetchComments();
  
      post();
  
      setDidMount(true);
    }
    
    return () => {
      setName({}); // This worked for me
      setPostData([]);
      setStory({});
      setTextarea("");
      setDidMount(false);
      isMounted.current = false;
    };
    
  }, [user, loading, history,props]);

  if(!didMount) {
    return null;
  }

  const PostSection = async(e) =>{
    e.preventDefault();
    let id = uniqid();

    if(isMounted.current){
      try{
        e.preventDefault();
        if(imageAsFile === '') {
          await db.collection("feeds").doc("story-id-"+id).set({
            story:story,
            userId:user.uid,
            username:name,
            storyId: "story-id-"+id,
            likedArr:"",
            likedByCurrent:'',
            imgUrl:imgUrl?imgUrl:'',
            comments:[]
          });
          e.target.reset();
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
                  db.collection("feeds").doc("story-id-"+id).set({
                    story:story,
                    userId:user.uid,
                    username:name,
                    storyId: "story-id-"+id,
                    likedArr:"",
                    likedByCurrent:'',
                    imgUrl:imgUrl?imgUrl:'',
                    comments:[],
                    postImageUrl:fireBaseUrl
                  });
                  e.target.reset();
                  history.push('/');
                });
            });
        }
        
      }
      catch(err){
        console.log(err);
      }
    }
  }

  const onChange = (e) =>{
    if(isMounted.current){
      setTextarea(e.target.value);
    }
  }

  const shareComment = async(e) =>{
    e.preventDefault();

    if(isMounted.current){
      try{
        let dom = e.target;
  
        let storyName = dom.getAttribute('name');
  
        const comments = await db.collection('comments').doc('comment-'+uniqid());
        comments.set({
          textarea:textarea,
          username:name,
          userId:user.uid,
          storyId:storyName,
          imgUrl:imgUrl?imgUrl:dummy
        });
      }
      catch(err){
        console.log(err)
      }
    }

    e.target.reset();
  }

  const likeChange = async(e) =>{
    e.preventDefault();

    if(isMounted.current){
      try{
        let dom = e.target.closest(".post-section__like");
        let storyName = dom.getAttribute('name');
        if(dom.classList.contains("active")){
          dom.classList.remove('active')
        }
        else{
          dom.classList.add('active');
        }
  
        const feeds =  await db.collection('feeds').doc(storyName);
        feeds.get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            let arr = [].concat(docSnapshot.data().likedArr,user.uid);
            arr = new Set(arr);
            arr = Array.from(new Set(arr)).filter(Boolean)
            feeds.update({
              likedArr:arr,
              likedByCurrent:user.uid
            });
            const activity = db.collection("activity").doc('activity-'+uniqid());
            let obj = {
              userId: user.uid,
              likedOn: storyName,
              username: name,
              message: `${name} has liked your story`
            }
  
            activity.set(obj);
          }
        });
  
        
  
        
      }
      catch(err){
        console.log(err)
      }
    }
  }

  const handleMediaChange = (e) =>{
    e.preventDefault();
    const file = e.target.files[0];
    if(isMounted.current){
      if (file) {
        setImageAsFile(file);
        setLocalImg(URL.createObjectURL(file));
        imageRef?.current.classList.add('added')
      }
    }
  }

  const onSharePost = (e) =>{
    e.preventDefault();
    if(isMounted.current){
      setSharePost(false);
      e.target.classList.add('active');
      document.querySelector(".btn-photo").classList.remove('active');
    }
  }

  const onSharePhoto = (e) =>{
    e.preventDefault();
    if(isMounted.current){
      setSharePost(true);
      e.target.classList.add('active');
      document.querySelector(".btn-post").classList.remove('active');
    }
  }

  return (
    <React.Fragment>
      <div className="rikesh-container container-xxl">
        <Navbar isRequired={true} imgUrl={imgUrl} name={name}></Navbar>
        
        <div className="col-xxl-12 post-section">
          <div className="post-section__wrapper">
            <form className="post-section__form" onSubmit={PostSection}>
              <div className="post-section__form-element post-section__form-element--row post-section__form-element--no-border">
                <button ref={refPost} className="btn btn-outline-secondary btn-post active" onClick={onSharePost}>Share Post</button>
                <button ref={refPhoto} className="btn btn-outline-secondary btn-photo " onClick={onSharePhoto}>Share Photo</button>
              </div>
              {
                sharePost && <div className="post-section__form-element post-section__form-element--image-upload">
                  <label htmlFor="post_media" className="post-section__image-label" ref={imageRef}>
                    <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>cloud, upload, storage, memory, data</title><path d="M20.57,9.43A8,8,0,0,0,5.26,10,5,5,0,1,0,5,20h5V18H5a3,3,0,0,1,0-6,3.1,3.1,0,0,1,.79.12l1.12.31.14-1.15a6,6,0,0,1,11.74-.82l.15.54.54.16A3.46,3.46,0,0,1,22,14.5,3.5,3.5,0,0,1,18.5,18H16v2h2.5A5.48,5.48,0,0,0,20.57,9.43Z"/><polygon points="16.71 15.29 13 11.59 9.29 15.29 10.71 16.71 12 15.41 12 20 14 20 14 15.41 15.29 16.71 16.71 15.29"/></svg>
                  </label>
                  <input id="post_media" type="file" className="form-control post-section__hidden"  onChange={handleMediaChange}/>
                  <img width={300} height={300} src={localImg?localImg:upload} alt="local data"></img>
                </div>
              }
              
              <div className="post-section__form-element">
                <label htmlFor="post_area" className="post-section__hidden">Post your story</label>
                <textarea id="post_area" className="form-control" placeholder={"Hello "+ name + " what's on you mind today?"} onChange={e=>setStory(e.target.value)}></textarea>
              </div>
              <button className="btn btn-primary post-section__button" type="submit">Post</button>
            </form>

            <ul className="post-section__story-list">
              {   
                isPostLoader.current ?
                  [
                    <StorySkeleton key={uniqid()}></StorySkeleton>,
                    <StorySkeleton key={uniqid()}></StorySkeleton>,
                    <StorySkeleton key={uniqid()}></StorySkeleton>,
                    <StorySkeleton key={uniqid()}></StorySkeleton>
                  ]
                :   
                postData && postData.map((d,i)=>{
                  return <li key={i} className="post-section__story-item" id={d.storyId}>
                      <div className="post-section__avatar">
                        {
                          getProfileData && getProfileData.map((p,i)=>{
                            if(p.uid === d.userId){
                              return [ 
                                <img className="post-section__avatar-img" key={"img"+i} src={p.imgUrl?p.imgUrl:dummy} alt="avatar"></img>,
                                <Link to={"/profile/"+p.uid} key={"name"+i} className="post-section__story-user link-secondary">{p.name}</Link>
                              ]
                            }
                            return false;
                          })
                        }
                      </div>
                      <div>
                        {
                          d.postImageUrl && <img width={375} className="post-section__story-image" src={d.postImageUrl?d.postImageUrl:dummy} alt="post data"></img>
                        }
                        <p>{d.story}</p>

                      </div>
                      <div className="post-section__actions">
                        <div className="post-section__action-buttons">
                          <div className="post-section__liked-container">
                            <button className={ user && d.likedByCurrent === user.uid ? "post-section__like active":"post-section__like"} name={d.storyId} onClick={e=>likeChange(e,this)} aria-label="like">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            </button>
                            <span>{d.likedArr && d.likedArr.length}</span>
                          </div>
                          <button className="post-section__comment btn">
                            comments
                          </button>
                        </div>
                        <div className="post-section__comment-form-wrapper">
                          <ul className="post-section__comment-list">
                            {
                              getComment && getComment.map((c,i)=>{
                                if(c.storyId === d.storyId){
                                  return <li className="post-section__comment-item" key={i}>
                                    {
                                      getProfileData && getProfileData.map((p,i)=>{
                                        if(p.uid === c.userId){
                                          return <img key={i} width="24" height="24" src={p.imgUrl?p.imgUrl:dummy} alt="profile data"></img>
                                        }
                                        return false;
                                      })

                                    }
                                    <span>{c.textarea}</span>
                                  </li>
                                }
                                return false;
                              })
                            }
                          </ul>
                          <form className="post-section__comment-form" onSubmit={shareComment} name={d.storyId}>
                            <label htmlFor={"share-comment"+d.storyId}  className="post-section__comment-label post-section__hidden">submit comment</label>        
                            <textarea id={"share-comment"+d.storyId} className="post-section__comment-textarea form-control" placeholder="share comment" onChange={onChange}></textarea>
                            <button className="btn btn-outline-primary post-section__comment-button" type="submit">comment</button>
                          </form>
                        </div>
                  
                      </div>
                    </li>
                })
              }
            </ul>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Dashboard;
