import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUsers, FaComments } from "react-icons/fa";
import { getCurrentUser } from "../backend/auth";
import { getUserTeam } from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";
import {createMessages} from "../backend/messages.jsx";
import {getAuth} from "firebase/auth";

const teams = [ // test team array (replace with backend implementation)
    { id: 1, name: "Channels", icon: <FaUsers /> }
];

// test channels for team (replace with backend implementation)
const channelsByTeam = {
    1: ["General", "Development", "Announcements"]
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

    // State for modals
    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [memberUsername, setMemberUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");

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

    //upload my message to firebase
    // const UploadMessages = async() => {
    //     try {
    //         const auth = getAuth()
    //         const user = auth.currentUser()
    //
    //         await createMessages(newMessage, "location template", user.id);
    //
    //     } catch (error) {
    //         console.log('error uploading message');
    //         throw error;
    //     }
    // }

    // Function to send a message
    const sendMessage = async() => {
        if (!newMessage.trim()) return;
        const time = new Date().toLocaleTimeString();
        setMessages([{ text: newMessage, sender: "You", time }, ...messages]);
        setNewMessage("");
        console.log("This is a message: " + newMessage);

        //upload message

        const auth = getAuth()
        const user = auth.currentUser

        await createMessages(newMessage, "location template");

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
            {/* Right Sidebar (Channels or DMs) */}
            <div className="channel-sidebar">
                {/* Toggle Icon for Switching Views */}
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
                            <li key={index} className="channel-item">{channel}</li>
                        ))
                        : contacts.map((contact, index) => (
                            <li key={index} className="channel-item">{contact}</li>
                        ))
                    }
                </ul>
            </div>

            {/* Chat Space: Displays Messages & Input Box */}
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
                <motion.button 
                    className="logout-button" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/login")}
                >
                    Logout
                </motion.button>

                <motion.button 
                    className="add-member-button" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAddMemberModalOpen(true)}
                >
                    Add Member
                </motion.button>

                <motion.button 
                    className="add-admin-button" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAddAdminModalOpen(true)}
                >
                    Add Admin
                </motion.button>
            </div>

            {/* Add Member Modal */}
            {isAddMemberModalOpen && (
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
            )}

            {/* Add Admin Modal */}
            {isAddAdminModalOpen && (
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
            )}
        </div>
    );
}

export default TeamPage;
