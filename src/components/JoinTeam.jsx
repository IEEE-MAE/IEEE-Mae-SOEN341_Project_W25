// import {SignOutAuth} from "../backend/auth.jsx";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import "../style.css";
import {useEffect, useState} from "react";
import {pullItem} from "../backend/queryTeam.jsx";
import './TeamPage';
import {doc, getDoc, updateDoc, arrayUnion} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {SignInAuth} from "../backend/auth.jsx";

// default join team page
function JoinTeam(){

    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);

    const fetchData = async () => {
        try {
            const retrievedItems = await pullItem();
            setTeams(retrievedItems);
        } catch (err) {
            console.log(err);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);
    // to check if user is signed in
    const auth = getAuth();
    const user = auth.currentUser;

    // log-in only page
    if(!user){
        alert("You need to log in");
        navigate("/LogIn");
        return;
    }


    // this should send a request to superuser to join team/let user in by default
    const handleJoinTeam = async (id) => {

        // add the team id to the user's document and update their role to "member"
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
            team: id,
            role: "member",
        });

        console.log("user " + user.uid + " joined team " + id);

        // add the user's id to the team document
        const teamDocRef = doc(db, 'teams', id);
        await updateDoc(teamDocRef, {
            memberId: arrayUnion(user.uid)
        });

        // if user got team, navigate to the team page
        try {
            const auth = getAuth()
            const user = auth.currentUser

            if (!user || !user.uid) {
                throw new Error("User authentication failed.");
            }

            // Fetch user document from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.team && Object.keys(userData.team).length > 0) {
                    navigate("/TeamPage"); // Redirect to team page if user has a team
                } else {
                    navigate("/CreateTeam"); // Redirect to create team page otherwise
                }
            } else {
                console.log("User document not found.");
                navigate("/CreateTeam");
            }
        } catch (error) {
            alert("Error during sign in: " + error);
        }


    }

    return (
        <div className="wrapper">
            <h1>Find a Team</h1>
            <div id="list">
                {teams.length === 0 ? ( <p>No teams available. <a onClick={()=> navigate("/CreateTeam")}> Create a team</a> </p>
                ) : (
                    <ul className="team-list">
                        {teams.map((teams) =>
                            <li key={teams.id}
                                className="team-item"
                                onClick={() => handleJoinTeam(teams.id)}
                                style ={{cursor:"pointer"}}
                            >
                                <span className="team-name">{teams.teamName}</span>
                            </li>)}
                        {/*Add more team items here*/}
                    </ul>
                )}
            </div>
            <p>Wanna create a team Instead? <a onClick={()=> navigate("/CreateTeam")}> Create a team</a></p>
        </div>
    )
}

export default JoinTeam;