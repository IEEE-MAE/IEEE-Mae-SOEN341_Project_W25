import "../TeamPage.css";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FaUsers, FaComments, FaPlus, FaChevronRight, FaChevronLeft, } from "react-icons/fa";
import {doesChannelExist, doesUserExist, getCurrentUser, SignOutAuth} from "../backend/auth";
import {getUsername, getUserRole} from "../backend/Queries/getUserFields.jsx";
import { useNavigate } from "react-router-dom";
import {createMessages} from "../backend/messages.jsx";
import {db, realtimeDB} from "../config/firebase.jsx";
import {query, onValue, ref, orderByChild, equalTo, remove, update} from "firebase/database";  //[no touch]
import * as React from "react";
import {createChannel} from "../backend/createChannel.jsx";
import addMemberToTeam from "../backend/addMemberToTeam.jsx";
import addAdminToTeam from "../backend/addAdminToTeam.jsx";
import addMemberToChannel from "../backend/addMemberToChannel.jsx";
import {createDM} from "../backend/createDM.jsx";
import personIcon from "../assets/person_24dp_E8EAED_FILL1_wght400_GRAD0_opsz24.svg";
import {getSuperUserDefaultChannels,getSuperUserUsername} from "../backend/Queries/getSuperUser.jsx";
import {doc, updateDoc, arrayRemove, collection, where, onSnapshot, getDoc} from "firebase/firestore";  //[no touch]
import {updateUserStatus} from "../backend/updateStatus.jsx";
import {isUserInChannel, userHasTeam, userInTeam} from "../backend/Queries/basicqueryUsers.jsx";
import {getDMname, getEffectChannel, getEffectMessages, getEffectTeam} from "../backend/Queries/getEffectChannel.jsx";
import {getMessageEffect} from "../backend/Queries/getEffectMessage.jsx";
import {createTeam} from "../backend/createTeam.jsx";

const teams = [{ id: 1, name: "Channels", icon: <FaUsers /> }];

