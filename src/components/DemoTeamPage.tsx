import "../DemoTeamPage.css";
import { motion } from "framer-motion";
import { useState } from "react";
import {  FaUsers, FaComments } from "react-icons/fa"; // Icons

// Define Teams
const teams = [
    { id: 1, name: "Channels", icon: <FaUsers /> }

];

// Define Channels by Team
const channelsByTeam: Record<number, string[]> = {
    1: ["General", "Development", "Announcements"],
    2: ["Design", "Marketing", "Random"],
    3: ["Support", "Feedback", "Off-topic"]
};

// Define Mock Direct Messages (DMs)
const contacts: string[] = ["Alice", "Bob", "Charlie"];

function DemoTeamPage() {
    const [selectedTeam, setSelectedTeam] = useState<number | null>(1); // Default to first team
    const [viewMode, setViewMode] = useState<"channels" | "dms">("channels"); // Sidebar mode
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
            {/* Left Sidebar (Teams & DMs) */}
            <motion.div  >
                {/* DMs Icon (Switch to Direct Messages View) */}
                <motion.div 
                    className={`team-icon ${viewMode === "dms" ? "active" : ""}`} 
                    onClick={() => setViewMode("dms")}
                    whileHover={{ scale: 1.1 }}
                >
                    <FaComments size={24} />
                </motion.div>

                {/* Team Icons (Click to Show Team Channels) */}
                {teams.map(team => (
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
                        ? channelsByTeam[selectedTeam].map((channel: string, index: number) => (
                            <li key={index} className="channel-item">{channel}</li>
                          ))
                        : contacts.map((contact: string, index: number) => (
                            <li key={index} className="channel-item">{contact}</li>
                          ))
                    }
                </ul>

                {userRole !== "user" && viewMode === "channels" && (
                    <motion.button className="add-channel-button"> + Add Channel</motion.button>
                )}
            </div>

            {/*  Chat Space: Displays Messages & Input Box */}
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
