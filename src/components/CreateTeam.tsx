import {useNavigate} from "react-router-dom";
import "../style.css";
import * as React from "react";
import {useState} from "react";
import {createTeam} from "../backend/createTeam.tsx";
import {getAuth} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../config/firebase.tsx";

function CreateTeam() {
    const navigate = useNavigate();
    const [teamName, setTeam] = useState("");
    // States for storing arrays of IDs

    const [superUserId, setSuperUserId] = useState("");
    const adminId: string[] = [];
    const memberId: string[] = [];
    const channelIds: string[] = [];

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTeam({teamName, superUserId, adminId, memberId, channelIds});
            console.log("Successfully created team");
            // Optionally, navigate to the newly created team or show a success message.
            //console.log("Team created with ID:", teamDoc.id);
            //navigate(`/team/${teamDoc.id}`);
        } catch (error) {
            console.error("Error creating team:", error);
        }

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
            <h1>Create A team</h1>
            <form onSubmit={onSubmit}>
                <div>
                    <label htmlFor="TeamName">
                        <span></span>
                    </label>
                    <input name="TeamName" id="TeamName" placeholder="enter your team name" onChange={(e) => setTeam(e.target.value)}/>
                </div>

                <button type="submit">Create Team</button>
            </form>
            <p>Wanna join a team Instead? <a onClick={()=> navigate("/JoinTeam")}> Join a team</a></p>
        </div>
    )

}
export default CreateTeam;