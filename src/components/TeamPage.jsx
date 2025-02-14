import { useState } from "react";
import { motion } from "framer-motion";
import "../style.css";
import {getAuth} from "firebase/auth";
import {doc, getDoc, updateDoc, arrayUnion} from "firebase/firestore";
import {db} from "../config/firebase.tsx";
import {createTeam} from "../backend/createTeam.jsx";
import {createChannel} from "../backend/createChannel.jsx";
 // Ensure this matches your SignUp and LogIn styles
import {useNavigate, useParams} from "react-router-dom";
import {SignOutAuth} from "../backend/auth.tsx"; // Ensure this matches your SignUp and LogIn styles
import {pullUser} from "../backend/QueryUsers/basicqueryUsers.jsx";
import "../style.css";
import {SignOutAuth} from "../backend/auth.jsx"; // Ensure this matches your SignUp and LogIn styles
import {pullUser} from "../backend/Queries/basicqueryUsers.jsx";
import {getUserTeam} from "../backend/Queries/getUserTeam.jsx";

const pageVariants = { //animation setup
    hidden: {opacity: 0, y: 50, scale: 0.95},
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
}

const TeamPage = () => {
  //const { teamId } = useParams<{ teamId: string }>();
  const [activeModal, setActiveModal] = useState("none");
  const [adminUsername, setAdminUsername] = useState("");
  const [channelName, setChannelName] = useState("");
  const [username, setUsername] = useState("");
  const [createdByUserId,setUserId] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();
  const users = [];

  // const handleSubmit = async () => {
  //     const auth = getAuth();
  //     const user = auth.currentUser;
  //
  //     if (!user) {
  //         return []
  //     }
  //
  //     const userDocRef = doc(db, "users", user.uid);
  //     const userDocSnapshot = await getDoc(userDocRef);
  //
  //     const teamId = userDocSnapshot.data().team;
  //     const userRole = userDocSnapshot.data().role;
  //
  //     console.log("userRole", userRole);
  //
  //     if (activeModal === "admin") {
  //
  //         if (userRole === "superUser") {
  //             const teamDocRef = doc(db, 'teams', teamId);
  //             await updateDoc(teamDocRef, {
  //                 adminId: arrayUnion(user.uid)
  //             });
  //         }
  //         else{
  //             alert("you are not the superUser, cry about it")
  //         }
  //     }
  //     if (activeModal === "channel") {
  //         if (userRole === "admin" || userRole === "superUser") {
  //
  //             //------ Create Channel -----
  //             try {
  //                 setUserId(user.uid);
  //                 const channelDoc = await createChannel({channelName, createdByUserId});
  //                 console.log("Successfully created channel");
  //                 alert("Your channel has been created");
  //                 // Optionally, navigate to the newly created team or show a success message.
  //                 //console.log("Team created with ID:", teamDoc.id);
  //                 //navigate(`/team/${teamDoc.id}`);
  //             } catch (error) {
  //                 console.error("Error creating team:", error);
  //             }
  //
  //
  //
  //             //------- updates team with channel ID -------
  //             const teamDocRef = doc(db, 'teams', teamId);
  //             await updateDoc(teamDocRef, {
  //                     channelId: arrayUnion("channel id filler")
  //                 });
  //
  //         } else{
  //             alert("you are not an admin")
  //         }
  //         navigate("/Channels");
  //     }
  //
  //   console.log("Form submitted!");
  //   closeModal();
  // };

  const closeModal = () => {
    setActiveModal("none");
    setAdminUsername("");
    setChannelName("");
    setUsername("");
  };

  const handleConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
          return []
      }

      //----  This pulls the current users document snapshot into "userDocSnapshot" ----
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      //---- the users document is then used to aquire his team and role ----
      const teamId = userDocSnapshot.data().team;
      const userRole = userDocSnapshot.data().role;

      console.log("userRole", userRole);

      //------ This is the adding an admin block --------
      if (activeModal === "admin") {
          if (userRole === "superUser") {



              //This uses the team of the current user to pull up that teams ducment so it can be updated with the new admin (adminUsername)

              //gets the new admins ID from the admin username
              console.log("admin Username: " + adminUsername);
              const newAdminId = await pullUser(adminUsername);
              console.log("adminID:" + newAdminId);

              //This uses the team of the current user to pull up that teams ducment so it can be updated with the new admin (adminUsername)
              const teamDocRef = doc(db, 'teams', teamId);
              await updateDoc(teamDocRef, {
                  adminId: arrayUnion(newAdminId),

              });

              //add the user as an admin to there document



              const userDocRef = doc(db, 'users', newAdminId);
              await updateDoc(userDocRef, {
                  role: "admin",

              });
              console.log("adminID:" + newAdminId);

              //add the user as an admin to there document


          }
          else{
              alert("you are not the superUser, cry about it")
          }
      }
      if (activeModal === "channel") {
          if (userRole === "admin" || userRole === "superUser") {

              //------ Create Channel -----
              try {
                  setUserId(user.uid);
                  const channelDoc = await createChannel({channelName, createdByUserId, users});
                  console.log("Successfully created channel");
                  alert("Your channel has been created");
                  // Optionally, navigate to the newly created team or show a success message.
                  //console.log("Team created with ID:", teamDoc.id);
                  //navigate(`/team/${teamDoc.id}`);
              } catch (error) {
                  console.error("Error creating channel:", error);
              }

              //---- pulls the channel id ---
              const newUserId = await pullUser(username);

              //--- pulls the channel name
              const teamID = getUserTeam();
              const makeChannelId = [teamID, channelName].sort().join('_');

              //------- add channel to team -------
              const teamDocRef = doc(db, 'teams', teamId);
              await updateDoc(teamDocRef, {
                  channelId: arrayUnion(channelName)
              });


              //----- add channel to user -----
              const userDocRef = doc(db, 'users', newUserId);
              await updateDoc(userDocRef, {
                  channel: arrayUnion(channelName)
              });

              console.log("newUserId:" + newUserId);
              console.log("channelName:" + channelName);
              //------ add the user to the channel ----
              const channelDocRef = doc(db, 'channels', channelName);
              await updateDoc(channelDocRef, {
                  users: arrayUnion(newUserId),
              });



          } else{
              alert("you are not an admin")
          }
          navigate("/Channels");
      }

      console.log("Form submitted!");
      closeModal();
  };

  // example sign out function (can be put wherever user will sign out)
  const onSignOut = async () => {
      try {
          await SignOutAuth();
          navigate("/");
      }
      catch(error){
          alert("Error during sign out: " + error);
      }
  }

  return (
      <motion.div
          className="wrapper"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
      >
        <h1>Team Page</h1>

        {/* Buttons to trigger modals */}
        <div className="button-group">
            <button onClick={() => setActiveModal("admin")}>Add Admin</button>
            <button onClick={() => setActiveModal("channel")}>Make Channel</button>
            <button onClick={() => onSignOut()}>Log out</button>
        </div>

         {/* MODAL */}
          {activeModal !== "none" && (
            <motion.div
                className = "modal-overlay"
                initial = {{ opacity: 0 }}
                animate = {{ opacity: 1, transition: { duration: 0.3} }}
                exit = {{ opacity: 0, transition: {duration: 0.3} }}
          >
            <motion.div
                className = "modal"
                initial = {{ y: -20, opacity: 0 }}
                animate = {{y: 0, opacity:1, transition: { duration: 0.4, ease: "easeOut" } }}
                exit = {{y: -20, opacity: 0, transition: {duration: 0.3, ease: "easeIn"} }}
            >
                <h2>{activeModal === "admin" ? "Add Admin" : "Create Channel"}</h2>

                {/* Form */}
                <form
                    onSubmit={(e) => {
                    e.preventDefault();
                    handleConfirmation();
                    // handleSubmit();
                }}
                >
                {activeModal === "admin" ? (
                    <div className="input-group">
                    <label htmlFor="adminUsernameInput">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                        </svg>
                    </label>
                    <input
                        required
                        type="text"
                        id="adminUsernameInput"
                        placeholder="Admin Username"
                        aria-label="Enter admin username"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <label htmlFor="channelNameInput">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                      </svg>
                    </label>
                    <input
                      required
                      type="text"
                      id="channelNameInput"
                      placeholder="Channel Name"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="usernameInput">
                      <span>@</span>
                    </label>
                    <input
                      required
                      type="text"
                      id="usernameInput"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button type="submit">OK</button>
            </form>

            <p className="close-text" onClick={closeModal}>Cancel</p>
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <motion.div
            className = "modal-overlay"
            initial = {{ scale: 0.8, opacity: 0}}
            animate = {{ opacity: 1, transition: { duration: 0.4, ease: "easeIn" }}}
            exit = {{ opacity: 0, transition: {duration: 0.4, ease: "easeIn" }}}
        >
            <motion.div
                className = "modal"
                initial = {{ scale: 0.8, opacity: 0 }}
                animate = {{ opacity: 1, transition: { duration: 0.4, ease: "easeIn" }}}
                exit = {{ opacity: 0, transition: {duration: 0.4, ease: "easeIn" }}}
            >
            <h2>Are you sure?</h2>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmationModal(false)}>Cancel</button>
              <button onClick={handleConfirmSubmit}>Confirm</button>
            </div>
            </motion.div>
        </motion.div>
      )}
    </motion.div>
    );
};

export default TeamPage;