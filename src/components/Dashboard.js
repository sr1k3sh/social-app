import React, { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import "./Dashboard.scss";
import { auth, logout, storage, db} from "../services/firebase";
import uniqid from 'uniqid';
import dummy from './../images/profile.png'

function Dashboard() {
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

  const [sharePost, setSharePost] = useState(true);
  
  const {refPhoto,refPost} = useRef(null);

  const {imageRef} = useRef(null);

  const [getActivity, setActivity] = useState([]);

  const [getComment, setComment] = useState([]);

  const [getProfileData, setProfileData] = useState([]);
 
  useEffect(() => {
    if (loading) return;
    if (!user) return history.replace("/");

    isMounted.current = true;

    const fetchUserName = async (id) => {
      try {
        const usersRef = await db.collection('users').doc(user.uid);
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

  
    const post = async () =>{
      try{
        await db.collection("feeds").onSnapshot(d=>{
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
  
      fetchUserName(user.id);
  
      fetchComments();
  
      post();
  
      db.collection('activity').onSnapshot(snap=>{
        setActivity(snap.docs.map(s=>s.data()))
      });
  
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
    
  }, [user, loading, history]);

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
          })
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
                  })
                });
            });
        }
        
        e.target.reset();
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
    <div className="rikesh-nav container-xxl">
      <nav className="navbar navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/dashboard">
            <img src="./logo192.png" alt="test" width="30" height="30"/>
          </Link>
          <div className="rikesh-nav__actions">
            <div className="dropdown">
              <button className="btn rikesh-nav__notification-wrapper dropdown-toogle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg version="1.1" id="Icons" x="0px" y="0px"
                    viewBox="0 0 32 32">
                  <path className="st1" d="M26,21.5L25,20c-1.6-2.4-2.4-5.3-2.4-8.2c0-3.1-2-5.7-4.7-6.5C17.6,4.5,16.8,4,16,4s-1.6,0.5-1.9,1.3
                    c-2.7,0.8-4.7,3.4-4.7,6.5c0,2.9-0.8,5.8-2.4,8.2l-1,1.5c-0.4,0.7,0,1.5,0.8,1.5h18.3C25.9,23,26.4,22.1,26,21.5z"/>
                  <path className="st1" d="M19,26c0,1.7-1.3,3-3,3s-3-1.3-3-3"/>
                  </svg>
              </button>
              <ul className="dropdown-menu dropdown-menu-start dropdown-menu-lg-start dropdown-menu-sm-start" aria-labelledby="dropdownMenuButton2">
                {
                  user && getActivity && getActivity.filter(f=>f.userId !== user.uid).map((g,i)=>{
                    return <li key={i}><Link className="link-secondary" to="/">{g.message}</Link></li>
                  })
                }
              </ul>
            </div>
            <img className="rikesh-nav__img" width={32} height={32} src={imgUrl} alt="nav data"></img>
            <div> welcome {name}</div>
            <button className="dashboard__btn btn btn-primary" onClick={logout}>
              Logout
            </button>
            <div className="dropdown">
              <button className="btn rikesh-nav__settings dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                <svg enableBackground="new 0 0 32 32" id="Editable-line" version="1.1" viewBox="0 0 32 32"><circle cx="16" cy="16" fill="none" id="XMLID_224_" r="4" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"/><path d="  M27.758,10.366l-1-1.732c-0.552-0.957-1.775-1.284-2.732-0.732L23.5,8.206C21.5,9.36,19,7.917,19,5.608V5c0-1.105-0.895-2-2-2h-2  c-1.105,0-2,0.895-2,2v0.608c0,2.309-2.5,3.753-4.5,2.598L7.974,7.902C7.017,7.35,5.794,7.677,5.242,8.634l-1,1.732  c-0.552,0.957-0.225,2.18,0.732,2.732L5.5,13.402c2,1.155,2,4.041,0,5.196l-0.526,0.304c-0.957,0.552-1.284,1.775-0.732,2.732  l1,1.732c0.552,0.957,1.775,1.284,2.732,0.732L8.5,23.794c2-1.155,4.5,0.289,4.5,2.598V27c0,1.105,0.895,2,2,2h2  c1.105,0,2-0.895,2-2v-0.608c0-2.309,2.5-3.753,4.5-2.598l0.526,0.304c0.957,0.552,2.18,0.225,2.732-0.732l1-1.732  c0.552-0.957,0.225-2.18-0.732-2.732L26.5,18.598c-2-1.155-2-4.041,0-5.196l0.526-0.304C27.983,12.546,28.311,11.323,27.758,10.366z  " fill="none" id="XMLID_242_" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"/></svg>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                <li><Link className="dropdown-item" to="/account">Edit Account</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="col-xxl-12 post-section">
        <div className="post-section__wrapper">
          <form className="post-section__form" onSubmit={PostSection}>
            <div className="post-section__form-element post-section__form-element--row">
              <button ref={refPost} className="btn btn-outline-secondary btn-post" onClick={onSharePost}>Share Post</button>
              <button ref={refPhoto} className="btn btn-outline-secondary btn-photo active" onClick={onSharePhoto}>Share Photo</button>
            </div>
            {
              sharePost && <div className="post-section__form-element post-section__form-element--image-upload">
                <label htmlFor="post_media" className="post-section__image-label" ref={imageRef}>
                  <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>cloud, upload, storage, memory, data</title><path d="M20.57,9.43A8,8,0,0,0,5.26,10,5,5,0,1,0,5,20h5V18H5a3,3,0,0,1,0-6,3.1,3.1,0,0,1,.79.12l1.12.31.14-1.15a6,6,0,0,1,11.74-.82l.15.54.54.16A3.46,3.46,0,0,1,22,14.5,3.5,3.5,0,0,1,18.5,18H16v2h2.5A5.48,5.48,0,0,0,20.57,9.43Z"/><polygon points="16.71 15.29 13 11.59 9.29 15.29 10.71 16.71 12 15.41 12 20 14 20 14 15.41 15.29 16.71 16.71 15.29"/></svg>
                </label>
                <input id="post_media" type="file" className="form-control post-section__hidden"  onChange={handleMediaChange}/>
                <img width={300} height={300} src={localImg?localImg:dummy} alt="local data"></img>
              </div>
            }
            
            <div className="post-section__form-element">
              <label htmlFor="post_area" className="post-section__hidden">Post your story</label>
              <textarea id="post_area" className="form-control" placeholder={"Hello "+ name + " what's on you mind today?"} onChange={e=>setStory(e.target.value)}></textarea>
            </div>
            <button className="btn btn-primary post-section__button" type="submit">Post</button>
          </form>

          <ul className="post-section__story-list">{     
            postData && postData.map((d,i)=>{
              return <li key={i} className="post-section__story-item" id={d.storyId}>
                  <div className="post-section__avatar">
                    {
                      getProfileData && getProfileData.map((p,i)=>{
                        if(p.uid === d.userId){
                          return <img className="post-section__avatar-img" key={i} src={p.imgUrl?p.imgUrl:dummy} alt="avatar"></img>
                        }
                        return false;
                      })
                    }
                    <Link to="#" className="post-section__story-user link-secondary">{d.name}</Link>
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
                        <button className={ user && d.likedByCurrent === user.uid ? "post-section__like active":"post-section__like"} name={d.storyId} onClick={e=>likeChange(e,this)}>
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
                        <label className="post-section__comment-label post-section__hidden">submit comment</label>        
                        <textarea className="post-section__comment-textarea form-control" placeholder="share comment" onChange={onChange}></textarea>
                        <button className="btn btn-outline-primary post-section__comment-button" type="submit">comment</button>
                      </form>
                    </div>
              
                  </div>
                </li>
            })
            }</ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
