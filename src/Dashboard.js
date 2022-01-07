import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import "./Dashboard.scss";
import { auth, logout ,database, storage} from "./firebase";
import uniqid from 'uniqid';
import dummy from './images/profile.png'

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const [story , setStory] = useState();
  const [imgUrl, setImgUrl] = useState();

  const history = useHistory();
  const [postData, setPostData] = useState([]);

  const [textarea, setTextarea] = useState("");

  const [didMount, setDidMount] = useState(false); 

  const [localImg, setLocalImg] = useState("");

  const [imageAsFile, setImageAsFile] = useState('');


  useEffect(() => {
    if (loading) return;
    if (!user) return history.replace("/");

    const fetchUserName = async (id) => {
      try {
        const test = await database.ref("users");
        test
        .orderByChild('uid')
        .equalTo(user.uid).once("value")
        .then(snap=>{
          if(snap.exists()){
            snap.forEach(function(user){
              setName(user.val().name);
              setImgUrl(user.val().imgUrl);
            })
          }
        });
      } catch (err) {
        console.error(err);
      }
    };

  
    const post = async () =>{
      try{
        const getData = await database.ref('feeds');
        
        getData.on("value",function(snapshot){
          snapshot.forEach(function(data){
            let userData = {
              name:data.val().username,
              story:data.val().story,
              uid:data.val().userId,
              storyId:data.val().storyId,
              likedByCurrent: data.val().likedByCurrent,
              likedArr:data.val().likedArr,
              comments:data.val().comments,
              imgUrl:data.val().imgUrl,
              postImageUrl:data.val().postImageUrl
            }
            setPostData(prev=>[...prev,userData]);         
          });
        });
      }
      catch(err){
        console.log(err);
      }
    }

    fetchUserName(user.id);

    post();

    setDidMount(true);
    return () => {
      setName({}); // This worked for me
      setPostData({});
      setStory({});
      setTextarea("");
      setDidMount(false);
    };
    
  }, [user, loading, history]);

  if(!didMount) {
    return null;
  }

  const PostSection = async(e) =>{
    e.preventDefault();
    try{
      e.preventDefault();
      if(imageAsFile === '') {
        await database.ref("feeds").push({
          story:story,
          userId:user.uid,
          username:name,
          storyId: "story-id-"+uniqid(),
          likedArr:"",
          likedByCurrent:false,
          imgUrl:imgUrl?imgUrl:'',   
        });
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
                database.ref("feeds").push({
                  story:story,
                  userId:user.uid,
                  username:name,
                  storyId: "story-id-"+uniqid(),
                  likedArr:"",
                  likedByCurrent:false,
                  imgUrl:imgUrl?imgUrl:'',
                  postImageUrl:fireBaseUrl
                });
              });
          });
      }
      
      e.target.reset();
    }
    catch(err){
      console.log(err);
    }
  }

  const append = (e) => {
    e.preventDefault();
  };

  const onChange = (e) =>{
    setTextarea(e.target.value);
  }

  const shareComment = async(e) =>{
    e.preventDefault();

    try{
      let data = await database.ref("feeds");
      let dom = e.target;

      let name = dom.getAttribute('name');
      data.orderByChild('storyId').equalTo(name).once('value').then(d=>{
        d.forEach(e=>{
          if(name === e.val().storyId){ 
            let obj = {
              username:e.val().username,
              userId:e.val().userId,
              textarea:textarea,
              imgUrl:imgUrl?imgUrl:""
            }
            let arr = [].concat(e.val().comments,obj);
            arr = new Set(arr);
            arr = Array.from(new Set(arr)).filter(Boolean);

            database.ref('feeds/'+e.getRef().getKey()).update({
              comments: arr,
            });  
          }
        });
      });
      
    }
    catch(err){
      console.log(err)
    }

    e.target.reset();
  }

  const likeChange = async(e,elem) =>{
    e.preventDefault();
    try{
      let data = await database.ref("feeds");
      let dom = e.target.closest(".post-section__like");
      let name = dom.getAttribute('name');
      let states = false;
      if(dom.classList.contains("active")){
        dom.classList.remove('active')
        states = false;
      }
      else{
        dom.classList.add('active');
        states = true;
      }
      data.orderByChild('storyId').equalTo(name).once('value').then(d=>{
        d.forEach(e=>{
          if(name === e.val().storyId){ 
            let arr = [].concat(e.val().likedArr,user.uid);
            arr = new Set(arr);
            arr = Array.from(new Set(arr)).filter(Boolean)
            database.ref('feeds/'+e.getRef().getKey()).update({
              likedArr: states ? arr : arr.filter(d=>d!==user.uid)
            });
            if(user.uid === e.val().userId){
              database.ref('feeds/'+e.getRef().getKey()).update({
                likedByCurrent: states
              });
            }   
          }
        });
      });
      
    }
    catch(err){
      console.log(err)
    }
  }

  const handleMediaChange = (e) =>{
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      setImageAsFile(file);
      setLocalImg(URL.createObjectURL(file))
    }
  }

  return (
    <div className="rikesh-nav container-xxl">
      <nav className="navbar navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/dashboard">
            <img src="./logo192.png" alt="" width="30" height="30"/>
          </Link>
          <div className="rikesh-nav__actions">
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
            <div className="post-section__form-element post-section__form-element--image-upload">
              <label htmlFor="post_media" className="post-section__image-label">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>cloud, upload, storage, memory, data</title><path d="M20.57,9.43A8,8,0,0,0,5.26,10,5,5,0,1,0,5,20h5V18H5a3,3,0,0,1,0-6,3.1,3.1,0,0,1,.79.12l1.12.31.14-1.15a6,6,0,0,1,11.74-.82l.15.54.54.16A3.46,3.46,0,0,1,22,14.5,3.5,3.5,0,0,1,18.5,18H16v2h2.5A5.48,5.48,0,0,0,20.57,9.43Z"/><polygon points="16.71 15.29 13 11.59 9.29 15.29 10.71 16.71 12 15.41 12 20 14 20 14 15.41 15.29 16.71 16.71 15.29"/></svg>
              </label>
              <input id="post_media" type="file" className="form-control post-section__hidden"  onChange={handleMediaChange}/>
              <img width={300} src={localImg?localImg:dummy} alt="local data"></img>
            </div>
            <div className="post-section__form-element">
              <label htmlFor="post_area" className="post-section__hidden">Post your story</label>
              <textarea id="post_area" className="form-control" placeholder={"Hello "+ name + " what's on you mind today?"} onChange={e=>setStory(e.target.value)}></textarea>
            </div>
            <button className="btn btn-primary post-section__button" type="submit">Post</button>
          </form>

          <ul className="post-section__story-list">{     
            postData.length && postData.filter((v,i,a)=>a.findIndex(t=>(t.storyId===v.storyId))===i).map((d,i)=>{
              return <li key={i} className="post-section__story-item" id={d.storyId}>
                  <div className="post-section__avatar">
                    <img className="post-section__avatar-img" src={d.imgUrl?d.imgUrl:dummy} alt="avatar"></img>
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
                        <button className={ d.likedByCurrent ? "post-section__like active":"post-section__like"} name={d.storyId} onClick={e=>likeChange(e,this)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-thumbs-up"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        </button>
                        <span>{d.likedArr && d.likedArr.length}</span>
                      </div>
                      <button className="post-section__comment btn" onClick={append}>
                        comments
                      </button>
                    </div>
                    <div className="post-section__comment-form-wrapper">
                      <ul className="post-section__comment-list">
                        {
                          d.comments && d.comments.map((c,i)=>{
                            return <li className="post-section__comment-item" key={i}>
                              <img width="24" src={c.imgUrl?c.imgUrl:dummy} alt="profile data"></img>
                              <span>{c.textarea}</span>
                            </li>
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
