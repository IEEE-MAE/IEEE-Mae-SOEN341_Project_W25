import {db, auth} from "../config/firebase.jsx";
import {collection, doc, setDoc, query, getDocs, where, updateDoc} from "firebase/firestore"
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,getAuth} from "firebase/auth";
import {getUserTeam} from "./Queries/getUserFields.jsx";



// get current use
export const getCurrentUser = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if(!user) {
        console.log("User is not signed in.")
        return;
    }

    return user;
}


// query to see if username is taken
export const doesUserExist = async (userName) => {
    try{
        const queryUsers = query(collection(db, "users"), where("username", "==", userName));
        const querySnapshot = await getDocs(queryUsers);
        if (querySnapshot.size !== 0) {
            console.log("Username is taken");
            return true;
        }
        return false;
    }catch(err){
        console.log("Error fetching username:", err);
    }
}

// query to see if channel id is taken
export const doesChannelExist = async (channelName) => {

    const teamID = await getUserTeam();
    const channelID = teamID.concat(channelName);

    try{
        const queryChannels = query(collection(db, "users"), where("channels", "array-contains", channelID));
        const querySnapshot = await getDocs(queryChannels);
        if (querySnapshot.size !== 0) {
            console.log("Channel already exists in this team");
            return true;
        }
        return false;
    }catch(err){
        console.log("Error fetching channel:", err);
    }
}

// create user in auth database and firestore database
export const createUser= async (email, password, userName )=>{
    try{
        // create account using firebase authentication
        const {user} = await createUserWithEmailAndPassword(auth, email, password);

        // store account's username in firebase collections/'users'
        await setDoc(doc(db, "users", user.uid), {
                username: userName,
                team: "",
                role: "",
                channels: [],
                defaultChannels: [],
                dms: [],
                last_seen: Date.now(),
                status: "online"
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
        console.log("email " + email + "password " + password);
        // log into account using firebase authentication
        const {user} = await signInWithEmailAndPassword(auth, email, password);
        console.log("sign in: " + user.email);

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            last_seen: Date.now(),
            status: "online",
        });

        return user;
    }
    catch(error){
        console.log("Error during sign in: " + error);
        throw error;
    }
}

// log out
export const SignOutAuth= async ()=>{
    try{
        const user = getCurrentUser();
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            last_seen: Date.now(),
            status: "offline",
        });
        console.log("User status updated");

        // logout using firebase
        await auth.signOut();
        console.log("sign out");


    }
    catch(error){
        console.log("Error during sign out: " + error);
        throw error;
    }
}