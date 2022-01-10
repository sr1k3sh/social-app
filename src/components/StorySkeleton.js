import React from "react";

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
function StorySkeleton(){
    return(
        <React.Fragment>
            <li className="post-section__story-item">
                <div className="post-section__avatar">
                <Skeleton circle
                height={40} width={40}
                containerClassName="avatar-skeleton">
                </Skeleton>
                <Skeleton width={70}></Skeleton>
                </div>
                <div>
                <p>
                    <Skeleton width="100%"></Skeleton>
                    <Skeleton width="90%"></Skeleton>
                    <Skeleton width="20%"></Skeleton>
                </p>
                </div>
            </li> 
        </React.Fragment>
    );
}

function ImageSkeleton(props){
    return(
        <React.Fragment>
            <Skeleton circle
                height={props.size?props.size:40} width={props.size?props.size:40}
                containerClassName="avatar-skeleton">
            </Skeleton>
        </React.Fragment>
    );
}

function PlainSkeleton(props){
    return(
        <React.Fragment>
            <Skeleton width={props.width?props.width:'100%'}></Skeleton>
        </React.Fragment>
    );
}
export {StorySkeleton,ImageSkeleton,PlainSkeleton};