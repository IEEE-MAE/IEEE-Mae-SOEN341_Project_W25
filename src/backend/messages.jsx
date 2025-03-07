import { db, realtimeDB } from "../config/firebase.jsx";
import {collection, addDoc, setDoc, query, getDocs, getDoc, where} from "firebase/firestore"
import {getAuth} from "firebase/auth";
import {getUserTeam} from "./Queries/getUserFields.jsx";
import {ref, set} from "firebase/database";

export const createMessages= async (Message, Location)=>{
    try{
        // create account using firebase authentication

        const auth = getAuth()
        const user = auth.currentUser

        const messageData = {
            Message,
            Location,
            Sender: user.uid,
            timestamp: Date.now(),
        };

        const docRef = await addDoc(collection(db,'messages'), messageData);
        console.log("message stored: " + docRef.id);

        const realtimeRef = ref(realtimeDB, 'messages/' + docRef.id);
        await set(realtimeRef, messageData);
        console.log("Messages stored in RealtimeDB successfully.");
    }
    catch(error){
        console.log('error creating message');
        throw error;
    }
}

