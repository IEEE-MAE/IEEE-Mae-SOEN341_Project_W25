import { db, auth } from "../config/firebase.jsx";
import {collection, addDoc, setDoc, query, getDocs, getDoc, where} from "firebase/firestore"
import {getAuth} from "firebase/auth";
import {getUserTeam} from "./Queries/getUserFields.jsx";

export const createMessages= async (Message, Location)=>{
    try{
        // create account using firebase authentication

        const auth = getAuth()
        const user = auth.currentUser

        await addDoc(collection(db,'messages'), {
            Message: Message,
            Location: Location,
            Sender: user.uid,
        });

        console.log("Messages created successfully.");
    }
    catch(error){
        console.log('error creating message');
        throw error;
    }
}

