import {useState} from "react";
import {doesUserExist, createUser} from "../backend/auth.jsx";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {motion} from "framer-motion";
import "../Style.css"; // Ensure proper styling

const pageVariants ={
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
}


function SignUp() {
    // Holds user input username, email, password, and password verification
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstPass, setFirstPass] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    // Confirms password match
    const confirmPass = () => {
        if (firstPass !== password) {
            alert("Passwords don't match");
            setPassword("");
        }
    };

    // checks that username is unique in database
    const validUsername = async(userName) =>{
        const userExists = await doesUserExist(userName);
        if (userExists) {
            alert("Username is already taken");
            setUsername("");
        }
    }

    // upon form submission
    const onSubmit = async (e) => {
        // stops passing inputs to browser and clearing form
        e.preventDefault();

        if (firstPass !== password) {
            alert("Passwords don't match");
            setPassword("");
            return;
        }

        if (username && email && password) {
            try {
                await createUser(email, password, username);
                navigate("/TeamPage");
            } catch (error) {
                alert("Error during signup: " + error);
            }
        } else {
            alert("Please fill in the fields.");
        }
    };

    return (
        <div className="signup-container">

            <motion.div
                className="signup-container"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                >
            {/* Signup Form */}
                <div className="wrapper">
                    <h1>Signup</h1>
                    <form onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="usernameInput">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                    fill="#ffffff">
                                    <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z" />
                                </svg>
                            </label>
                            <input required type="text" name="username" id="usernameInput" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} onBlur={() => validUsername(username)} />
                        </div>
                        <div>
                            <label htmlFor="emailInput"><span>@</span></label>
                            <input required type="email" name="email" id="emailInput" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="passwordInput">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                    fill="#ffffff">
                                    <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z" />
                                </svg>
                            </label>
                            <input required type="password" name="password" id="passwordInput" placeholder="Password" onChange={(e) => setFirstPass(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="repeatPasswordInput">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                    fill="#ffffff">
                                    <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z" />
                                </svg>
                            </label>
                            <input required type="password" name="repeatPassword" id="repeatPasswordInput" placeholder="Repeat Password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => confirmPass()} />
                        </div>
                        <button type="submit">Signup</button>
                    </form>
                    <p>Already have an Account? <a onClick={() => navigate("/LogIn")}>Login</a></p>
                </div>
            </motion.div>
        </div>
    );
}

export default SignUp;
