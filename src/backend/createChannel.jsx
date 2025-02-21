import { db, auth } from "../config/firebase.jsx";
import {
    doc,
    setDoc, getDoc, updateDoc
} from 'firebase/firestore';
import {getAuth} from "firebase/auth";
import {getUserTeam} from "./Queries/getUserTeam.jsx";



// interface channelData {
//     channelName: string;
//     createdByUserId: string;
// }

export const createChannel = async ({channelName,createdByUserId, users}) => {
    try {
        // const auth = getAuth();
        // const user = auth.currentUser;
        //
        // if(!user){
        //     return [];
        // }
        //
        // //This gets the snapshot of the users doc
        // const userDocRef = doc(db, "users", user.uid);
        // const userDocSnapshot = await getDoc(userDocRef);
        // //const teamID = userDocSnapshot.id;
        //
        // const userData = userDocSnapshot.data();
        const auth = getAuth()
        const user = auth.currentUser

        if(!user){
            return [];
        }
        const teamID = getUserTeam();

        console.log("Team Id:" + teamID);
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        //const teamID = userDocSnapshot.data.id;

        const userData = userDocSnapshot.data();
        const teamID = userData ? userData.id : null;
        console.log("Team Id:" + teamID);

        //combines teamID and channelName to make channel ID
        const makeChannelId = [teamID, channelName].sort().join('_');

        //uses makeChannelId to give each doc in channels this custom ID
        const channelDoc = setDoc(doc(db, "channels", makeChannelId), {
            channelName: channelName,
            createdByUserId: user.uid,
            users: users,
        });

        const userDocRef = doc(db, 'users', user.uid);

        // Update the document
        await updateDoc(userDocRef, {
            channel: channelDoc.id,
        });


        console.log("stuff was sent")

        return channelDoc;
    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }

}


