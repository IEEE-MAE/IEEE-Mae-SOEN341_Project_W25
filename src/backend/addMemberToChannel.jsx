import {arrayUnion, collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {getTeamAdmins, getTeamMembers, getUserTeam} from "./Queries/getUserFields.jsx";
import {getSuperUserId} from "./Queries/getSuperUser.jsx";


const addMemberToChannel = async (username, channelID) =>{
    if(!username || !channelID) return;
    try {
        /**
         ----------------------------------------------------------------------------------
         |----- if username input is all, it should add that channel to all members ------|
         ----------------------------------------------------------------------------------
         goals:
         1. if the admin types all
         2. get the superuser id
         3. update the superuser defaultchannel
         4. get list of team admins
         5. update defaultChannels for team admins
         6. get all current users
         7. update all members channels

         next:
         1. when user joins team
         2. pull from superUser default channels
         3. add to users channel

        **/

        if(username === "all"){
            const thisUserTeam = await getUserTeam();
            console.log("entered all with team: " + thisUserTeam + "channel: " + channelID);

            //gets superuser id
            const superUserID = await getSuperUserId(thisUserTeam);
            if (!superUserID) {
                console.log("ERROR: No superUser ID found.");
                return;
            }

            //update superUser channels
            await updateDoc(doc(db, "users", superUserID), {
                defaultChannels: arrayUnion(channelID),
            });

            //gets list of admins in Admins
            const Admins = await getTeamAdmins(thisUserTeam);
            console.log("Admins: ", Admins);

            //updates all admins
            for (const adminId of Admins) {
                const userDocRef = doc(db, "users", adminId);
                await updateDoc(userDocRef, {
                    defaultChannels: arrayUnion(channelID),
                });
            }

            //get list of members in Members
            const Members = await getTeamMembers(thisUserTeam);
            console.log("Admins: ", Members);

            //update all members channels
            for (const memberId of Members) {
                const userDocRef = doc(db, "users", memberId);
                await updateDoc(userDocRef, {
                    channels: arrayUnion(channelID),
                });
            }

        }
        else{

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

            // ------ otherwise it just procedes with the previous code ------


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