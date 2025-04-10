import { db } from "../../config/firebase.jsx";
import {doc, getDoc, query, collection, where, getDocs} from 'firebase/firestore';
import {getCurrentUser} from "../auth.jsx";


export async function getUsername() {
    const user = getCurrentUser()

    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the username from the user into const username
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

export async function getOtherUsername(userid) {
    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", userid);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the username from the user into const username
        const userData = userDocSnapshot.data();
        const username =  userData ? userData.username : null;
        if(!username) {
            console.log("no username");
            return null;
        }
        return username;
    }
    catch(error){
        console.log("error fetching other user's username: " + error);
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



export async function getUserRole() {
    const user = getCurrentUser()

    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);


        const userData = userDocSnapshot.data();
        const userRole = userData ? userData.role : null;
        console.log(" user's role: " + userRole);
        return userRole;
    }
    catch(error){
        console.log("error fetching user's role: " + error);
    }
}

export async function getTeamMembers(teamID) {
    try {
        const q = query(collection(db, 'users'), where('team', '==', teamID), where('role', '==', "member"));
        const querySnapshot = await getDocs(q);
        const queryDocs = querySnapshot.docs;

        const items = [];

        for (const doc of queryDocs) {
            items.push(doc.id);
        }

        console.log(items);
        return items;
    } catch (error) {
        console.log("error fetching team members role: " + error);
    }
}



export async function getTeamAdmins(teamID) {
    try {
        const q = query(collection(db, 'users'), where('team', '==', teamID), where('role', '==', "admin"));
        const querySnapshot = await getDocs(q);
        const queryDocs = querySnapshot.docs;

        const items = [];

        for (const doc of queryDocs) {
            items.push(doc.id);
        }

        console.log(items)
        return items;
    } catch (error) {
        console.log("error fetching team members role: " + error);
    }
}



