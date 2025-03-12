import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUsers, FaComments, FaPlus } from "react-icons/fa";
import {getOtherUsername, getUserTeam} from "../backend/Queries/getUserFields.jsx";
import {getUserChannels, getUsername} from "../backend/Queries/getUserFields.jsx";
import {doesUserExist, getCurrentUser} from "../backend/auth";
import {getUserRole} from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";
import {createMessages} from "../backend/messages.jsx";
import {getAuth} from "firebase/auth";
import {getMessages} from "../backend/Queries/getMessages.jsx";
import {db, realtimeDB} from "../config/firebase.jsx";

import {
    off,
    onValue,
    ref,
    orderByChild,
    orderByValue,
    equalTo,
    get,
    limitToLast,
    limitToFirst,
    set,
    remove, query
} from "firebase/database";

import * as React from "react";
import {createChannel} from "../backend/createChannel.jsx";
import addMemberToTeam from "../backend/addMemberToTeam.jsx";
import addAdminToTeam from "../backend/addAdminToTeam.jsx";
import addMemberToChannel from "../backend/addMemberToChannel.jsx";

const teams = [{ id: 1, name: "Channels", icon: <FaUsers /> }];

// example names for DM feature (replace with backend implementation)
const contacts = ["Alice", "Bob", "Charlie"];

