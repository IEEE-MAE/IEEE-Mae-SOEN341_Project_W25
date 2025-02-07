import { db, auth } from "../config/firebase.tsx";
import firebase from "firebase/app";
import {getFirestore, collection, addDoc, getDocs, QuerySnapshot, where, query, serverTimestamp,doc} from 'firebase/firestore';
import {getAuth} from "firebase/auth";
import firestore = firebase.firestore;

interface teamData {
    teamName: string;
    superUserId: string;
    adminId: string[];
    memberId: string[];
    channelIds: string[];
}

export async function createTeam({teamName, superUserId, adminId, memberId, channelIds}: teamData) {
    try {
        const auth = getAuth()
        const user = auth.currentUser

        if(!user){
            return [];
        }
        const teamDoc = await addDoc(collection(db, 'teams'), {
            teamName: teamName,
            superUserId: user.uid,
            adminId: adminId,
            memberId: memberId,
            channelIds: channelIds,
    });
        console.log("stuff was sent")


        await firestore.collection('users').doc(user.uid).update({
            team : teamDoc.id,
            role : "superUser",
        });
        return teamDoc;
    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }
}