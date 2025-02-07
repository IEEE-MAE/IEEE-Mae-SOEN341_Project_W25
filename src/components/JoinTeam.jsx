// import {SignOutAuth} from "../backend/auth.tsx";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import "../style.css";
import {useEffect, useState} from "react";
import {pullItem} from "../backend/queryTeam.tsx";

// default join team page
function JoinTeam(){
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();

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

    // example sign out function (can be put wherever user will sign out)
    // const onSignOut = async () => {
    //     try {
    //         await SignOutAuth();
    //         navigate("/");
    //     }
    //     catch(error){
    //         alert("Error during sign out: " + error);
    //     }
    // }

    // temporary array for testing dynamic list creation. replace with team query from firebase
    //const teams = [ {name: "Team1", id: "1"}, {name: "Team2", id: "2"}, {name: "Team3", id: "3"}, {name: "Cami", id: "2pos"}];

    // this should send a request to superuser to join team/let user in by default
    // + assign team and status to the user
    // + add user to team member array

    const handleJoinTeam = (id) => {
        alert("THIS IS THE ID: " + id);
        console.log(id);
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