import {doesUserExist} from "./auth.jsx";
import {arrayUnion, collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../config/firebase.jsx";


const addAdminToTeam = async (username, teamName) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return;
        }

        const userDocRef = querySnapshot.docs[0].ref; // get unique doc
        await updateDoc(userDocRef, {
            team: teamName,
            role: "admin"
        });

        console.log(`User ${username} successfully made admin of team ${teamName}`);
    } catch (err) {
        console.error("Error updating user:", err);
    }
};


export default addAdminToTeam;