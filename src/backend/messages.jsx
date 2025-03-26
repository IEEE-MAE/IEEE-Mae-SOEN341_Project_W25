import { db, realtimeDB } from "../config/firebase.jsx";
import { collection, addDoc } from "firebase/firestore";
import { getCurrentUser } from "./auth.jsx";
import { ref, set } from "firebase/database";

export const createMessages = async (Message, Location, replyPayload = null, request = false, invite = false, channel = null) => {
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
            ...(replyPayload && { replyTo: replyPayload.replyTo }),
        };

        const docRef = await addDoc(collection(db, 'messages'), messageData);
        console.log("message stored: /" + docRef.id);

        const realtimeRef = ref(realtimeDB, 'messages/' + docRef.id);
        await set(realtimeRef, messageData);
        console.log("Messages stored in RealtimeDB successfully.");
    } catch (error) {
        console.log('error creating message');
        throw error;
    }
};


