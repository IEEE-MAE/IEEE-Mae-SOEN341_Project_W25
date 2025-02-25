import { db, auth } from "../../config/firebase.jsx";
import {
    doc,
    setDoc, getDoc
} from 'firebase/firestore';
import {getCurrentUser} from "../auth.jsx";


export async function getUsername() {
    const user = getCurrentUser()

    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the team ID from the user into const teamID
        const userData = userDocSnapshot.data();
        const username =  userData ? userData.username : null;
        if(!username) {
            console.log("no username");
            return null;
        }
        return username;
    }
    catch(error){
        console.log("error fetching user's username: " + error);
    }
}

export async function getUserTeam() {
    const user = getCurrentUser()

    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the team ID from the user into const teamID
        const userData = userDocSnapshot.data();
        const teamID =  userData ? userData.team : null;
        if(!teamID) {
            console.log("no teamID");
            return null;
        }
        return teamID;
    }
    catch(error){
        console.log("error fetching user's team: " + error);
    }
}

export async function getUserChannel() {
    const user = getCurrentUser()

    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the team ID from the user into const teamID
        const userData = userDocSnapshot.data();
        const teamID = userData ? userData.channel : null; // which channel dawg?
    }
    catch(error){
        console.log("error fetching user's team: " + error);
    }

    return teamID;
}