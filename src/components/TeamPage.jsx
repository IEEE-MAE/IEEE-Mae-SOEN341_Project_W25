import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUsers, FaComments } from "react-icons/fa";
import { getCurrentUser } from "../backend/auth";
import { getUserTeam } from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";


const teams = [ // test team array (replace with backend implementation)
    { id: 1, name: "Channels", icon: <FaUsers /> }
];

// test channels for team (replace with backend implementation)
const channelsByTeam = {
    1: ["General", "Development", "Announcements"],
    2: ["Design", "Marketing", "Random"],
    3: ["Support", "Feedback", "Off-topic"]
};

// example names for DM feature (replace with backend implementation)
const contacts = ["Alice", "Bob", "Charlie"];

function TeamPage() {
    const [selectedTeam, setSelectedTeam] = useState(1); // start with first team
    const [viewMode, setViewMode] = useState("channels"); // sidebar mode
    const [userRole] = useState("superAdmin"); // user role (add backend implementation)

    // State for messages and input field
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    // State to check if the user is part of a team
    const [isUserInTeam, setIsUserInTeam] = useState(null);

    const navigate = useNavigate();

    useEffect(() => { // Fetch user and team
        const checkUserTeam = async () => {
            const user = getCurrentUser();
            if (user) {
                const userTeam = await getUserTeam(user.uid);
                setIsUserInTeam(!!userTeam);
            } else {
                setIsUserInTeam(false);
            }
        };
        checkUserTeam();
    }, []);

    // Function to send a message
    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const time = new Date().toLocaleTimeString();
        setMessages([...messages, { text: newMessage, sender: "You", time }]);
        setNewMessage("");
    };

    if (isUserInTeam === null) { // Fetching team data, throw loading message
        return <div className="loading">Loading...</div>;
    }

    if (!isUserInTeam) { // Content for if user is not in a team already
        return (
            <div className="no-team">
                <h2>Don't Have a Team?</h2>
                <a href="/create-team">Contact the team admin to add you or create a team now</a>
                <button
                    className="create-team-button"
                    onClick={() => navigate("/createTeam")}
                >
                    Create a Team
                </button>
            </div>
        );
    }

    return ( // Content for if user is part of a team
        <div className="team-page">
            {/* Left Sidebar (Teams & DMs) */}
            <motion.div>
                {/* DMs Icon (Switch to Direct Messages View) */}
                <motion.div
                    className={`team-icon ${viewMode === "dms" ? "active" : ""}`}
                    onClick={() => setViewMode("dms")}
                    whileHover={{ scale: 1.1 }}
                >
                    <FaComments size={24} />
                </motion.div>

                {/* Team Icons (Click to Show Team Channels) */}
                {teams.map((team) => (
                    <motion.div
                        key={team.id}
                        className={`team-icon ${selectedTeam === team.id && viewMode === "channels" ? "active" : ""}`}
                        onClick={() => {
                            setSelectedTeam(team.id);
                            setViewMode("channels");
                        }}
                        whileHover={{ scale: 1.1 }}
                    >
                        {team.icon}
                    </motion.div>
                ))}
            </motion.div>

            {/* Right Sidebar (Channels or DMs) */}
            <div className="channel-sidebar">
                <h2>{viewMode === "dms" ? "Direct Messages" : ` ${teams.find(t => t.id === selectedTeam)?.name}`}</h2>

                <ul className="channel-list">
                    {viewMode === "channels" && selectedTeam !== null && channelsByTeam[selectedTeam]
                        ? channelsByTeam[selectedTeam].map((channel, index) => (
                            <li key={index} className="channel-item">{channel}</li>
                        ))
                        : contacts.map((contact, index) => (
                            <li key={index} className="channel-item">{contact}</li>
                        ))
                    }
                </ul>

                {userRole !== "user" && viewMode === "channels" && (
                    <motion.button className="add-channel-button">
                        + Add Channel
                    </motion.button>
                )}
            </div>

            {/* Chat Space: Displays Messages & Input Box */}
            <div className="chat-container">
                {/* Message Display Area */}
                <div className="messages-box">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <strong>{msg.sender}:</strong> {msg.text} <span className="time">{msg.time}</span>
                        </div>
                    ))}
                </div>

                {/* Input Field & Send Button */}
                <div className="message-input">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input-field"
                    />
                    <button onClick={sendMessage} className="send-button">Send</button>
                </div>
            </div>

            {/* Top Navigation Bar */}
            <div className="top-nav">
                <motion.button className="logout-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Logout
                </motion.button>

                {userRole !== "user" && (
                    <motion.button className="check-requests-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        Check Requests
                    </motion.button>
                )}

                {userRole === "superAdmin" && (
                    <motion.button className="add-admin-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        Add Admin
                    </motion.button>
                )}
            </div>
        </div>
    );
}

export default TeamPage;

