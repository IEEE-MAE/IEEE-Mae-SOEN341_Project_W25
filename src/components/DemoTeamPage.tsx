import "../DemoTeamPage.css";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa"; // arrow icons

const users = [
    { id: 1, name: "Andrew", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" }, 
    { id: 2, name: "Dallas", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
    { id: 3, name: "Eric", profilePic: "src/assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg" },
];

const channels = [ 
    "General", "Announcements", "Development"
];

function DemoTeamPage() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [userRole] = useState<"user" | "admin" | "superAdmin">("superAdmin");

    // 🌟 State for messages and input field
    const [messages, setMessages] = useState<{ text: string; sender: string; time: string }[]>([]);
    const [newMessage, setNewMessage] = useState("");

    // Function to send a message
    const sendMessage = () => {
        if (!newMessage.trim()) return;
        const time = new Date().toLocaleTimeString();
        setMessages([...messages, { text: newMessage, sender: "You", time }]);
        setNewMessage(""); // Clear input field after sending
    };

    return (
        <div className="team-page">
            {/* Sidebar for user list */}
            <motion.div className={`sidebar ${isExpanded ? "expanded" : ""}`}
                animate={{ width: isExpanded ? "200px" : "80px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <motion.button className="toggle-arrow" onClick={() => setIsExpanded(!isExpanded)}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
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

            {/* Sidebar for channels */}
            <div className="channel-sidebar">
                <h2>Channels</h2>
                <ul className="channel-list">
                    {channels.map((channel, index) => (
                        <li key={index} className="channel-item">{channel}</li>
                    ))}
                </ul>

                {userRole !== "user" && (
                    <motion.button className="add-channel-button"> + Add Channel</motion.button>
                )}
            </div>

            {/* 🌟 Chat Space: Displays Messages & Input Box */}
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

export default DemoTeamPage;