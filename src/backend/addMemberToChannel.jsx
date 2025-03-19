import {arrayUnion, collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {getTeamMembers, getUserTeam} from "./Queries/getUserFields.jsx";


const addMemberToChannel = async (username, channelID) =>{
    if(!username || !channelID) return;
    try {



        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("No user found with username:", username);
            //return;
        }

        const userData = querySnapshot.docs[0].data();
        const newUserTeam =  userData ? userData.team : null;
        const thisUserTeam = getUserTeam();
        if(!newUserTeam || !thisUserTeam) {
            console.log("error fetching teams");
            //return;
        }
        if(!newUserTeam === thisUserTeam) {
            console.log("users do not belong to the same team, can't add to channel");
            //return;
        }

        // ----- if username input is all, it should add that channel to all members ------
        if(username === "all"){
            console.log("entered all with team" + thisUserTeam + "channel: " + channelID);
            const Members = await getTeamMembers(thisUserTeam);
            console.log("members", Members);

            for (const memberId of Members) {
                const userDocRef = doc(db, "users", memberId);
                await updateDoc(userDocRef, {
                    channels: arrayUnion(channelID),
                });
            }
        }
        // ------ otherwise it just procedes with the previous code ------
        else {

            const userDocRef = querySnapshot.docs[0].ref; // get unique doc
            await updateDoc(userDocRef, {
                channels: arrayUnion(channelID),
            });

            console.log(`User ${username} successfully added to channel ${channelID}`);
        }
    } catch (err) {
        console.error("Error adding user to channel:", err);
    }
}

export default addMemberToChannel;