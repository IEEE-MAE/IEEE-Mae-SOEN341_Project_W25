import { db, auth } from "../config/firebase.jsx";
import {
    doc,
    setDoc, getDoc, updateDoc, query, collection, where, getDocs, arrayUnion
} from 'firebase/firestore';
import {getUserTeam} from "./Queries/getUserFields.jsx";
import {getCurrentUser} from "./auth.jsx";
import {getSuperUserChannels, getSuperUserId} from "./Queries/getSuperUser.jsx";
import {i} from "framer-motion/m";



export const createChannel = async (channelName) => {

    // add channel to superUser's channels
    const teamID = await getUserTeam();
    if (!teamID) {
        console.log("ERROR: No team ID found.");
        return;
    }

    const superUserID = await getSuperUserId(teamID);
    if (!superUserID) {
        console.log("ERROR: No superUser ID found.");
        return;
    }

    const channelID = teamID.concat(channelName);
    await updateDoc(doc(db, "users", superUserID), {
        channels: arrayUnion(channelID),
    });

    // copy superUser's updated channel list to every admin of the team

    // get superUser's channels
    const superUserChannels = await getSuperUserChannels(teamID);

    // get array of every admin in the team
    const q = query(collection(db, 'users'), where('team', '==', teamID), where('role', '==', "admin"));
    const querySnapshot = await getDocs(q);
    const queryDocs = querySnapshot.docs;

    for(var newdoc of queryDocs) {
        const adminID = newdoc.id;
        console.log(`admin ID: ${adminID}`);
        await updateDoc(doc(db, "users", adminID), {
            channels: superUserChannels,
        });
    }

    // add the channel to the current user
    // try {
    //     const user = getCurrentUser();
    //
    //     const teamID = await getUserTeam();
    //     if (!teamID) {
    //         console.log("ERROR: No team ID found.");
    //         return;
    //     }
    //
    //     const channelID = teamID.concat(channelName);
    //     await updateDoc(doc(db, "users", user.uid), {
    //         channels: arrayUnion(channelID),
    //     });
    //
    //     console.log("Successfully created channel: ", channelID);
    //
    // } catch (error) {
    //     console.error("Error creating channel:", error);
    //     throw error;
    // }
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


