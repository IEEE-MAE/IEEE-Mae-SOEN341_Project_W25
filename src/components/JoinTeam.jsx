// import {SignOutAuth} from "../backend/auth.jsx";
import {getAuth} from "firebase/auth";
import { motion } from "framer-motion";
import {useNavigate} from "react-router-dom";
import "../style.css";
import {useEffect, useState} from "react";
import {pullItem} from "../backend/queryTeam.jsx";
import './TeamPage.jsx';
import {doc, getDoc, updateDoc, arrayUnion} from "firebase/firestore";
import {db} from "../config/firebase.jsx";
import {SignInAuth} from "../backend/auth.jsx";

const pageVariants = { //transition settings
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
};

const listItemVariants = {
    hidden: { opacity: 0, y:10 },
    visible: { opacity: 1, y:0, transition: {duration: 0.3}}
}

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
        <motion.div
            className = "wrapper"
            variants = {pageVariants}
            initial = "hidden"
            animate = "visible"
            exit = "exit"
        >
            <h1>Find a Team</h1>
            <div id="list">
                {teams.length === 0 ? ( <p>No teams available. <a onClick={()=> navigate("/CreateTeam")}> Create a team</a> </p>
                ) : (
                    <motion.ul
                        className = "team-list"
                        initial = "hidden"
                        animate = "visible"
                    >
                        {teams.map((teams) => (
                            <motion.li key={teams.id}
                                className="team-item"
                                onClick={() => handleJoinTeam(teams.id)}
                                style ={{cursor:"pointer"}}
                                variants = {listItemVariants}
                                whileHover = {{ scale: 1.05}}
                                whileTap = {{ scale: 0.95 }}
                            >
                                <span className="team-name">{teams.teamName}</span>
                            </motion.li>
                        ))}
                        {/*Add more team items here*/}
                    </motion.ul>
                )}
            </div>
            <p>Wanna create a team Instead? <a onClick={()=> navigate("/CreateTeam")}> Create a team</a></p>
        </motion.div>
    )
}

export default JoinTeam;