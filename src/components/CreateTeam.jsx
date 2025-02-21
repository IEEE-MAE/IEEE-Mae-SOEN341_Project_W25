import {useNavigate} from "react-router-dom";
import "../style.css";
import * as React from "react";
import { motion } from "framer-motion";
import {useState} from "react";
import {createTeam} from "../backend/createTeam.jsx";
import {getAuth} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../config/firebase.jsx";

const pageVariants = { //transition settings
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
};

const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2} ,
    tap: { scale: 0.95}, }
};

const inputVariants = {
    focus: { borderColor: "#4d3174", transition: { duration: 0.3 } },
};

function CreateTeam() {
    const navigate = useNavigate();
    const [teamName, setTeam] = useState("");
    // States for storing arrays of IDs

    const auth = getAuth()
    const user = auth.currentUser


    const [superUserId, setSuperUserId] = useState("");
    const adminId = [];
    const memberId = [user.uid];
    const channelIds = [];


    //create team is made
    const onSubmit = async (e) => {
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
            // const auth = getAuth()
            // const user = auth.currentUser

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
        <motion.div
            className = "wrapper"
            variants = {pageVariants}
            initial = "hidden"
            animate = "visible"
            exit = "exit"
        >
            <h1>Create A team</h1>
            <motion.form onSubmit={onSubmit} className={"form-container"}>
                <motion.div className = "input-group">
                    <label htmlFor="TeamName">
                        <span>#</span>
                    </label>
                    <motion.input
                        name = "TeamName"
                        id = "TeamName"
                        placeholder = "Enter your team name"
                        onChange = {(e) => setTeam(e.target.value)}
                        whileFocus = "focus"
                        variants= {inputVariants}
                    />
                </motion.div>

                <motion.button
                    type = "submit"
                    className = "submit-button"
                    variants = {buttonVariants}
                    whileHover = "hover"
                    whileTap = "tap"
                >
                    Create Team
                </motion.button>
            </motion.form>
            <p>Wanna join a team Instead? <a onClick={()=> navigate("/JoinTeam")}> Join a team</a></p>
        </motion.div>
    )
}
export default CreateTeam;