import {doc, getDoc} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {getCurrentUser} from "./auth.jsx";

// for checking user is logged in, and whether they have a team, for navigation
// return bool [is logged in, has a team]

// HOW DO WE IDENTIFY WHAT CHANNEL THE USER IS CURRENTLY IN????

export const userStatus = async () => {
    const user = getCurrentUser();
    if(user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.team && Object.keys(userData.team).length > 0) {
                    return [true, true];
                }
            } else {
                return [true, false];
            }
        } catch (error) {
            alert("Error during sign in: " + error);
        }
    }
    return [false, false];
}