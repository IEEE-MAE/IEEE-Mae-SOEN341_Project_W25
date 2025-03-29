import { db, realtimeDB } from "../config/firebase.jsx";
import {getUsername} from "./Queries/getUserFields.jsx";
import {ref, set} from "firebase/database";
import {getCurrentUser} from "./auth.jsx";

export const createStatus= async (last_seen, status)=>{
    try{

        const userName = getUsername();
        const user = getCurrentUser();

        const statusData = {
            username: userName,
            last_seen,
            status,
        };

        const realtimeRef = ref(realtimeDB, `status/${user.uid}`);
        await set(realtimeRef, statusData);
        console.log("Status stored in RealtimeDB successfully.");
    }
    catch(error){
        console.log('error creating status' + error);
        throw error;
    }
}