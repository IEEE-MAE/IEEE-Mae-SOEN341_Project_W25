import { motion } from "framer-motion";
import "../LandingPage.css";
import {useNavigate} from "react-router-dom";

const pageVariants = { //transition settings
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
};

function LandingPage() {
    const navigate = useNavigate();

    return (
        <motion.div
            className="landing-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >

            <div className="landing-page">
                <div className="landing-content">
                    <img src="src/assets/logo.png" alt="ChatHaven Logo" className="landing-logo" />
                    <h1>WELCOME TO CHATHAVEN</h1>
                    <p>Your team space to message, collaborate, and communicate.</p>
                    <button className="landing-button" onClick={() => navigate("/SignUp")}>Get Started</button>
                </div>
            </div>
        </motion.div>
    );
}

export default LandingPage;

