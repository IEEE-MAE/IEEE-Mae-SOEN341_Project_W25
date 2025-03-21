import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaUsers, FaComments, FaPlus, FaChevronRight, FaChevronLeft, } from "react-icons/fa";
import {getOtherUsername, getUserDMs, getUsername} from "../backend/Queries/getUserFields.jsx";
import {getUserChannels} from "../backend/Queries/getUserFields.jsx";
import {doesUserExist, getCurrentUser, SignOutAuth} from "../backend/auth";
import {getUserRole, getUserTeam} from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";
import {createMessages} from "../backend/messages.jsx";
import {db, realtimeDB} from "../config/firebase.jsx";
import {query, onValue, ref, orderByChild, equalTo, remove, update} from "firebase/database";
import * as React from "react";
import {createChannel} from "../backend/createChannel.jsx";
import addMemberToTeam from "../backend/addMemberToTeam.jsx";
import addAdminToTeam from "../backend/addAdminToTeam.jsx";
import addMemberToChannel from "../backend/addMemberToChannel.jsx";
import {createDM} from "../backend/createDM.jsx";
import personIcon from "../assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg";
import {getSuperUserChannels, getSuperUserId, getSuperUserUsername} from "../backend/Queries/getSuperUser.jsx";
import {doc, updateDoc, arrayRemove} from "firebase/firestore";


const teams = [{ id: 1, name: "Channels", icon: <FaUsers /> }];

// example names for DM feature (replace with backend implementation)
const contacts = ["Alice", "Bob", "Charlie"];

const users = [
    { id: 1, name: "Andrew", profilePic: personIcon, status: "online" ,time:12.05},
    { id: 2, name: "Dallas", profilePic: personIcon, status: "offline" ,time:12.05},
    { id: 3, name: "Eric", profilePic: personIcon, status: "away" ,time:12.05},
    { id: 4, name: "Marlon", profilePic: personIcon, status: "online" ,time:12.05},
    { id: 5, name: "Emma", profilePic: personIcon, status: "away" ,time:12.05},
];

