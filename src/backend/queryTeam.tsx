import {getFirestore, collection, addDoc, getDocs, QuerySnapshot, where, query, orderBy} from 'firebase/firestore';
import {db} from '@/Configurations/FirebaseConfig'
//import {getAuth} from 'firebase/auth'

interface ItemType{
    id?: string;
    teamName: string;
    superUserId: string;
    adminId: string[];
    memberId: string[];
    channelIds: string[];
}

export async function pullItem(): Promise<ItemType[]> {
    try {
        //this pulls the collection
        const itemsRef = collection(db, 'teams');
        //pulls a snapshot of the collection
        const querySnapshot = await getDocs(itemsRef);

        const docs = querySnapshot.docs;

        const items: ItemType[] = [];

        //querySnapshot.forEach((doc) => {
        for(var doc of docs){
            const data = doc.data() as ItemType;
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