function TeamPage() {
    const [selectedTeam, setSelectedTeam] = useState(1); // start with first team
    const [thisUsername, setThisUsername] = useState(""); // logged in username
    const [viewMode, setViewMode] = useState("channels"); // sidebar mode
    const [userRole, setUserRole] = useState(""); // user role
    const [users, setUsers] = useState([]);
    const [newMessage, setNewMessage] = useState("");


    const [isDefaultChannel, setIsDefaultChannel] = useState(false);
    const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
    const [isAddAdminModalOpen, setAddAdminModalOpen] = useState(false);
    const [isAddChannelModalOpen, setAddChannelModalOpen] = useState(false);
    const [isAddDMModalOpen, setAddDMModalOpen] = useState(false);
    const [isAddChannelMemberModalOpen, setAddChannelMemberModalOpen] = useState(false);
    const [isSendRequestModalOpen, setSendRequestModalOpen] = useState(false);
    const [isCreateTeamModalOpen, setCreateTeamModalOpen] = useState(false);

    const [memberUsername, setMemberUsername] = useState("");
    const [adminUsername, setAdminUsername] = useState("");
    const [channelName, setChannelName] = useState("");
    const [dmUsername, setDMUsername] = useState("");
    const [selectedChat,setSelectedChat] = useState(null);
    const [isUserListExpanded, setIsUserListExpanded] = useState(false);
    const [selectedReplyMessage, setSelectedReplyMessage] = useState(null);
    const messageInputRef = useRef(null);
    const [inputPlaceholder, setInputPlaceholder] = useState("Type a message...");

    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();
    const [teamName, setTeam] = useState("");


    //live update user status
    updateUserStatus(getCurrentUser());

    //this does refresh and getsUserTeam live
    const team = getEffectTeam();


    useEffect(() => {
        if (!team) {
            setViewMode("dms");
        }
    }, [team]);

    //get user role
    useEffect(() => {
        if(!team) return;
        const checkUserRole = async () => {
            const username = await getUsername();
            setThisUsername(username);
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

    //page modal config
    useEffect(() => {
        if (isAddChannelModalOpen) {
            setIsDefaultChannel(false); // Reset checkbox when modal opens
        }
    }, [isAddChannelModalOpen]);


    //---- realtime updates of channel, DM's, Messages ----

    // fetch user teams
    const channels = getEffectChannel(team, "user");

    // fetch team channels
    const teamChannels = getEffectChannel(team, "team");

    //fetch user DM
    const dms = getEffectMessages(team)

    //fetch all messages for channel
    const messages = getMessageEffect(selectedChat);

    //--------------------------------------------------

    //checks if message has passed editing threshold
    const isEditable = (timestamp) =>{
        if(!timestamp) return false;
        const minutesThreshold = 1; // in min
        return (Date.now() - timestamp) < (minutesThreshold*60*1000);

    }

    //realtime update of team users status
    useEffect(() => {
        if(!team)return;
        const q = query(collection(db, 'users'), where('team', '==', team));
        const unsubscribe = onSnapshot(q,(querySnapshot)=> {
            const userList = [];
            const queryDocs = querySnapshot.docs;
            for(const doc of queryDocs){
                const data = doc.data();
                const userData = {
                    id: doc.id,
                    name: data.username,
                    profilePic: personIcon,
                    status: data.status,
                    time: new Date(data.last_seen).toLocaleTimeString(),
                }
                userList.push(userData);
            }

            setUsers(userList);
        })
        return () => {
            unsubscribe();
        };
    }, [refresh, team]);

    //validate username
    const validUsername = async (username) => {
        const userExists = await doesUserExist(username);
        if(!userExists) {
            alert("Username doesn't exist. Please try again.");
            setMemberUsername("");
            setAdminUsername("");
            setDMUsername("");
        }
    }

    //validate channel name
    const validChannelName = async (channelName) => {
        const channelExists = await doesChannelExist(channelName);
        if(channelExists) {
            alert("Channel name is taken. Please try again.");
            setChannelName("");
        }
    }

    //validate channel member
    const validChannelMember = async (username) => {
        await validUsername(username);
        const sameTeam = await userInTeam(username);
        const inChannel = await isUserInChannel(username, selectedChat);
        if(!sameTeam) {
            alert("This user is not in your team.");
            setMemberUsername("");
            setAdminUsername("");
            setDMUsername("");
            return false;
        }
        if(inChannel) {
            alert("This user is already in this channel.");
            setMemberUsername("");
            setAdminUsername("");
            setDMUsername("");
            return false;
        }
        return true;
    }


    // sends the message on button: send
    const sendMessage = async () => {
        console.log("THIS CHAT IS: " + selectedChat);

        const replyPayload = selectedReplyMessage
            ? {
                replyTo: {
                    id: selectedReplyMessage.id,
                    sender: selectedReplyMessage.sender,
                    text: selectedReplyMessage.text,
                },
            }
            : null;

        await createMessages(newMessage, selectedChat, false, false, null, replyPayload);

        setNewMessage("");
        setSelectedReplyMessage(null);
        setInputPlaceholder("Type a message...");

        const user = getCurrentUser();
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            last_seen: Date.now(),
        });
    };


    const editMessage = async (newMsg, msgID) => {
        const updatedMsg= "* " + newMsg;
        const updates = {
            Message: updatedMsg,
        }
        await update(ref(realtimeDB, `messages/${msgID}`), updates);
        console.log("updated message: ", msgID);
    }

    //------------------- Handle Functions ----------------

    const handleReplyMessage = (msg) => {
        setSelectedReplyMessage(msg)
        setInputPlaceholder("");
        messageInputRef.current?.focus();
    };

    const handleAddChannel = async () => {
        if(channelName==="" || channelName === null){
            alert("Please enter a channel name");
            setChannelName("");
        }
        else{
            await createChannel(channelName,isDefaultChannel);
            setRefresh(prev => !prev);
            setChannelName("");
            setAddChannelModalOpen(false);
        }
    };

    const doesDMexist = async (otherUsername) =>{
        const DMid1 = thisUsername.concat(otherUsername);
        const DMid2 = otherUsername.concat(thisUsername);
        console.log("Possible DMs: " + DMid1 + " | " + DMid2);
        let DMid = DMid1;
        setRefresh(prev => !prev);
        if(!dms.some(dm => dm.id === DMid1)){
            DMid = DMid2;
        }
        if(!dms.some(dm => dm.id === DMid2)){
            DMid = false;
        }
        return DMid;
    }

    const handleAddDM = async () => {

        const userExists = await doesUserExist(dmUsername);
        if(!userExists) {
            setDMUsername("");
            return;
        }

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
        const hasTeam = await userHasTeam(memberUsername);
        if(hasTeam){
            alert("This user has a team");
            setMemberUsername("");
            return;
        }
        await addMemberToTeam(memberUsername, team);
        setMemberUsername("");
    }

    const handleAddAdmin = async () => {
        const hasTeam = await userHasTeam(adminUsername);
        const isInTeam = await userInTeam(adminUsername);
        if((!isInTeam && !hasTeam)||(isInTeam && hasTeam)){
            await addAdminToTeam(adminUsername, team);
            setAdminUsername("");
        }else{
            alert("This user has a team");
            setAdminUsername("");
        }
    }

    const handleInviteMemberToChannel = async () => {
        // create dm between both users to send invite to join
        const validMember = await validChannelMember(memberUsername)
        if(!validMember) return;
        if((userRole === "admin" || userRole === "superUser")){
            let DMid= await doesDMexist(memberUsername);
            if(DMid === false){
                DMid = await createDM(memberUsername);
            }
            // send invite in message
            const inviteMsg = thisUsername + " has invited you to join " + selectedChat.replace(team, "");
            await createMessages(inviteMsg, DMid, false, true, selectedChat); // request = false, invite = true
            setMemberUsername("");
        }
        else{
            alert("You don't have permission to invite people to this channel!");
            setMemberUsername("");
        }
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


    const handleNewTeam  = async () => {
        try {
            await createTeam(teamName);
        } catch (error) {
            console.error("Error creating team:", error);
        }
    }


    const handleAccept = async (invite, request, sender, channel, msgID) => {
        console.log("IN HANDLE ACCEPT")
        let updatedMsg;
        if(invite && !request){ // handle accepting invite to join channel (member)
            console.log("IN HANDLE ACCEPT - INVITE")
            // add channel name to this user's list of channels
            await addMemberToChannel(thisUsername, channel);
            updatedMsg = thisUsername + " has accepted the invite to join channel: " + channel.replace(team, "");
            console.log("USER " + thisUsername + "HAS ACCEPTED INVITE TO " + channel.replace(team, ""));
        }
        if(!invite && request){ // handle accepting request to join a channel (admin)
            // add channel name to the requester's (sender) list of channels
            console.log("IN HANDLE ACCEPT - REQUEST")
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
            updatedMsg = sender + " has been denied access to channel: "+ channel.replace(team, "");
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

        const defaultChannels = await getSuperUserDefaultChannels(team);

        if(defaultChannels.includes(selectedChat)){

            alert("You cannot leave a default channel");
            return;
        }

        if(userRole === "admin" || userRole === "superUser"){
            alert("You are an owner of this channel and therefore cannot leave it");
            return;
        }

        const thisUser = await getCurrentUser();
        const userRef = doc(db, 'users', thisUser.uid);

        await updateDoc(userRef, {
            channels: arrayRemove(selectedChat),
        });

        setRefresh(prev => !prev )
        console.log("Channel " + selectedChat + " removed successfully from user " + thisUser.uid);
        alert("You have left channel " + selectedChat.replace(team, ""));
    }

    const handleSignOut = async () =>{
        await SignOutAuth();
    }

    const handleDeleteMessage = async (messageId) => {
        const messageRef = ref(realtimeDB, `messages/${messageId}`);
        await remove(messageRef);
        console.log("REMOVE MESSAGE: ", messageId);
    }

    //authentication check
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

   return (
        <div className="team-page">
            {team && (<motion.div
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

                <div className="user-list">
                    <div className="active-user">

                        <span className={`active-user`}> {thisUsername }</span>
                    </div>

                    {users.map(user => (
                        <motion.div key={user.id} className="user-item" whileHover={{ scale: 1.1 }}>
                            <img src={user.profilePic} alt={user.name} className="user-icon" />
                            <div className="user-staus-info">
                                <div className={`user-status ${user.status}`}></div>
                            </div>
                            {isUserListExpanded && <span className="username">{user.name}</span>}
                            {isUserListExpanded && <div className = {`last-seen ${user.status}`}>{user.time}</div> }

                        </motion.div>
                    ))}
                </div>
            </motion.div>)}

            {/* Right Sidebar (Channels or DMs) */}
            <div className="channel-sidebar">

                {team && (
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
                </motion.div>)}


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
                {/* Create a team Button*/}
                { !team &&(
                    <motion.button
                        className="add-channel-button"
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setCreateTeamModalOpen(true)}
                    >
                        <FaPlus /> Create A team
                    </motion.button>
                )}

            </div>

            <div className="chat-name">
                {/*Chat Name ie who are you chatting with */}
                {selectedChat
                    ? (viewMode === "dms"
                            ? (<p>Chatting with: {getDMname(selectedChat, thisUsername)}</p>)
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
                        <div
                            key={msg.id}
                            className={`message ${msg.sender === thisUsername ? "you" : "other"}`}
                        >
                            {msg.replyTo && (
                                <div className="reply-preview">
                                    Replying to {msg.replyTo.sender}: "{msg.replyTo.text.slice(0, 30)}{msg.replyTo.text.length > 30 ? '...' : ''}"
                                </div>
                            )}

                            <strong>{msg.sender}:</strong> {msg.text}
                            <span className="time">{msg.time}</span>

                            {/* button to delete message */}
                            {/* shows up for all messages for admins, for own messages if message was sent recently */}
                            {(["admin", "superUser"].includes(userRole) || (msg.sender === thisUsername && isEditable(msg.timeSort))) && (
                                <button className="delete-msg-btn" onClick={()=>handleDeleteMessage(msg.id)}>×</button>
                            )}

                            {selectedReplyMessage && selectedReplyMessage.id === msg.id && (
                                <button className="cancel-reply-btn" onClick={() => setSelectedReplyMessage(null)}>× Cancel Reply</button>
                            )}

                            <button className="reply-msg-btn" onClick={() => handleReplyMessage(msg)}>↩</button>

                            {/*button to edit message, shows up for own messages if message was sent recently */}
                            {/* clicking this should open an edit window where the new input will be recorded and sent to the function editMessage(newMessage, msg.id) */}
                            {(msg.sender === thisUsername && isEditable(msg.timeSort)) && (
                                <button className="delete-msg-btn" onClick={()=>editMessage("THIS WAS EDITED", msg.id)}>✎</button>
                            )}

                            {["admin", "superUser"].includes(userRole) && msg.request && (
                                <>
                                    <br />
                                    <button className="accept-btn" onClick={() => handleAccept(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>accept</button>
                                    <button className="deny-btn" onClick={() => handleDeny(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>deny</button>
                                </>
                            )}
                            {userRole === "member" && msg.invite && (
                                <>
                                    <br />
                                    <button className="accept-btn" onClick={() => handleAccept(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>accept</button>
                                    <button className="deny-btn" onClick={() => handleDeny(msg.invite, msg.request, msg.sender, msg.refChannel, msg.id)}>deny</button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                <div className="message-input">
                    {selectedReplyMessage && (
                        <div className="replying-to">
                            <span>
                                Replying to {selectedReplyMessage.sender}: "{selectedReplyMessage.text}"
                            </span>
                            <button className="cancel-reply-btn" onClick={() => setSelectedReplyMessage(null)}>×</button>
                        </div>
                    )}
                    <input
                        type="text"
                        value={newMessage}
                        ref={messageInputRef}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        placeholder={inputPlaceholder}
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
                            onBlur={() => validChannelName(channelName)}
                        />
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                checked={isDefaultChannel}  // State for toggle
                                onChange={() => setIsDefaultChannel((prev) => !prev)}  // Toggle value
                            />
                            <label htmlFor="private-channel" className="checkbox-label">
                                Default Channel?
                            </label>
                        </div>
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
                                setAddDMModalOpen(false);
                                handleAddDM();
                            }}>Confirm</button>
                    </div>
                </div>
            )}

            {isCreateTeamModalOpen && (
                <div className="modal-overlay">
                    <div
                        className = "modal"
                    >
                        <p>Create Your Team Here</p>

                            <div className = "ct-input-group">
                                <input
                                    name = "TeamName"
                                    id = "TeamName"
                                    placeholder = "Enter your team name"
                                    onChange = {(e) => setTeam(e.target.value)}
                                    whileFocus = "focus"
                                />
                            </div>
                            <button onClick={() => setCreateTeamModalOpen(false)}>Cancel</button>
                            <button onClick={() => {
                                if(!teamName) {
                                    alert("Please enter a team name");
                                    return;
                                }
                                handleNewTeam();
                                setCreateTeamModalOpen(false);
                            }}>Create Team</button>

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