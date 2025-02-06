import {SignOutAuth} from "../backend/auth.tsx";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";

// default join team page
function JoinTeam(){

    const navigate = useNavigate();

    // to check if user is signed in
    const auth = getAuth();
    const user = auth.currentUser;

    // log-in only page
    if(!user){
        alert("You need to log in");
        navigate("/LogIn");
        return;
    }

    // example sign out function (can be put wherever user will sign out)
    const onSignOut = async () => {
        try {
            await SignOutAuth();
            navigate("/");
        }
        catch(error){
            alert("Error during sign out: " + error);
        }
    }

    // placeholder for join team page UI
    return (
        <>
            <h1>Join Team</h1>
            <h1>Create Team</h1>
            <button onClick={() => onSignOut()}> Sign Out </button>
        </>
    )
}

export default JoinTeam;