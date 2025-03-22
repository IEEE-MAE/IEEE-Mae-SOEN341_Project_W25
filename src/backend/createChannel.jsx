import { db, auth } from "../config/firebase.jsx";
import {
    doc,
    setDoc, getDoc, updateDoc, query, collection, where, getDocs, arrayUnion
} from 'firebase/firestore';
import {getTeamAdmins, getTeamMembers, getUserTeam} from "./Queries/getUserFields.jsx";
import {getCurrentUser} from "./auth.jsx";
import {getSuperUserChannels, getSuperUserId} from "./Queries/getSuperUser.jsx";
import {i} from "framer-motion/m";



export const createChannel = async (channelName, defaultChannel) => {

    //------ add channel to superUser's channels  -------

    /**
     ----------------------------------------------------------------------------------
     |----- if default channel is 1, it should add that channel to all members ------|
     ----------------------------------------------------------------------------------

      ADD CHANNEL TO SUP AND ADMIN:
      1. get sup id
      2. add new channel to sup channels
      3. get sup's channels
      4. get array of every admin in team
      5. make admin channels = sup's channel

      IF DEFAULT CHANNEL = 1:
      1. add new channel to sup defaultChannels
      2. make admin defaultChannels = sup default chan
      3. get all current team members
      4. update all members channesl to sup default chan

      next:
      1. when user joins team
      2. pull from superUser default channels
      3. add to users channel

     **/

    //check team
    const teamID = await getUserTeam();
    if (!teamID) {
        console.log("ERROR: No team ID found.");
        return;
    }

    //get superUser id
    const superUserID = await getSuperUserId(teamID);
    if (!superUserID) {
        console.log("ERROR: No superUser ID found.");
        return;
    }


    //update superUser channels
    const channelID = teamID.concat(channelName);
    await updateDoc(doc(db, "users", superUserID), {
        channels: arrayUnion(channelID),
    });

    //----- copy superUser's updated channel list to every admin of the team -----


    //gets list of admins in Admins
    const Admins = await getTeamAdmins(teamID);
    console.log("Admins: ", Admins);

    for (const adminId of Admins) {
        const userDocRef = doc(db, "users", adminId);
        await updateDoc(userDocRef, {
            channels: arrayUnion(channelID),
        });
    }

    //---- HERE I ADD THE ALL CODE ----

    if (defaultChannel) {
        //update superUser channels
        await updateDoc(doc(db, "users", superUserID), {
            defaultChannels: arrayUnion(channelID),
        });

        //updates all admins
        for (const adminId of Admins) {
            const userDocRef = doc(db, "users", adminId);
            await updateDoc(userDocRef, {
                defaultChannels: arrayUnion(channelID),
            });
        }

        //get list of members in Members
        const Members = await getTeamMembers(teamID);
        console.log("Admins: ", Members);

        //update all members channels
        for (const memberId of Members) {
            const userDocRef = doc(db, "users", memberId);
            await updateDoc(userDocRef, {
                channels: arrayUnion(channelID),
            });
        }

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


