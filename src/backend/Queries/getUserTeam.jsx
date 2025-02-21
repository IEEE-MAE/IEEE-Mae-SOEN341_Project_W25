import { db, auth } from "../../config/firebase.jsx";
import {
    doc,
    setDoc, getDoc
} from 'firebase/firestore';
import {getAuth} from "firebase/auth";



export async function getUserTeam() {
    const auth = getAuth();
    const user = auth.currentUser;

    if(!user)
    {
        return [];
    }

    //This gets the snapshot of the users doc
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnapshot = await getDoc(userDocRef);

    //puts the team ID from the user into const teamID
    const userData = userDocSnapshot.data();
    const teamID = userData ? userData.team : null;

return teamID;
}