import { collection, getDocs, where, query} from 'firebase/firestore';
import {db} from "../../config/firebase.jsx";


export async function pullUser(targetName) {
    try {
        const q = query(collection(db, 'users'), where('username', '==', targetName));

        const querySnapshot = await getDocs(q);

        const docs = querySnapshot.docs;

        const items = [];
        let userId = null;
        querySnapshot.docs.forEach((doc) => {
            userId = doc.id;
        })
        console.log('Retrieved Items:', items);
        return userId;

    } catch (error) {
        console.log('error pulling document', error);
        return [];
    }

}


// export async function pullUser() {
//     try {
//         //this pulls the collection
//         const itemsRef = collection(db, 'teams');
//         //pulls a snapshot of the collection
//
//
//         const querySnapshot = await getDocs(itemsRef);
//
//         const docs = querySnapshot.docs;
//
//         const items = [];
//
//         //querySnapshot.forEach((doc) => {
//         for(const doc of docs){
//             const data = doc.data();
//             items.push({
//                 id: doc.id,
//                 ...data,
//             });
//         }
//         console.log('Retrieved Items:', items);
//         return items;
//
//     } catch (error) {
//         console.log('error pulling document', error);
//         return [];
//     }
//
// }