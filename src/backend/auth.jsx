import { db, auth } from "../config/firebase.jsx";
import { doc, setDoc  } from "firebase/firestore"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "@firebase/auth";

// from sign up page
export const SignUpAuth= async (email : string, password : string, username :string)=>{
    try{
        // create account using firebase authentication
        const {user} = await createUserWithEmailAndPassword(auth, email, password);

        // store account's username in firebase collections/'users'
        //
        await setDoc(doc(db, "users", user.uid), {
                displayName: username,
                team: {},
                channel: {},
                role: ""
        });
        console.log("sign up: " + user.email);
        return user;
    }
    catch(error){
        console.log("Error during signup: " + error);
        throw error;
    }
}

// from log in page
export const SignInAuth= async (email : string, password: string)=>{
    try{
        // log into account using firebase authentication
        const {user} = await signInWithEmailAndPassword(auth, email, password);
        console.log("sign in: " + user.email);
        return user;
    }
    catch(error){
        console.log("Error during sign in: " + error);
        throw error;
    }
}

// from wherever user can log out
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