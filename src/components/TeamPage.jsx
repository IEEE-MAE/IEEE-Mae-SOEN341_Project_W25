import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUsers, FaComments, FaPlus } from "react-icons/fa";
import { getCurrentUser } from "../backend/auth";
import { getUserTeam } from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";
import { createMessages } from "../backend/messages.jsx";
import { getAuth } from "firebase/auth";

const teams = [{ id: 1, name: "Channels", icon: <FaUsers /> }];

const channelsByTeam = {
    1: ["General", "Development", "Announcements"]
};

const contacts = ["Alice", "Bob", "Charlie"];

function TeamPage() {
    const [selectedTeam, setSelectedTeam] = useState(1);
    const [viewMode, setViewMode] = useState("channels");
    const [userRole, setUserRole] = useState("superAdmin");

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [isUserInTeam, setIsUserInTeam] = useState(null);

    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [isAddChannelModalOpen, setAddChannelModalOpen] = useState(false);

    const [memberUsername, setMemberUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");
    const [channelName, setChannelName] = useState("");
    const [selectedChat,setSelectedChat] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {
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

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const time = new Date().toLocaleTimeString();
        setMessages([{ text: newMessage, sender: "You", time }, ...messages]);
        setNewMessage("");

        const auth = getAuth();
        const user = auth.currentUser;

        await createMessages(newMessage, "location template");
    };

    const handleAddChannel = () => {
        if (!channelName.trim()) return;

        channelsByTeam[selectedTeam].push(channelName);
        setChannelName("");
        setAddChannelModalOpen(false);
    };

    if (isUserInTeam === null) {
        return <div className="loading">Loading...</div>;
    }

    if (!isUserInTeam) {
        return (
            <div className="no-team">
                <h2>Don't Have a Team?</h2>
                <a href="/create-team">Contact the team admin to add you or create a team now</a>
                <button className="create-team-button" onClick={() => navigate("/createTeam")}>
                    Create a Team
                </button>
            </div>
        );
    }

    return (
        <div className="team-page">
            {/* Right Sidebar (Channels or DMs) */}
            <div className="channel-sidebar">
                <motion.div
                    className="toggle-btn"
                    onClick={() => setViewMode(viewMode === "dms" ? "channels" : "dms")}
                    whileHover={{ scale: 1.4 }}
                >
                    {viewMode === "dms" ? <FaComments size={24} /> : <FaUsers size={24} />}
                    <span className="view-toggle-text">
                        Switch to {viewMode === "dms" ? "Channels" : "dms"}
                    </span>
                </motion.div>

                <h2>{viewMode === "dms" ? "Direct Messages" : ` ${teams.find(t => t.id === selectedTeam)?.name}`}</h2>

                <ul className="channel-list">
                    {viewMode === "channels" && selectedTeam !== null && channelsByTeam[selectedTeam]
                        ? channelsByTeam[selectedTeam].map((channel, index) => (
                            <li key={index}
                                className={`channel-item ${selectedChat === channel ? "active" : ""}`}

                                onClick={() => setSelectedChat(channel)}
                            >{channel}</li>

                        ))
                        : contacts.map((contact, index) => (
                            <li key={index}
                                className={`channel-item ${selectedChat === contact ? "active" : ""}`}
                                onClick={() => setSelectedChat(contact)}
                            >{contact}</li>
                        ))
                    }
                </ul>

                {/* Add Channel Button Inside Sidebar */}
                {viewMode === "channels" && (
                    <motion.button 
                        className="add-channel-button" 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAddChannelModalOpen(true)}
                    >
                        <FaPlus /> Add Channel
                    </motion.button>
                )}
            </div>

            <div className="chat-name">
                {/*Chat Name ie who are you chatting with */}
                {selectedChat ? `Chatting with: ${selectedChat}` : "Select a chat"}
            </div>
            {/* Chat Space */}
            <div className="chat-container">
                <div className="messages-box">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            <strong>{msg.sender}:</strong> {msg.text} <span className="time">{msg.time}</span>
                        </div>
                    ))}
                </div>

                <div className="message-input">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                        className="input-field"
                    />
                    <button onClick={sendMessage} className="send-button">Send</button>
                </div>
            </div>

            {/* Top Navigation Bar */}
            <div className="top-nav">
                <motion.button className="logout-button" onClick={() => navigate("/login")}>
                    Logout
                </motion.button>

                <motion.button className="add-member-button" onClick={() => setAddMemberModalOpen(true)}>
                    Add Member
                </motion.button>

                <motion.button className="add-admin-button" onClick={() => setAddAdminModalOpen(true)}>
                    Add Admin
                </motion.button>
            </div>

            {/* Add Member Modal */}
            {isAddMemberModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add Member</h2>
                        <input
                            type="text"
                            placeholder="Enter member username"
                            value={memberUsername}
                            onChange={(e) => setMemberUsername(e.target.value)}
                        />
                        <button onClick={() => setAddMemberModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding member: ${memberUsername}`);
                            setAddMemberModalOpen(false);
                        }}>Confirm</button>
                    </div>
                </div>
            )}

            {/* Add Admin Modal */}
            {isAddAdminModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add Admin</h2>
                        <input
                            type="text"
                            placeholder="Enter admin username"
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                        />
                        <button onClick={() => setAddAdminModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding admin: ${adminUsername}`);
                            setAddAdminModalOpen(false);
                        }}>Confirm</button>
                    </div>
                </div>
            )}

            {/* Add Channel Modal */}
            {isAddChannelModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add Channel</h2>
                        <input
                            type="text"
                            placeholder="Enter channel name"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                        />
                        <button onClick={() => setAddChannelModalOpen(false)}>Cancel</button>
                        <button onClick={handleAddChannel}>Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamPage;
