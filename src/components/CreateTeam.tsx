import {useNavigate} from "react-router-dom";
import "../style.css";

function CreateTeam() {
    const navigate = useNavigate();

    return (
        <div className="wrapper">
            <h1>Create A team</h1>
            <form>
                <div>
                    <label htmlFor="TeamName">
                        <span></span>
                    </label>
                    <input name="TeamName" id="TeamName" placeholder="enter your team name"/>
                </div>

                <button type="submit">Create Team</button>
            </form>
            <p>Wanna join a team Instead? <a onClick={()=> navigate("/JoinTeam")}> Join a team</a></p>
        </div>
    )
}

export default CreateTeam;