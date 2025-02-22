import { db, auth } from "../config/firebase.jsx";
import {collection, doc, setDoc, query, getDocs} from "firebase/firestore"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "@firebase/auth";

// query to see if username is taken
export const doesUserExist = async (userName) => {
    const usernameQuery = query(collection(db, "users", userName));
    const querySnapshot = await getDocs(usernameQuery);
    return querySnapshot.size !== 0; // return true if user exists (username is taken)
}


// create user in auth database and firestore database
export const createUser= async (email, password, userName)=>{
    try{
        // create account using firebase authentication
        const {user} = await createUserWithEmailAndPassword(auth, email, password);

        // store account's username in firebase collections/'users'
        await setDoc(doc(db, "users", userName), {
                username: userName,
                team: "",
                role: "",
                channels: [],
                dms: []
        });
        console.log("sign up: " + user.email);
    }
    catch(error){
        console.log("Error during signup: " + error);
        throw error;
    }
}

// sign in authentication
export const SignInAuth= async (email, password)=>{
    try{
        // log into account using firebase authentication
        const {user} = await signInWithEmailAndPassword(auth, email, password);
        console.log("sign in: " + user.email);
    }
    catch(error){
        console.log("Error during sign in: " + error);
        throw error;
    }
}

// log out
export const SignOutAuth= async ()=>{
    try{
        // logout using firebase
        await auth.signOut();
        console.log("sign out");
    }
    catch(error){
        console.log("Error during sign out: " + error);
        throw error;
    }
}