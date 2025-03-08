import {getCurrentUser} from "./auth.jsx";
import {getUsername, getUserTeam} from "./Queries/getUserFields.jsx";
import {arrayUnion, doc, updateDoc} from "firebase/firestore";
import {db} from "../config/firebase.jsx";

export const createDM = async (otherUserName) => {

    try {
        const thisUser = await getUsername();

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