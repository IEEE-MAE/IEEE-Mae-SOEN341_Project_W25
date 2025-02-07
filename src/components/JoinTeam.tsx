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

    // placeholder for join team page UI
    return (
        <div className="wrapper">
            <h1>Find a Team</h1>
            <div id="list">
                <ul className="team-list">
                    <li className="team-item">
                        <span className="team-name">Team Alpha</span>
                        <button className="join-button">Join</button>
                    </li>
                    <li className="team-item">
                        <span className="team-name">Team Beta</span>
                        <button className="join-button">Join</button>
                    </li>
                    <li className="team-item">
                        <span className="team-name">Team Beta</span>
                        <button className="join-button">Join</button>
                    </li>
                    <li className="team-item">
                        <span className="team-name">Team Beta</span>
                        <button className="join-button">Join</button>
                    </li>
                    <li className="team-item">
                        <span className="team-name">Team Beta</span>
                        <button className="join-button">Join</button>
                    </li>
                    <li className="team-item">
                        <span className="team-name">Team Beta</span>
                        <button className="join-button">Join</button>
                    </li>
                    <li className="team-item">
                        <span className="team-name">Team Beta</span>
                        <button className="join-button">Join</button>
                    </li>
                    {/*Add more team items here*/}
                </ul>
            </div>
            <p>Wanna create a team Instead? <a onClick={()=> navigate("/CreateTeam")}> Create a team</a></p>
        </div>
    )
}

export default JoinTeam;