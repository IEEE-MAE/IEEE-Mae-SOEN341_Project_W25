import { collection, getDocs,} from 'firebase/firestore';
import {db} from "../config/firebase.tsx";

interface userType{
    id?: string;
   displayName: string;
   team: string;
   channel: string;
   role: string;
}

export async function pullItem(): Promise<userType[]> {
    try {
        //this pulls the collection
        const itemsRef = collection(db, 'teams');
        //pulls a snapshot of the collection
        const querySnapshot = await getDocs(itemsRef);

        const docs = querySnapshot.docs;

        const items: userType[] = [];

        //querySnapshot.forEach((doc) => {
        for(const doc of docs){
            const data = doc.data() as userType;
            items.push({
                id: doc.id,
                ...data,
            });
        }
        console.log('Retrieved Items:', items);
        return items;

    } catch (error) {
        console.log('error pulling document', error);
        return [];
    }

}