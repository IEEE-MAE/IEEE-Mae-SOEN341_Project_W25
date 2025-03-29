
import {arrayUnion, collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {getSuperUserChannels} from "./Queries/getSuperUser.jsx";


const addAdminToTeam = async (username, teamName) => {
    if(!username || !teamName) return;
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return;
        }

        const superUserChannels = await getSuperUserChannels(teamName);

        const userDocRef = querySnapshot.docs[0].ref; // get unique doc
        await updateDoc(userDocRef, {
            team: teamName,
            role: "admin",
            channels: superUserChannels
        });

        console.log(`User ${username} successfully made admin of team ${teamName}`);
    } catch (err) {
        console.error("Error updating user:", err);
    }
};


export default addAdminToTeam;