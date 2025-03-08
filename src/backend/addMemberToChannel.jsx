import {arrayUnion, collection, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {getUserTeam} from "./Queries/getUserFields.jsx";


const addMemberToChannel = async (username, channelID) =>{
    if(!username || !channelID) return;
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            return;
        }

        const userData = querySnapshot.docs[0].data();
        const newUserTeam =  userData ? userData.team : null;
        const thisUserTeam = getUserTeam();
        if(!newUserTeam || !thisUserTeam) {
            console.log("error fetching teams");
            return;
        }
        if(!newUserTeam === thisUserTeam) {
            console.log("users do not belong to the same team, can't add to channel");
            return;
        }

        const userDocRef = querySnapshot.docs[0].ref; // get unique doc
        await updateDoc(userDocRef, {
            channels: arrayUnion(channelID),
        });

        console.log(`User ${username} successfully added to channel ${channelID}`);
    } catch (err) {
        console.error("Error adding user to channel:", err);
    }
}

export default addMemberToChannel;