function TeamPage() {
    const [selectedTeam, setSelectedTeam] = useState(1); // start with first team
    const [viewMode, setViewMode] = useState("channels"); // sidebar mode
    const [userRole, setUserRole] = useState(""); // user role (add backend implementation)
    const [team, setTeam] = useState();

    const [channels, setChannels] = useState([]);

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

    const usersRef = ref(realtimeDB, 'users');

//     set(usersRef, {
//         user1: { name: 'Alice', team: 'alpha' },
//         user2: { name: 'Bob', team: 'alpha' },
//         user3: { name: 'Charlie', team: 'alpha' },
//         user4: { name: 'David', team: 'gamma' }
//     }).then(() => {
//         console.log("Test data written successfully!");
//     }).catch((error) => {
//         console.error("Error writing test data:", error);
//     });
//
// // 3. Query the data using `orderByChild('team')` and `equalTo('alpha')`
//     const q = query(usersRef, orderByChild('team'), equalTo('alpha'));
//
//     onValue(q, (snapshot) => {
//         if (snapshot.exists()) {
//             console.log('Query Result for team "alpha":', snapshot.val());
//         } else {
//             console.log('No users found for team "alpha".');
//         }
//     });


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

            // const userTeam = await getUserTeam();
            // if (!team) {
            //     console.error("Team is undefined. Please check your team data.");
            //     return channelList; // Return empty or handle the error as needed
            // }



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


    //upon clicking a channel or a dm you would subscribe to the real time messages



    useEffect(() => {
        console.log("THIS CHAT IS: "+ selectedChat);
        const messagesRef = ref(realtimeDB, 'messages');
        console.log("Filtering messages for channel:", selectedChat);

        const q = query(messagesRef, orderByChild('Location'), equalTo(selectedChat));

        onValue(q, (snapshot) => {
            if(!snapshot.exists){console.log("ERROR BIG ERROR")}
                const data = snapshot.val();
            if (data) {
                // Use Promise.all without marking the callback as async
                Promise.all(
                    Object.entries(data).map(([id, msg]) => {
                        return getOtherUsername(msg.Sender).then(username => ({
                            id,
                            Location: msg.Location,
                            text: msg.Message,
                            sender: username,
                            time: new Date(msg.timestamp).toLocaleTimeString()
                        }));
                    })
                ).then(messagesList => {
                    console.log("messagesList:", messagesList);
                    setMessages(messagesList);
                }).catch(err => {
                    console.error("Error processing messages:", err);
                    setMessages([]);
                });
    //
    //
    //
    //             // ).then(messagesList => {
    //             //     // Sort in ascending order (oldest to newest)
    //             //     messagesList.sort((a, b) => a.timestamp - b.timestamp);
    //             //     console.log("Sorted messagesList:", messagesList);
    //             //     setMessages(messagesList);
    //             // }).catch(err => {
    //             //     console.error("Error processing messages:", err);
    //             //     setMessages([]);
    //             // });
    //
    //
            } else {
                setMessages([]);
            }
        });
    //
    //         // const messagesList = data
    //         //     ? Object.entries(data).map(([id, msg]) => ({
    //         //         id,
    //         //         sender: getOtherUsername(msg.Sender),                  // assuming stored as "Sender"
    //         //         text: msg.Message,                   // assuming stored as "Message"
    //         //         time: new Date(msg.timestamp).toLocaleTimeString() // convert timestamp to human-readable time
    //         //     }))
    //         //     : [];
    //
    //
    //
    //         // setMessages([{ text: data.message, sender: getOtherUsername(data.sender), time: data.timestamp }, ...messages]);
    //         // console.log("This is a message: " + newMessage);
    //
    //     // });
    //
    //
    //
    //
        return () => {
            };
        },[selectedChat]);



    // Function to send a message
    //now it is to load messages
    const sendMessage = async() => {

//         // 2. Write test data to Firebase Realtime Database
//         const usersRef = ref(realtimeDB, 'users');
//         set(usersRef, {
//             user1: { name: 'Alice', team: 'alpha' },
//             user2: { name: 'Bob', team: 'beta' },
//             user3: { name: 'Charlie', team: 'alpha' },
//             user4: { name: 'David', team: 'gamma' }
//         }).then(() => {
//             console.log("Test data written successfully!");
//         }).catch((error) => {
//             console.error("Error writing test data:", error);
//         });
//
// // 3. Query the data using orderByChild('team') and equalTo('alpha')
//         const q = query(usersRef, orderByChild('team'));
//
//         onValue(q, (snapshot) => {
//             if (snapshot.exists()) {
//                 console.log('Query Result for team "alpha":', snapshot.val());
//             } else {
//                 console.log('No users found for team "alpha".');
//             }
//         });


        console.log("THIS CHAT IS: "+ selectedChat);
        await createMessages(newMessage, selectedChat);
        setNewMessage("");

        // const username = await getCurrentUser().uid;
        // console.log("MY username: " + username);
        // // const recentPostsRef = query(ref(realtimeDB, 'messages'),orderByChild('Sender'), equalTo(username));
        // const recentPostsRef = query(ref(realtimeDB, 'messages'), orderByChild('Sender'));
        // onValue(recentPostsRef, (snapshot) => {
        //     if(snapshot.exists()){
        //         snapshot.forEach(childSnapshot => {
        //             console.log(childSnapshot.key, childSnapshot.val());
        //         });
        //     }else{
        //         console.log("NO MATCHING DATA");
        //     }
        // })
        // console.log("this ran")


    };

    const handleDeleteMessage = async (messageId) => {
        await remove(messageId);
        console.log("REMOVE MESSAGE: ", messageId);
    }

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

    const validUsername = async (username) => {
        const userExists = await doesUserExist(username);
        if(!userExists) {
            alert("Username doesn't exist. Please try again.");
            setMemberUsername("");
            setAdminUsername("");
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
                        : contacts.map((contact, index) => (
                            <li key={index}
                                className={`channel-item ${selectedChat === contact ? "active" : ""}`}
                                onClick={() => setSelectedChat(contact)}
                            >{contact}</li>
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
                {selectedChat ? `Chatting with: ${selectedChat.replace(team, "")}` : "Select a chat"}
            </div>
            {/* Chat Space */}
            <div className="chat-container">
                <div className="messages-box">
                    {messages.map((msg) => (
                        <div key={msg.id} className="message">
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
                        />
                        <button onClick={() => setAddDMModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding DM with: ${dmUsername}`);
                            setAddDMModalOpen(false);
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
