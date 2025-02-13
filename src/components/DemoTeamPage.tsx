import "../DemoTeamPage.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa"; // arrow icons

const users = [
    { id: 1, name: "Andrew", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" }, //temp user data and icons
    { id: 2, name: "Dallas", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
    { id: 3, name: "Eric", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
    { id: 4, name: "Marlon", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
    { id: 5, name: "Emma", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
    { id: 6, name: "Frank", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
    { id: 7, name: "Grace", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
    { id: 8, name: "Hannah", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
];

const channels = [ //temp channels for testing
    "General", "Announcements", "Development", "Design", "Marketing", "Support", "Random", "Feedback"
];

function DemoTeamPage() {
    const [isExpanded, setIsExpanded] = useState(false);
    //temp role assignment for testing, needs backend implementation
    const [userRole] = useState<"user" | "admin" | "superAdmin">("superAdmin");

    return (
        <div className="team-page">
            {/* sidebar for user list (collapsable) */}
            <motion.div
                className={`sidebar ${isExpanded ? "expanded" : ""}`}
                animate={{ width: isExpanded ? "200px" : "80px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {/* toggle arrow to expand user list */}
                <motion.button
                    className="toggle-arrow"
                    onClick={() => setIsExpanded(!isExpanded)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
                </motion.button>

                <div className="user-list">
                    {users.map(user => (
                        <motion.div key={user.id} className="user-item" whileHover={{ scale: 1.1 }}>
                            <img src={user.profilePic} alt={user.name} className="user-icon" />
                            {isExpanded && <span className="username">{user.name}</span>}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* sidebar for channels */}
            <div className="channel-sidebar">
                <h2>Channels</h2>
                <ul className="channel-list">
                    {channels.map((channel, index) => (
                        <li key={index} className="channel-item">{channel}</li>
                    ))}
                </ul>

                {/* add channel button (for admin and superAdmin) */}
                {userRole !== "user" && (
                    <motion.button className="add-channel-button"> + Add Channel</motion.button>
                )}
            </div>

            {/* navigation bar (top right) */}
            <div className="top-nav">
                <motion.button
                    className="logout-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Logout
                </motion.button>

                {userRole !== "user" && (
                    <motion.button
                        className="check-requests-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Check Requests
                    </motion.button>
                )}

                {userRole === "superAdmin" && (
                    <motion.button
                        className="add-admin-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Add Admin
                    </motion.button>
                )}
            </div>
        </div>
    );
}

export default DemoTeamPage;






