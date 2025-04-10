import {collection, getDocs, where, query, doc, getDoc} from 'firebase/firestore';
import {db} from "../../config/firebase.jsx";


export async function getSuperUserId(targetTeam) {
    try {
        const q = query(collection(db, 'users'), where('team', '==', targetTeam), where('role', '==', "superUser"));

        const querySnapshot = await getDocs(q);

        const userId = querySnapshot.docs[0].id;

        console.log('Super User ID retrieved:', userId);
        return userId;

    } catch (error) {
        console.log('error pulling document', error);
        return [];
    }
}

export async function getSuperUserChannels(targetTeam) {
    const superUserId = await getSuperUserId(targetTeam);
    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", superUserId);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the username from the user into const username
        const userData = userDocSnapshot.data();
        const superUserChannels =  userData ? userData.channels : null;
        if(!superUserChannels) {
            console.log("no channels found");
            return null;
        }
        console.log("channel retrieved:", superUserChannels);
        return superUserChannels;
    }
    catch(error){
        console.log("error fetching superUser's channels: " + error);
    }
}

export async function getSuperUserUsername(targetTeam) {
    const superUserId = await getSuperUserId(targetTeam);
    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", superUserId);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the username from the user into const username
        const userData = userDocSnapshot.data();
        const superUserUsername =  userData ? userData.username : null;
        if(!superUserUsername) {
            console.log("no username found for superUser");
            return null;
        }
        console.log("superUser username retrieved:", superUserUsername);
        return superUserUsername;
    }
    catch(error){
        console.log("error fetching superUser's username: " + error);
    }
}

export async function getSuperUserDefaultChannels(targetTeam) {
    const superUserId = await getSuperUserId(targetTeam);
    try{
        //This gets the snapshot of the users doc
        const userDocRef = doc(db, "users", superUserId);
        const userDocSnapshot = await getDoc(userDocRef);

        //puts the username from the user into const username
        const userData = userDocSnapshot.data();
        const superUserDefaultChannels =  userData ? userData.defaultChannels : null;
        if(!superUserDefaultChannels) {
            console.log("no channels found");
            return null;
        }
        console.log("channel retrieved:", superUserDefaultChannels);
        return superUserDefaultChannels;
    }
    catch(error){
        console.log("error fetching superUser's channels: " + error);
    }
}