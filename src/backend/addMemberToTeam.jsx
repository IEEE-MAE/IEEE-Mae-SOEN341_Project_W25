import {doesUserExist} from "./auth.jsx";
import {arrayUnion, collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../config/firebase.jsx";


const addMemberToTeam = async (username, teamName) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return;
        }

        const userDocRef = querySnapshot.docs[0].ref; // Get the first matching user document reference
        await updateDoc(userDocRef, {
            team: teamName
        });

        console.log(`User ${username} successfully added to team ${teamName}`);
    } catch (err) {
        console.error("Error updating user:", err);
    }
};


export default addMemberToTeam;