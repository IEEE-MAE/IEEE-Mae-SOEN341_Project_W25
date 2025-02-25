import { db, auth } from "../config/firebase.jsx";
import {
    doc,
    setDoc, getDoc, updateDoc, query, collection, where, getDocs, arrayUnion
} from 'firebase/firestore';
import {getUserTeam} from "./Queries/getUserFields.jsx";
import {getCurrentUser} from "./auth.jsx";



export const createChannel = async (channelName) => {

    try {
        const user = getCurrentUser();

        const teamID = await getUserTeam();
        if (!teamID) {
            console.log("ERROR: No team ID found.");
            return;
        }

        const channelID = teamID.concat(channelName);
        await updateDoc(doc(db, "users", user.uid), {
            channels: arrayUnion(channelID),
        });

        console.log("Successfully created channel: ", channelID);

    } catch (error) {
        console.error("Error creating channel:", error);
        throw error;
    }
}


// for this, when the user clicks on the channel being displayed on the UI, it records the corresponding channelID
export const addUserToChannel = async (channelID, username) => {
    try {
        const currentUser = getCurrentUser();

        // how do we get the channel the user is currently in?
        const channelID = teamID.concat(channelName);

        await updateDoc(doc(db, "users", user.uid), {
            channels: arrayUnion(channelID),
        });

    } catch (error) {
        console.error("Error creating channel:", error);
        throw error;
    }
}


