import { db, auth } from "../config/firebase.jsx";
import {
    doc,
    setDoc, getDoc
} from 'firebase/firestore';
import {getAuth} from "firebase/auth";



// interface channelData {
//     channelName: string;
//     createdByUserId: string;
// }

export const createChannel = async ({channelName,createdByUserId}) => {
    try {
        const auth = getAuth()
        const user = auth.currentUser

        if(!user){
            return [];
        }

        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        //const teamID = userDocSnapshot.data.id;

        const userData = userDocSnapshot.data();
        const teamID = userData ? userData.id : null;

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


