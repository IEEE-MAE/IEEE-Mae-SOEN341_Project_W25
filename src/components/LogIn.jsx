import { useState } from "react";
import { motion } from "framer-motion";
import * as React from "react";
import { SignInAuth } from "../backend/auth.jsx";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.jsx";
import "../Style.css";

const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
}

function LogIn() {
    // holds user input email and password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // for navigation across website pages
    const navigate = useNavigate();

    // form submission
    const onSubmit = async (e) => {
        e.preventDefault();

        if (email && password) {
            try {
                const user = await SignInAuth(email, password); // SignInAuth returns a user object

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
                        navigate("/TeamPage"); // Redirect to create team page otherwise
                    }
                } else {
                    console.log("User document not found.");
                    navigate("/TeamPage");
                }
            } catch (error) {
                alert("Username or password is incorrect.");
            }
        } else {
            alert("Please fill in the fields.");
        }
    };

    // return display for login page
    return (
        <motion.div
            className="login-container"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="wrapper">
                <h1>Login</h1>
                {/* handles form submit */}
                <form onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="emailInput">
                            <span>@</span>
                        </label>
                        {/* get email from input */}
                        <input required type="email" name="email" id="emailInput" autoCapitalize="off" onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email" />
                    </div>
                    <div>
                        <label htmlFor="passwordInput">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#000000">
                                <path
                                    d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/>
                            </svg>
                        </label>
                        {/* get password from input */}
                        <input required type="password" name="password" id="passwordInput" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                    </div>
                    <button type="submit">Login</button>
                </form>
                {/* navigate to sign up*/}
                <p>Don't have an account? <a onClick={() => navigate("/SignUp")}>Signup</a></p>
            </div>
        </motion.div>
    );
}

export default LogIn;
