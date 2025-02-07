import { db} from "../config/firebase.tsx";
import firebase from "firebase/app";
import {collection, addDoc,doc,updateDoc} from 'firebase/firestore';
import {getAuth} from "firebase/auth";


interface teamData {
    teamName: string;
    superUserId: string;
    adminId: string[];
    memberId: string[];
    channelIds: string[];
}

export async function createTeam({teamName, adminId, memberId, channelIds}: teamData) {
    try {
        const auth = getAuth()
        const user = auth.currentUser

        if(!user){
            return [];
        }
        //const teamDoc =
       const teamDoc = await addDoc(collection(db, 'teams'), {
            teamName: teamName,
            superUserId: user.uid,
            adminId: adminId,
            memberId: memberId,
            channelIds: channelIds,
    });
        console.log("stuff was sent")


        const userDocRef = doc(db, 'users', user.uid);

        // Update the document
        await updateDoc(userDocRef, {
            team: teamDoc.id,
            role: "superUser",
        });
        //return teamDoc;
        return teamDoc;
    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }
}