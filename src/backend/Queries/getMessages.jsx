import { collection, getDocs, where, query} from 'firebase/firestore';
import {db} from "../../config/firebase.jsx";


export async function getMessages(targetLocation) {
    try {
        const q = query(collection(db, 'messages'), where('Location', '==', targetLocation));

        const querySnapshot = await getDocs(q);

        const docs = querySnapshot.docs;

        const items = [];
        let userId = null;

        for (var doc of docs){
            const data = doc.data()
            items.push({
                id: doc.id,
                ...data,
            });
        }
        // querySnapshot.docs.forEach((doc) => {
        //     userId = doc.id;
        // })
        console.log('Retrieved Items:', items);
        return userId;

    } catch (error) {
        console.log('error pulling document', error);
        return [];
    }

}