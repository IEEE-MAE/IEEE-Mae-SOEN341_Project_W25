import { useEffect } from "react";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {getCurrentUser} from "./auth.jsx";

export function updateUserStatus() {
    useEffect(() => {
        const user = getCurrentUser();
        if (!user?.uid) return; // Ensure user exists

        const userDocRef = doc(db, "users", user.uid);

        const handleVisibilityChange = async () => {
            if (document.hidden) {
                // User left the tab
                await updateDoc(userDocRef, {
                    last_seen: Date.now(),
                    status: "away",
                });
            } else {
                // User returned to the tab
                await updateDoc(userDocRef, {
                    status: "online",
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);
}
