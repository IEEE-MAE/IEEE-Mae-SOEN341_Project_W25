import { useEffect } from "react";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {getCurrentUser} from "./auth.jsx";

export function updateUserStatus(user) {
    useEffect(() => {
        if (!user?.uid) return; // Ensure user exists

        const userDocRef = doc(db, "users", user.uid);

        const setOnline = async () => {
            await updateDoc(userDocRef, {
                status: "online",
            });
        };

        setOnline();

        const handleVisibilityChange = async () => {
            if (document.hidden) {
                await updateDoc(userDocRef, {
                    last_seen: Date.now(),
                    status: "away",
                });
            } else {
                setOnline()
            }
        };

        console.log("User status has been updated to away");

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user?.uid]);
}
