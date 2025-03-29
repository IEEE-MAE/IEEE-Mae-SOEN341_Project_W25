import {arrayUnion, collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {isUserInChannel, userInTeam} from "./Queries/basicqueryUsers.jsx";


const addMemberToChannel = async (username, channelID) =>{
    if(!username || !channelID) return;
    try {
        // ------ otherwise it just proceeds with the previous code ------

        const sameTeam = await userInTeam(username);
        if(!sameTeam) {
            console.log("users do not belong to the same team, can't add to channel");
            return;
        }

        const inChannel = await isUserInChannel(username, channelID);
        if(inChannel) {
            console.log("user is already in channel, can't add to channel");
            return;
        }

        // add to channel

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return;
        }

        const userDocRef = querySnapshot.docs[0].ref; // get unique doc
        await updateDoc(userDocRef, {
            channels: arrayUnion(channelID),
        });

        console.log(`User ${username} successfully added to channel ${channelID}`);

    } catch (err) {
        console.error("Error adding user to channel:", err);
    }
}

export default addMemberToChannel;