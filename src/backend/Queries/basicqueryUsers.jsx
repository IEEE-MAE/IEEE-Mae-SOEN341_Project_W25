import {collection, getDocs, where, query} from 'firebase/firestore';
import {db} from "../../config/firebase.jsx";
import {getUserTeam} from "./getUserFields.jsx";


export async function pullUser(targetName) {
    try {
        const q = query(collection(db, 'users'), where('username', '==', targetName));
        const querySnapshot = await getDocs(q);

        const userId = querySnapshot.docs[0].id;

        console.log('Retrieved ID of user ' + targetName + ": " + userId);
        return userId;

    } catch (error) {
        console.log('error pulling users ID', error);
        return [];
    }

}

export const isUserInChannel = async(username, channel) => {
    try{
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return;
        }

        const userData = querySnapshot.docs[0].data();
        const userChannels =  userData ? userData.channels : null;
        return userChannels.includes(channel);
    }
    catch(error){
        console.log("error isUserInChannel: " + error);
    }
}

export const userInTeam = async(username) => {
    console.log("CHECKING IF USER EXISTS IIN TEAM");
    try {
        const thisTeam = await getUserTeam();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return false;
        }

        const userData = querySnapshot.docs[0].data();
        const userTeam = userData ? userData.team : null;

        return userTeam === thisTeam;
    }
    catch(error){
        console.log("error isUserInTeam: " + error);
    }
}

export const userHasTeam = async(username) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return false;
        }

        const userData = querySnapshot.docs[0].data();
        const userTeam = userData ? userData.team : null;

        return !!userTeam && typeof userTeam === "string" && userTeam.trim() !== "";
    }
    catch(error){
        console.log("error isUserInTeam: " + error);
    }
}
