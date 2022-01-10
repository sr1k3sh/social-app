import React , {useEffect, useState} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import { auth, db, logout } from "../services/firebase";
import logo from './../images/logo.png';
import { ImageSkeleton, PlainSkeleton } from "./StorySkeleton";
import uniqid from 'uniqid';

function Navbar(props) {
    const [user, loading] = useAuthState(auth);
    const [getActivity, setActivity] = useState([]);
    
    useEffect(() => {
        db.collection('activity').onSnapshot(snap=>{
            setActivity(snap.docs.map(s=>s.data()))
        });
        return () => {
            setActivity([]);
        }
    }, [user,loading])
    return (
        <React.Fragment>
            <nav className="navbar">
                <div className="container">
                    <Link className="navbar-brand" to="/dashboard">
                        <img src={logo} alt="test" width="100" height="100"/>
                    </Link>
                    {
                    props.isRequired && <div className="rikesh-container__actions">
                            <div className="dropdown">
                                <button className="btn rikesh-container__notification-wrapper dropdown-toogle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false" aria-label="notfication">
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
                            {
                                props.imgUrl ? <img className="rikesh-container__img" width={32} height={32} src={props.imgUrl} alt="nav data"></img>
                                : <ImageSkeleton></ImageSkeleton>
                            }
                            {
                                props.name ? 
                                <div className="rikesh-container__welcome-text">Welcome!! {props.name}</div>
                                :
                                [
                                    <PlainSkeleton width={50} key={uniqid()}></PlainSkeleton>,
                                    <PlainSkeleton width={30} key={uniqid()}></PlainSkeleton>
                                ]

                            }
                            <button className="dashboard__btn btn btn-primary" onClick={logout}>
                            Logout
                            </button>
                            <div className="dropdown">
                                <button className="btn rikesh-container__settings dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" aria-label="settings">
                                    <svg enableBackground="new 0 0 32 32" id="Editable-line" version="1.1" viewBox="0 0 32 32"><circle cx="16" cy="16" fill="none" id="XMLID_224_" r="4" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"/><path d="  M27.758,10.366l-1-1.732c-0.552-0.957-1.775-1.284-2.732-0.732L23.5,8.206C21.5,9.36,19,7.917,19,5.608V5c0-1.105-0.895-2-2-2h-2  c-1.105,0-2,0.895-2,2v0.608c0,2.309-2.5,3.753-4.5,2.598L7.974,7.902C7.017,7.35,5.794,7.677,5.242,8.634l-1,1.732  c-0.552,0.957-0.225,2.18,0.732,2.732L5.5,13.402c2,1.155,2,4.041,0,5.196l-0.526,0.304c-0.957,0.552-1.284,1.775-0.732,2.732  l1,1.732c0.552,0.957,1.775,1.284,2.732,0.732L8.5,23.794c2-1.155,4.5,0.289,4.5,2.598V27c0,1.105,0.895,2,2,2h2  c1.105,0,2-0.895,2-2v-0.608c0-2.309,2.5-3.753,4.5-2.598l0.526,0.304c0.957,0.552,2.18,0.225,2.732-0.732l1-1.732  c0.552-0.957,0.225-2.18-0.732-2.732L26.5,18.598c-2-1.155-2-4.041,0-5.196l0.526-0.304C27.983,12.546,28.311,11.323,27.758,10.366z  " fill="none" id="XMLID_242_" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="2"/></svg>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                                    <li><Link className="dropdown-item" to="/account">Edit Account</Link></li>
                                </ul>
                            </div>
                        </div>
                    }
                </div>
            </nav>
        </React.Fragment>
    );
}

export default Navbar;
