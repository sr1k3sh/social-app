import { db } from "../services/firebase"

console.log(db)
let initialState ={ 
    count: 0,
    isLoading: true,
    post:''
}

const reducer =(state,action)=> {
    switch (action.type){
        case 'increment':
            return {
                
                count: state.count++,
                isLoading: !state.isLoading,
                post: action.type
            };
        // case 'FETCH_SUCCESS':
        //     console.log('here testing')
        //     return {
        //         isLoading:false,
        //         post:action.payload
        //     };
        default:
            return false
    }
}   

export {initialState,reducer};