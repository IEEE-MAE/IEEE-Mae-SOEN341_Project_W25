import {getCurrentUser} from "./auth.jsx";
import {getUsername} from "./Queries/getUserFields.jsx";
import {arrayUnion, doc,updateDoc} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {pullUser} from "./Queries/basicqueryUsers.jsx";

export const createDM = async (otherUserName) => {

    try {
        const thisUserName = await getUsername();
        const thisUserID = await getCurrentUser();
        const otherUserID = await pullUser(otherUserName);

        if(!otherUserName || !thisUserID || !thisUserName || !otherUserID){
            console.log("Could not find user's " + otherUserName + " ID in database.");
            return;
        }

        const DMid = thisUserName.concat(otherUserName);
        console.log("DM name: ", DMid);

        await updateDoc(doc(db, "users", thisUserID.uid), {
            dms: arrayUnion(DMid),
        });

        await updateDoc(doc(db, "users", otherUserID), {
            dms: arrayUnion(DMid),
        });

        console.log("Successfully created DM: ", DMid);
        return DMid;

    } catch (error) {
        console.error("Error creating DM:", error);
        throw error;
    }
}