function TeamPage() {
    const [selectedTeam, setSelectedTeam] = useState(1); // start with first team
    const [thisUsername, setThisUsername] = useState(""); // logged in username
    const [viewMode, setViewMode] = useState("channels"); // sidebar mode
    const [userRole, setUserRole] = useState(""); // user role
    const [team, setTeam] = useState();

    const [channels, setChannels] = useState([]);
    const [dms, setDms] = useState([]);
    const [teamChannels, setTeamChannels] = useState([]);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const [isUserInTeam, setIsUserInTeam] = useState(null);

    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [isAddChannelModalOpen, setAddChannelModalOpen] = useState(false);
    const [isAddDMModalOpen, setAddDMModalOpen] = useState(false);
    const [isAddChannelMemberModalOpen, setAddChannelMemberModalOpen] = useState(false);
    const [isSendRequestModalOpen, setSendRequestModalOpen] = useState(false);

    const [memberUsername, setMemberUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");
    const [channelName, setChannelName] = useState("");
    const [dmUsername, setDMUsername] = useState("");
    const [selectedChat,setSelectedChat] = useState(null);
    const [isUserListExpanded, setIsUserListExpanded] = useState(false);


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

    // fetch team channels
    useEffect(() => {
        if(!team) return;
        const getTeamChannels = async () => {
            const superUserChannels = await getSuperUserChannels(team);
            const teamChannelList = [];

            for (const teamChannel of superUserChannels) {
                if (teamChannel.includes(team)) { // if user has channels in another team they won't be shown in this one
                    const teamChannelName = teamChannel.replace(team, "");
                    teamChannelList.push({ name: teamChannelName, id: teamChannel });
                }
            }

            setTeamChannels(teamChannelList);
            console.log("GOT TEAM CHANNELS:" + teamChannels);
            if(teamChannelList.length === 0){console.log("no channels transferred")}
            // channels.forEach(channel => {console.log("channel retrieved " + channel.name)})
        };

        getTeamChannels();
    }, [team, refresh]);

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
            if(DMList.length === 0){console.log("no dms transferred")}
            // DMList.forEach(dm => {console.log("dm retrieved " + dm.name)})
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
                            timeSort: msg.timestamp,
                            request: msg.isRequest,
                            invite: msg.isInvite,
                            refChannel: msg.refChannelID
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
            const DMexist = await doesDMexist(dmUsername);
            if(DMexist === false) {
                const newDM = await createDM(dmUsername);
                setSelectedChat(newDM);
            }
            else{
                console.log("DM already exists");
                alert("You already have a DM with this person!");
                setSelectedChat(DMexist);
            }
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

    const doesDMexist = async (otherUsername) =>{
        const DMid1 = thisUsername.concat(otherUsername);
        const DMid2 = otherUsername.concat(thisUsername);
        console.log("Possible DMs: " + DMid1 + " | " + DMid2);
        let DMid = DMid1;
        if(!dms.some(dm => dm.id === DMid1)){
            DMid = DMid2;
        }
        if(!dms.some(dm => dm.id === DMid2)){
            DMid = false;
        }
        return DMid;
    }

    const handleInviteMemberToChannel = async () => {
        // create dm between both users to send invite to join
        let DMid= await doesDMexist(memberUsername);
        if(DMid === false){
            DMid = await createDM(memberUsername);
        }
        // send invite in message
        const inviteMsg = thisUsername + " has invited you to join " + selectedChat.replace(team, "");
        await createMessages(inviteMsg, DMid, false, true, selectedChat); // request = false, invite = true
        setMemberUsername("");
    }

    const handleRequestToJoinChannel = async () => { // send request to team superUser
        // get team's superUser username
        const superUserUsername = await getSuperUserUsername(team);

        // create dm between both users to send request to join
        let DMid= await doesDMexist(superUserUsername);
        console.log("in handle request to join, found dm: " + DMid);
        if(DMid === false){
            DMid = await createDM(superUserUsername);
        }
        // send invite in message
        const inviteMsg = thisUsername + " has requested to join " + selectedChat.replace(team, "");
        await createMessages(inviteMsg, DMid, true, false, selectedChat); // request = true, invite = false
    }

    const handleAccept = async (invite, request, sender, channel, msgID) => {
        console.log("IN HANDLE ACCEPT")
        const DMid = await doesDMexist(sender);
        let updatedMsg;
        if(invite && !request){ // handle accepting invite to join channel (member)
            // add channel name to this user's list of channels
            await addMemberToChannel(thisUsername, channel);
            updatedMsg = thisUsername + " has accepted the invite to join channel: " + channel.replace(team, "");
            console.log("USER " + thisUsername + "HAS ACCEPTED INVITE TO " + channel.replace(team, ""));
        }
        if(!invite && request){ // handle accepting request to join a channel (admin)
            // add channel name to the requester's (sender) list of channels
            await addMemberToChannel(sender, channel);
            updatedMsg = sender + " has been accepted into channel: " + channel.replace(team, "");
            console.log("USER " + sender + "HAS BEEN ACCEPTED TO " + channel.replace(team, ""));
        }

        // edit message so invite and request = false, so the buttons are not displayed anymore
        const updates = {
            Message: updatedMsg,
            isRequest: false,
            isInvite: false,
            refChannelID : null,
        }
        console.log("UPDATING MESSAGE ID: " + msgID);
        await update(ref(realtimeDB, `messages/${msgID}`), updates);
    }

    const handleDeny = async (invite, request, sender, channel, msgID) => {
        console.log("IN HANDLE DENY");
        let updatedMsg;
        if(invite && !request){ // handle denying invite to join channel (member)
            // update message with invite denial
            updatedMsg = thisUsername + " has declined to join channel: " + channel.replace(team, "");
            console.log("USER " + thisUsername + "HAS DECLINED INVITE TO " + channel.replace(team, ""));
        }
        if(!invite && request){ // handle denying request to join a channel (admin)
            // update message with request denial
            updatedMsg = sender + " has been denied access to channel "+ channel.replace(team, "");
            console.log("USER " + sender + "HAS BEEN DENIED ACCESS TO " + channel.replace(team, ""));
        }

        // edit message so invite and request = false, so the buttons are not displayed anymore
        const updates = {
            Message: updatedMsg,
            isRequest: false,
            isInvite: false,
            refChannelID : null,
        }
        await update(ref(realtimeDB, `messages/${msgID}`), updates);
    }

    const handleLeave = async () => { // function for a user to leave the selected channel
        if(!selectedChat) return;
        if(userRole === "admin" || userRole === "superUser"){
            alert("You are an owner of this channel and therefore cannot leave it"); // do we want this?
            return;
        }
        const thisUser = await getCurrentUser();
        const userRef = doc(db, 'users', thisUser.uid);

        await updateDoc(userRef, {
            channels: arrayRemove(selectedChat),
        });

        setRefresh(prev => !prev )
        console.log("Channel " + selectedChat + " removed successfully from user " + thisUser.uid);
    }

    const handleSignOut = async () =>{
        await SignOutAuth();
    }

    const handleDeleteMessage = async (messageId) => {
        const messageRef = ref(realtimeDB, `messages/${messageId}`);
        await remove(messageRef);
        console.log("REMOVE MESSAGE: ", messageId);
    }

    const validUsername = async (username) => {
        const userExists = await doesUserExist(username);
        if(!userExists && username !== "all") {
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
            <motion.div
                className={`sidebar ${isUserListExpanded ? "expanded" : ""}`}
                animate={{ width: isUserListExpanded ? "200px" : "80px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                initial={{ width: "80px" }} // Ensure it starts collapsed
            >
                <motion.button
                    className="toggle-arrow"
                    onClick={() => setIsUserListExpanded(!isUserListExpanded)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isUserListExpanded ? <FaChevronLeft /> : <FaChevronRight />}
                </motion.button>

                <div className="user-list">x
                    {users.map(user => (
                        <motion.div key={user.id} className="user-item" whileHover={{ scale: 1.1 }}>
                            <img src={user.profilePic} alt={user.name} className="user-icon" />
                            <div className="user-staus-info">
                            <div className={`user-status ${user.status}`}></div>
                            <div className = {`last-seen ${user.status}`}>{user.time}</div>
                            </div>
                            {isUserListExpanded && <span className="username">{user.name}</span>}
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            {/* Right Sidebar (Channels or DMs) */}
            <div className="channel-sidebar">
                <motion.div
                    className="toggle-btn"
                    onClick={() => {
                        setViewMode(viewMode === "dms" ? "channels" : "dms");
                        setRefresh(prev => !prev);
                    }}
                    whileHover={{ scale: 1.1 }}
                >
                    {viewMode === "dms" ? <FaComments size={24} /> : <FaUsers size={24} />}
                    <span className="view-toggle-text">
                        Switch to {viewMode === "dms" ? "Channels" : "dms"}
                    </span>
                </motion.div>

                <h2>{viewMode === "dms" ? "Direct Messages" : ` ${teams.find(t => t.id === selectedTeam)?.name}`}</h2>

                <ul className="channel-list">
                    {viewMode === "channels" && selectedTeam !== null && channels
                        ? teamChannels.map((teamChannel) => {
                            const isUserChannel = channels.some(channel => channel.id === teamChannel.id);
                                return (
                                    <li
                                        key={teamChannel.id}
                                        className={`channel-item ${isUserChannel ? "" : "greyed-out"} ${selectedChat === teamChannel.id ? "active" : ""}`}
                                        onClick={isUserChannel ? () => setSelectedChat(teamChannel.id) : undefined}
                                    >
                                        {teamChannel.name}
                                        {isUserChannel ? (
                                            ["admin", "superUser"].includes(userRole) && (
                                                <button
                                                    className="add-button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedChat(teamChannel.id);
                                                        setAddChannelMemberModalOpen(true);
                                                    }}
                                                >
                                                    Invite Member
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                className="add-button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedChat(teamChannel.id);
                                                    setSendRequestModalOpen(true);
                                                }}
                                            >
                                                Request Access
                                            </button>
                                        )}
                                    </li>
                                );
                    })
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
                            ? (<p>Chatting with: {getDMname(selectedChat)}</p>)
                            : (
                                <>
                                <p>On channel: {selectedChat.replace(team, "")}<span><button className="leave-button" onClick={()=> handleLeave()}>leave channel</button></span></p>

                                </>
                            )
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
                            {["admin", "superUser"].includes(userRole) && msg.request &&(
                                <><br />
                                <button className="delete-msg-btn" onClick={() => handleAccept(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>accept</button>
                                <button className="delete-msg-btn" onClick={() => handleDeny(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>deny</button>
                                </>
                            )}
                            {userRole === "member" && msg.invite && (
                                <><br />
                                <button className="delete-msg-btn" onClick={() => handleAccept(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>accept</button>
                                <button className="delete-msg-btn" onClick={() => handleDeny(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>deny</button>
                                </>
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
                <motion.button className="logout-button" onClick={() => {
                    navigate("/login");
                    handleSignOut();
                }}>
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

            {/* Add DM Modal */}
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

            {/* Invite Member to channel Modal */}
            {isAddChannelMemberModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Invite Member to Channel</h2>
                        <input
                            type="text"
                            placeholder="Enter member username"
                            value={memberUsername}
                            onChange={(e) => setMemberUsername(e.target.value)}
                            onBlur={() => validUsername(memberUsername)}
                        />
                        <button onClick={() => setAddChannelMemberModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log(`Adding member to channel: ${memberUsername}`);
                            handleInviteMemberToChannel();
                            setAddChannelMemberModalOpen(false);
                        }}>Confirm</button>
                    </div>
                </div>
            )}

            {/* Request to join channel Modal */}
            {isSendRequestModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Request To Join Channel</h2>
                        <button onClick={() => setSendRequestModalOpen(false)}>Cancel</button>
                        <button onClick={() => {
                            console.log("Sending request to join channel");
                            handleRequestToJoinChannel();
                            setSendRequestModalOpen(false);
                        }}>Send Request</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamPage;