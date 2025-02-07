// import {SignOutAuth} from "../backend/auth.tsx";
import {getAuth} from "firebase/auth";
import {useNavigate} from "react-router-dom";
import "../style.css";

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
    const teams = [ {name: "Team1", id: "1"}, {name: "Team2", id: "2"}, {name: "Team3", id: "3"}, {name: "Cami", id: "2pos"}];

    // this should send a request to superuser to join team/let user in by default
    // + assign team and status to the user
    // + add user to team member array
    const handleJoinTeam = (teamId : string) => {
        alert("team selected: " + teamId);
    }

    return (
        <div className="wrapper">
            <h1>Find a Team</h1>
            <div id="list">
                {teams.length === 0 ? ( <p>No teams available. <a onClick={()=> navigate("/CreateTeam")}> Create a team</a> </p>
                ) : (
                    <ul className="team-list">
                        {teams.map(team =>
                            <li key={team.id}
                                className="team-item"
                                onClick={() => handleJoinTeam(team.id)}
                                style ={{cursor:"pointer"}}
                            >
                                <span className="team-name">{team.name}</span>
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