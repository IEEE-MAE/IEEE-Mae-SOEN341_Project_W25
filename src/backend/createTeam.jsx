import { db} from "../config/firebase.jsx";
import {doc, updateDoc} from 'firebase/firestore';
import {getCurrentUser} from "./auth.jsx";


export async function createTeam(teamName) {
    try {
        const user = getCurrentUser()
        const teamID = user.uid.concat(teamName);

        await updateDoc(doc(db, "users", user.uid), {
            team: teamID,
            role: "superUser",
        });

        console.log("Team created: ", teamID);

    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }
}