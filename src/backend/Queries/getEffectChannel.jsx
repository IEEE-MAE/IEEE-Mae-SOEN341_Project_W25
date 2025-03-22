import { db, auth } from "../../config/firebase.jsx";
import {
    doc,setDoc, getDoc, query, collection, where, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';
import {getCurrentUser} from "../auth.jsx";
import {useEffect, useState} from "react";
import {getUserChannels} from "./getUserFields.jsx";
import {getSuperUserId} from "./getSuperUser.jsx";


export function getEffectChannel(team) {
    const [channels, setChannels] = useState([]);
//replace this
    useEffect(() => {
        if (!team) return;
        let unsubscribe;

        const getChannelNames = async () => {
            //--- CODE FROM getUserChannels() ---
            const user = getCurrentUser();

            try {
                //This gets the snapshot of the users doc
                const userDocRef = doc(db, "users", user.uid);
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
//wowsssaadasdasd
        getChannelNames();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [team]); // Depend on team so the listener updates when team changes

    return channels;
}

export function getEffectTeamChannels(team) {
    const [teamChannels, setTeamChannels] = useState([]);
//replace this
    useEffect(() => {
        if (!team) return;
        let unsubscribe;

        const getTeamChannelNames = async () => {
            //--- CODE FROM getUserChannels() ---
            const user = await getSuperUserId(team);

            try {
                //This gets the snapshot of the users doc
                const userDocRef = doc(db, "users", user);
                unsubscribe = onSnapshot(userDocRef, (userDocSnapshot) => {

                    if (userDocSnapshot.exists()) {
                        //puts the channels IDs from the user
                        const userData = userDocSnapshot.data();
                        const teamChannels = userData ? userData.channels : [];
                        if (!teamChannels || teamChannels.length === 0) {
                            console.log("no channels found");
                            return [];
                        }
                        console.log("********** CHANNELS FOUND: ", teamChannels);

                        //---- code from TEAMPAGE ----
                        const teamChannelList = [];

                        for (const teamChannel of teamChannels) {
                            if (teamChannel.includes(team)) { // if user has channels in another team they won't be shown in this one
                                const teamChannelName = teamChannel.replace(team, "");
                                teamChannelList.push({ name: teamChannelName, id: teamChannel });
                            }
                        }

                        setTeamChannels(teamChannelList);
                        console.log("GOT TEAM CHANNELS:" + teamChannels);
                        if(teamChannelList.length === 0){console.log("no channels transferred")}
                        // channels.forEach(channel => {console.log("channel retrieved " + channel.name)})


                    } else {
                        console.log("User document does not exist");
                    }
                });


            } catch (error) {
                console.log("error fetching user's channels: " + error);
            }
        };

        getTeamChannelNames();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [team]); // Depend on team so the listener updates when team changes

    return teamChannels;
}
