import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUsers, FaComments, FaPlus } from "react-icons/fa";
import { getCurrentUser } from "../backend/auth";
import {getUserChannels, getUsername, getUserTeam} from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";
import {createMessages} from "../backend/messages.jsx";
import {getAuth} from "firebase/auth";
import * as React from "react";

const teams = [{ id: 1, name: "Channels", icon: <FaUsers /> }];

// example names for DM feature (replace with backend implementation)
const contacts = ["Alice", "Bob", "Charlie"];

function TeamPage() {
    const [selectedTeam, setSelectedTeam] = useState(1); // start with first team
    const [viewMode, setViewMode] = useState("channels"); // sidebar mode
    const [userRole] = useState("superAdmin"); // user role (add backend implementation)
    const [team, setTeam] = useState();

    const [channels, setChannels] = useState([]);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [isUserInTeam, setIsUserInTeam] = useState(null);

    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [isAddChannelModalOpen, setAddChannelModalOpen] = useState(false);
    const [isAddDMModalOpen, setAddDMModalOpen] = useState(false);

    const [memberUsername, setMemberUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");
    const [channelName, setChannelName] = useState("");
    const [dmUsername, setDMUsername] = useState("");
    const [selectedChat,setSelectedChat] = useState(null);


    const navigate = useNavigate();

    useEffect(() => {
        const checkUserTeam = async () => {
            const user = getCurrentUser();
            if (user) {
                const userTeam = await getUserTeam();
                setIsUserInTeam(userTeam);
                setTeam(userTeam);
            } else {
                setIsUserInTeam(false);
            }
        };
        checkUserTeam();
    }, []);

    // fetch user channels
    useEffect(() => {
        const getChannelNames = async () => {
            const userChannels = await getUserChannels();
            const channelList = [];

            for (const userChannel of userChannels) {
                if (userChannel.includes(team)) {
                    const channelName = userChannel.replace(team, "");
                    channelList.push({ name: channelName, id: userChannel });
                }
            }

            setChannels(channelList);
            // if(channelList.length === 0){console.log("no channels transferred")}
            // channels.forEach(channel => {console.log("channel retrieved " + channel.name)})
        };

        getChannelNames();
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

    if(!getCurrentUser()){
        return (
            <div className="no-team">
                <h2>User not logged in</h2>
                <button
                    className="create-team-button"
                    onClick={() => navigate("/login")}
                >
                    Log In
                </button>
            </div>
        );
    }

    if (isUserInTeam === null) { // Fetching team data, throw loading message
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
                    {viewMode === "channels" && selectedTeam !== null && channels
                        ? channels.map((channel) => (
                            <li key={channel.id}
                                className={`channel-item ${selectedChat === channel.id ? "active" : ""}`}
                                onClick={() => {setSelectedChat(channel.id)}}
                            >{channel.name}</li>
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

                {/* Add DM Button */}
                {viewMode === "dms" && (
                    <motion.button
                        className="add-channel-button"
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setAddDMModalOpen(true)}
                    >
                        <FaPlus /> Add DM
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

            {isAddDMModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add Direct Message</h2>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={dmUsername}
                            onChange={(e) => setDMUsername(e.target.value)}
                        />
                        <button onClick={() => setAddDMModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding DM with: ${dmUsername}`);
                            setAddDMModalOpen(false);
                        }}>Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamPage;
