import { db, auth } from "../config/firebase.tsx";
import firebase from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    QuerySnapshot,
    where,
    query,
    serverTimestamp,
    doc,
    setDoc
} from 'firebase/firestore';
import {getAuth} from "firebase/auth";
import firestore = firebase.firestore;
import {createTeam} from "./createTeam";
import {createTeam} from "./createTeam";

interface channelData {
    channelName: string;
    createdByUserId: string;
}

export const createChannel = async ({channelName,createdByUserId}: channelData) => {
    try {
        const auth = getAuth()
        const user = auth.currentUser

        if(!user){
            return [];
        }


        //This gets the snapshot of the users doc
        const userDocSnapshot = await firestore.collection('users').doc(user.uid).get();
        const teamID = userDocSnapshot.data.team(); //this pulls the team ID from the user doc

        //combines teamID and channelName to make channel ID
        const makeChannelId = [teamID, channelName].sort().join('_');

        //uses makeChannelId to give each doc in channels this custom ID
        const channelDoc = setDoc(doc(db, "channels", makeChannelId), {
            channelName: channelName,
            createdByUserId: user.uid,
        });

        console.log("stuff was sent")

        return channelDoc;
    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }

}


