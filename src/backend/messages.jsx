import { db, realtimeDB } from "../config/firebase.jsx";
import { getCurrentUser } from "./auth.jsx";
import { ref, push } from "firebase/database";

export const createMessages = async (Message, Location, request = false, invite = false, channel = null, replyPayload = null,) => {
    try {
        const user = getCurrentUser();

        const messageData = {
            Message,
            Location,
            Sender: user.uid,
            timestamp: Date.now(),
            isRequest: request,
            isInvite: invite,
            refChannelID: channel,
            replyTo: replyPayload ? replyPayload.replyTo : null,
        };


        const realtimeRef = ref(realtimeDB, 'messages');
        await push(realtimeRef, messageData);
        console.log("Messages stored in RealtimeDB successfully.");
    } catch (error) {
        console.log('error creating message');
        throw error;
    }
};


