import { db, auth } from "../../config/firebase.jsx";
import {doc,setDoc, getDoc, query, collection, where, getDocs, updateDoc, onSnapshot} from 'firebase/firestore';
import {getCurrentUser} from "../auth.jsx";
import {useEffect, useState} from "react";
import {getUsername, getUserTeam} from "./getUserFields.jsx";
import {getSuperUserId} from "./getSuperUser.jsx";
import {getAuth} from "firebase/auth";

export function useDefaultChannels(team) {
    const [defaultChannelIds, setDefaultChannelIds] = useState([]);

    useEffect(() => {
        if (!team) return;

        let unsubscribe;

        const getDefaultChannelIds = async () => {
            try {
                const superUserID = await getSuperUserId(team); // <- get superUser's doc
                const userDocRef = doc(db, "users", superUserID);

                unsubscribe = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.data();
                        const defaults = userData?.defaultChannels || [];
                        const teamDefaults = defaults.filter(id => id.includes(team));
                        setDefaultChannelIds(teamDefaults);
                    } else {
                        console.log("SuperUser document does not exist");
                    }
                });
            } catch (err) {
                console.error("Failed to fetch default channels from superUser:", err);
            }
        };

        getDefaultChannelIds();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [team]);

    return defaultChannelIds;
}
export function getEffectChannel(team, type) {

    const [channels, setChannels] = useState([]);
    //replace this
    useEffect(() => {
        if (!team) return;
        let unsubscribe;

        const getChannelNames = async () => {
            //--- CODE FROM getUserChannels() ---

            let userID;
            if(type === "user"){
                userID = await getCurrentUser().uid;
            }
            else if(type === "team"){
                userID = await getSuperUserId(team);
            }
            else{
                console.log("Error in getEffectChannel, type undefined");
                return;
            }

            try {
                //This gets the snapshot of the users doc
                const userDocRef = doc(db, "users", userID);
                unsubscribe = onSnapshot(userDocRef, (userDocSnapshot) => {

                    if (userDocSnapshot.exists()) {
                        //puts the channels IDs from the user
                        const userData = userDocSnapshot.data();
                        const userChannels = userData ? userData.channels : [];
                        if (!userChannels || userChannels.length === 0) {
                            console.log("no channels found");
                            return [];
                        }
                        console.log("********** CHANNELS FOUND: ", userChannels);

                        //---- code from TEAMPAGE ----
                        const channelList = [];

                        for (const userChannel of userChannels) {
                            if (userChannel.includes(team)) { // if user has channels in another team they won't be shown in this one
                                const channelName = userChannel.replace(team, "");
                                channelList.push({ name: channelName, id: userChannel });
                            }
                        }

                        setChannels(channelList);
                        if(channelList.length === 0){console.log("no channels transferred")}
                        // channels.forEach(channel => {console.log("channel retrieved " + channel.name)})


                    } else {
                        console.log("User document does not exist");
                    }
                });

            } catch (error) {
                console.log("error fetching user's channels: " + error);
            }
        };
        getChannelNames();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [team]); // Depend on team so the listener updates when team changes

    return channels;
}


export const getDMname = (DMid,thisUsername) =>{
    if (DMid.endsWith(thisUsername)) {
        return DMid.replace(new RegExp(thisUsername + "$"), "");
    } else if (DMid.startsWith(thisUsername)) {
        return DMid.replace(new RegExp("^" + thisUsername), "");
    } else {
        return DMid;
    }
};

export function getEffectMessages(team) {
    const [dms, setDms] = useState([]);


//replace this
    useEffect(() => {
        let unsubscribe;


        const getDmNames = async () => {
            //--- CODE FROM getUserChannels() ---
            const user = getCurrentUser();
            const thisUsername = await getUsername();

            try {
                //This gets the snapshot of the users doc
                const userDocRef = doc(db, "users", user.uid);
                unsubscribe = onSnapshot(userDocRef, (userDocSnapshot) => {

                    if (userDocSnapshot.exists()) {
                        //puts the channels IDs from the user
                        const userData = userDocSnapshot.data();
                        const userDMss =  userData ? userData.dms : [];
                        if(!userDMss || userDMss.length === 0) {
                            console.log("no DMs found");
                            //setDms([]);  //--------- ADDITION -> remove if no work ----------------
                            return [];
                        }

                        console.log("********** DMs FOUND: ", userDMss);

                        //---- code from TEAMPAGE ----
                        const DMList = [];

                        for (const userDM of userDMss) {
                            if (userDM.includes(thisUsername)) { // display other username
                                const DMname = getDMname(userDM, thisUsername);
                                DMList.push({ name: DMname, id: userDM });
                            }
                        }

                        setDms(DMList);
                        if(DMList.length === 0){console.log("no dms transferred")}
                        // DMList.forEach(dm => {console.log("dm retrieved " + dm.name)})




                    } else {
                        console.log("User document does not exist");
                    }
                });

            } catch (error) {
                console.log("error fetching user's channels: " + error);
            }
        };

        getDmNames();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [team]); // Depend on team so the listener updates when team changes

    return dms;
}

//local page refresh
const waitForUser = () => {
    return new Promise((resolve) => {
        const check = () => {
            const user = getAuth().currentUser;
            if (user) {
                resolve(user);
            } else {
                setTimeout(check, 100); // Try again in 100ms
            }
        };
        check();
    });
};

export function getEffectTeam() {
    const [team, setTeam] = useState();


    useEffect(() => {
        let unsubscribe;

        const checkUserTeam = async () => {

            const user = await waitForUser();
            //code from getUserFeild;
            try{
                //This gets the snapshot of the users doc
                const userDocRef = doc(db, "users", user.uid);
                unsubscribe = onSnapshot(userDocRef, (userDocSnapshot) => {
                    if (userDocSnapshot.exists()) {

                        //puts the team ID from the user into const teamID
                        const userData = userDocSnapshot.data();
                        const teamID = userData ? userData.team : null;
                        if (!teamID) {
                            console.log("no teamID");
                            return null;
                        }

                        //teampage code
                        if (user) {
                            setTeam(teamID);
                        } else {
                            setTeam(false);
                        }
                    } else {
                        console.log("User doc not found");
                    }
                });

            }catch(error){
                console.log("error fetching user's team: " + error);
            }
        };
        checkUserTeam();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []); // Depend on team so the listener updates when team changes

    return team;
}



