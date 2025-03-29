import { useEffect } from "react";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import {db} from "../config/firebase.jsx";

export function updateUserStatus(user) {
    useEffect(() => {
        if (!user?.uid) return;

        const userDocRef = doc(db, "users", user.uid);

        const setStatus = async (status) => {
            await updateDoc(userDocRef, {
                status: status,
                last_seen: Date.now(),
            });
        };

        setStatus("online");

        const handleUnload = () => {
            setStatus("offline");
        };

        const handleVisibilityChange = async () => {
            if (document.hidden) {
                setStatus("away");
            } else {
                setStatus("online");
            }
        };

        console.log("User status has been updated to away");

        window.addEventListener("beforeunload", handleUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user?.uid]);
}
