import { db, realtimeDB } from "../config/firebase.jsx";
import {collection, addDoc, setDoc, query, getDocs, getDoc, where} from "firebase/firestore"
import {getAuth} from "firebase/auth";
import {getUserTeam} from "./Queries/getUserFields.jsx";
import {ref, set} from "firebase/database";
import {getCurrentUser} from "./auth.jsx";

export const createMessages= async (Message, Location, request = false, invite = false, channel = null)=>{
    try{

        const user = getCurrentUser();

        const messageData = {
            Message,
            Location,
            Sender: user.uid,
            timestamp: Date.now(),
            isRequest: request, // requests for being added to channel
            isInvite: invite,   // invites to add user to channel
            refChannelID : channel,
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

