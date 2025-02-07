import { db, auth } from "../config/firebase.tsx";
import firebase from "firebase/app";
import {getFirestore, collection, addDoc, getDocs, QuerySnapshot, where, query, serverTimestamp,doc} from 'firebase/firestore';
import {getAuth} from "firebase/auth";

interface teamData {
    teamName: string;
    superUserId: string;
    adminId: string[];
    memberId: string[];
}
export async function createTeam({teamName, superUserId, adminId, memberId}: teamData) {
    try {
        await addDoc(collection(db, 'teams'), {
            teamName: teamName,
            superUserId: superUserId,
            adminId: adminId,
            memberId: memberId,
        });
        console.log("stuff was sent")

        const auth = getAuth()
        const user = auth.currentUser

        await collection('users').doc(user.uid).update({
            [`teams.${teamDoc.id}`]: 'superuser'
        });
        return teamDoc;
    } catch (error) {
        console.error("Error creating team:", error);
        throw error;
    }
};
    } catch (error) {

    }
}
