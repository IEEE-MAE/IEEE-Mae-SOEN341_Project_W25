import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUsers, FaComments, FaPlus } from "react-icons/fa";
import {getOtherUsername, getUserDMs, getUsername} from "../backend/Queries/getUserFields.jsx";
import {getUserChannels} from "../backend/Queries/getUserFields.jsx";
import {doesUserExist, getCurrentUser} from "../backend/auth";
import {getUserRole, getUserTeam} from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";
import {createMessages} from "../backend/messages.jsx";
import {realtimeDB} from "../config/firebase.jsx";
import {query, onValue, ref, orderByChild, equalTo, remove} from "firebase/database";
import * as React from "react";
import {createChannel} from "../backend/createChannel.jsx";
import addMemberToTeam from "../backend/addMemberToTeam.jsx";
import addAdminToTeam from "../backend/addAdminToTeam.jsx";
import addMemberToChannel from "../backend/addMemberToChannel.jsx";
import {createDM} from "../backend/createDM.jsx";

const teams = [{ id: 1, name: "Channels", icon: <FaUsers /> }];

// example names for DM feature (replace with backend implementation)
const contacts = ["Alice", "Bob", "Charlie"];

function TeamPage() {
    const [selectedTeam, setSelectedTeam] = useState(1); // start with first team
    const [thisUsername, setThisUsername] = useState(""); // logged in username
    const [viewMode, setViewMode] = useState("channels"); // sidebar mode
    const [userRole, setUserRole] = useState(""); // user role (add backend implementation)
    const [team, setTeam] = useState();

    const [channels, setChannels] = useState([]);
    const [dms, setDms] = useState([]);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [isUserInTeam, setIsUserInTeam] = useState(null);

    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [isAddChannelModalOpen, setAddChannelModalOpen] = useState(false);
    const [isAddDMModalOpen, setAddDMModalOpen] = useState(false);
    const [isAddChannelMemberModalOpen, setAddChannelMemberModalOpen] = useState(false);

    const [memberUsername, setMemberUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");
    const [channelName, setChannelName] = useState("");
    const [dmUsername, setDMUsername] = useState("");
    const [selectedChat,setSelectedChat] = useState(null);

    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserTeam = async () => {
            const user = getCurrentUser();
            const username = await getUsername();
            setThisUsername(username);
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

    useEffect(() => {
        if(!team) return;
        const checkUserRole = async () => {
            const role = await getUserRole();
            if(role){
                setUserRole(role);
                console.log("USER ROLE: " + userRole);
            }
            else{
                console.log("COULD NOT FIND USER ROLE");
            }
        };

        checkUserRole();
    }, [team])

    // fetch user channels
    useEffect(() => {
        if(!team) return;
        const getChannelNames = async () => {
            const userChannels = await getUserChannels();
            const channelList = [];

            for (const userChannel of userChannels) {
                if (userChannel.includes(team)) { // if user has channels in another team they won't be shown in this one
                    const channelName = userChannel.replace(team, "");
                    channelList.push({ name: channelName, id: userChannel });
                }
            }

            setChannels(channelList);
            if(channelList.length === 0){console.log("no channels transferred")}
            // channels.forEach(channel => {console.log("channel retrieved " + channel.name)})
        };

        getChannelNames();
    }, [team]);

    // fetch user dms
    useEffect(() => {
        const getDMs = async () => {
            const userDMss = await getUserDMs();
            const DMList = [];

            for (const userDM of userDMss) {
                if (userDM.includes(thisUsername)) { // display other username
                    const DMname = getDMname(userDM);
                    DMList.push({ name: DMname, id: userDM });
                }
            }

            setDms(DMList);
            if(DMList.length === 0){console.log("no channels transferred")}
            // channels.forEach(channel => {console.log("channel retrieved " + channel.name)})
        };

        getDMs();
    }, [refresh]);

    //upon clicking a channel or a dm you would subscribe to the real time messages


    useEffect(() => {
        console.log("THIS CHAT IS: "+ selectedChat);
        const messagesRef = ref(realtimeDB, 'messages');
        console.log("Filtering messages for channel:", selectedChat);

        const q = query(messagesRef, orderByChild('Location'), equalTo(selectedChat));

        const unsubscribe = onValue(q, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Use Promise.all without marking the callback as async
                Promise.all(
                    Object.entries(data).map(([id, msg]) => {
                        return getOtherUsername(msg.Sender).then(username => ({
                            id,
                            sender: username,
                            text: msg.Message,
                            time: new Date(msg.timestamp).toLocaleTimeString(),
                            timeSort: msg.timestamp
                        }));
                    })
                ).then(messagesList => {
                    // Sort in ascending order (oldest to newest)
                    messagesList.sort((a, b) => b.timeSort - a.timeSort);
                    console.log("Sorted messagesList:", messagesList);
                    setMessages(messagesList);
                })
                .catch(err => {
                    console.error("Error processing messages:", err);
                    setMessages([]);
                });
            } else {
                setMessages([]);
            }
        });

        return () => {
            unsubscribe();
            };
        },[selectedChat]);

    const getDMname = (DMid) =>{
        if (DMid.endsWith(thisUsername)) {
            return DMid.replace(new RegExp(thisUsername + "$"), "");
        } else if (DMid.startsWith(thisUsername)) {
            return DMid.replace(new RegExp("^" + thisUsername), "");
        } else {
            return DMid;
        }
    }

    // Function to send a message
    const sendMessage = async() => {
        console.log("THIS CHAT IS: "+ selectedChat);
        await createMessages(newMessage, selectedChat);
        setNewMessage("");
    };

    const handleAddChannel = async () => {
        if(channelName==="" || channelName === null){
            alert("Please enter a channel name");
            setChannelName("");
        }
        else{
            await createChannel(channelName);
            setRefresh(prev => !prev);
            setChannelName("");
            setAddChannelModalOpen(false);
        }
    };

    const handleAddDM = async () => {
        if(dmUsername==="" || dmUsername === null){
            alert("Please enter a username");
            setDMUsername("");
        }
        else{
            await createDM(dmUsername);
            setDMUsername("");
            setAddDMModalOpen(false);
            setRefresh(prev => !prev);
        }
    }

    const handleAddMember = async () => {
        await addMemberToTeam(memberUsername, team);
        setMemberUsername("");
    }

    const handleAddAdmin = async () => {
        await addAdminToTeam(adminUsername, team);
        setAdminUsername("");
    }

    const handleAddMemberToChannel= async () =>{
        await addMemberToChannel(memberUsername, selectedChat);
        setMemberUsername("");
    }

    const handleDeleteMessage = async (messageId) => {
        const messageRef = ref(realtimeDB, `messages/${messageId}`);
        await remove(messageRef);
        console.log("REMOVE MESSAGE: ", messageId);
    }

    const validUsername = async (username) => {
        const userExists = await doesUserExist(username);
        if(!userExists) {
            alert("Username doesn't exist. Please try again.");
            setMemberUsername("");
            setAdminUsername("");
            setDMUsername("");
        }
    }

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

    // if (isUserInTeam === null) { // Fetching team data, throw loading message
    //     return <div className="loading">Loading...</div>;
    // }

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
                            >   {channel.name}
                                {["admin", "superUser"].includes(userRole) &&(
                                <button className="add-button" onClick={(e) => {
                                    e.stopPropagation(); // Prevents triggering the `onClick` of the `<li>`
                                    setSelectedChat(channel.id);
                                    setAddChannelMemberModalOpen(true);
                                }}>
                                    +
                                </button>
                                )}
                            </li>
                        ))
                        : dms.map((contact) => (
                            <li key={contact.id}
                                className={`channel-item ${selectedChat === contact ? "active" : ""}`}
                                onClick={() => setSelectedChat(contact.id)}
                            >{contact.name}</li>
                        ))
                    }
                </ul>


                {/* Add Channel Button Inside Sidebar */}
                {viewMode === "channels" && ["admin", "superUser"].includes(userRole) &&(
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
                {selectedChat
                    ? (viewMode === "dms"
                            ? `Chatting with: ${getDMname(selectedChat)}`
                            : `On channel: ${selectedChat.replace(team, "")}`
                    )
                    : "Select a chat"}
            </div>
            {/* Chat Space */}
            <div className="chat-container">
                <div className="messages-box">
                    {messages.map((msg) => (
                        <div key={msg.id} className="message">
                            <strong>{msg.sender}:</strong> {msg.text} <span className="time">{msg.time}</span>
                            {["admin", "superUser"].includes(userRole) &&(
                            <button className="delete-msg-btn" onClick={() => handleDeleteMessage(msg.id)}>×</button>
                            )}
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

                {["admin", "superUser"].includes(userRole) && (
                    <>
                        <motion.button className="add-member-button" onClick={() => setAddMemberModalOpen(true)}>
                            Add Member
                        </motion.button>

                        <motion.button className="add-admin-button" onClick={() => setAddAdminModalOpen(true)}>
                            Add Admin
                        </motion.button>
                    </>
                )}
            </div>

            {/* Add Member to team Modal */}
            {isAddMemberModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add Member</h2>
                        <input
                            type="text"
                            placeholder="Enter member username"
                            value={memberUsername}
                            onChange={(e) => setMemberUsername(e.target.value)}
                            onBlur={() => validUsername(memberUsername)}
                        />
                        <button onClick={() => setAddMemberModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding member: ${memberUsername}`);
                            handleAddMember();
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
                            onBlur={() => validUsername(adminUsername)}
                        />
                        <button onClick={() => setAddAdminModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding admin: ${adminUsername}`);
                            handleAddAdmin();
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
                            onBlur={() => validUsername(dmUsername)}
                        />
                        <button onClick={() => setAddDMModalOpen(false)}>Cancel</button>
                        <button
                            onClick={() => {
                            console.log(`Adding DM with: ${dmUsername}`);
                            setAddDMModalOpen(false);
                            handleAddDM();
                        }}>Confirm</button>
                    </div>
                </div>
            )}

            {/* Add Member to channel Modal */}
            {isAddChannelMemberModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add Member to Channel</h2>
                        <input
                            type="text"
                            placeholder="Enter member username"
                            value={memberUsername}
                            onChange={(e) => setMemberUsername(e.target.value)}
                            onBlur={() => validUsername(memberUsername)}
                        />
                        <button onClick={() => setAddChannelMemberModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding member to channel: ${adminUsername}`);
                            handleAddMemberToChannel();
                            setAddChannelMemberModalOpen(false);
                        }}>Confirm</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamPage;
