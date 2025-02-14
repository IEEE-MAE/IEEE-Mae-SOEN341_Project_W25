import { useState } from "react";
import "../style.css";
import {getAuth} from "firebase/auth";
import {doc, getDoc, updateDoc, arrayUnion} from "firebase/firestore";
import {db} from "../config/firebase.tsx";
import {createTeam} from "../backend/createTeam.jsx";
import {createChannel} from "../backend/createChannel.jsx";
 // Ensure this matches your SignUp and LogIn styles
import {useNavigate, useParams} from "react-router-dom";
import "../style.css";
import {SignOutAuth} from "../backend/auth.tsx"; // Ensure this matches your SignUp and LogIn styles
import {pullUser} from "../backend/QueryUsers/basicqueryUsers.jsx";

const TeamPage = () => {
  //const { teamId } = useParams<{ teamId: string }>();
  const [activeModal, setActiveModal] = useState("none");
  const [adminUsername, setAdminUsername] = useState("");
  const [channelName, setChannelName] = useState("");
  const [username, setUsername] = useState("");
  const [createdByUserId,setUserId] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async () => {
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

              //gets the new admins ID from the admin username
              const newAdminId = pullUser(adminUsername);

              //This uses the team of the current user to pull up that teams ducment so it can be updated with the new admin (adminUsername)
              const teamDocRef = doc(db, 'teams', teamId);
              await updateDoc(teamDocRef, {
                  adminId: arrayUnion(newAdminId),
              });

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
                  const channelDoc = await createChannel({channelName, createdByUserId});
                  console.log("Successfully created channel");
                  alert("Your channel has been created");
                  // Optionally, navigate to the newly created team or show a success message.
                  //console.log("Team created with ID:", teamDoc.id);
                  //navigate(`/team/${teamDoc.id}`);
              } catch (error) {
                  console.error("Error creating team:", error);
              }



              //------- updates team with channel ID -------
              const teamDocRef = doc(db, 'teams', teamId);
              await updateDoc(teamDocRef, {
                      channelId: arrayUnion("channel id filler")
                  });


          } else{
              alert("you are not an admin")
          }

      }

    console.log("Form submitted!");
    closeModal();
  };

  const closeModal = () => {
    setActiveModal("none");
    setAdminUsername("");
    setChannelName("");
    setUsername("");
  };

  const handleConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = () => {
    if (activeModal === "admin") {
      console.log("Adding admin:", adminUsername);
    } else if (activeModal === "channel") {
      console.log("Creating channel:", channelName, "for user:", username);
    }
    setShowConfirmationModal(false);
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
    <div className="wrapper">
      <h1>Team Page</h1>

      {/* Buttons to trigger modals */}
      <div className="button-group">
        <button onClick={() => setActiveModal("admin")}>Add Admin</button>
        <button onClick={() => setActiveModal("channel")}>Make Channel</button>
        <button onClick={() => onSignOut()}>Log out</button>
      </div>

      {/* MODAL */}
      {activeModal !== "none" && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{activeModal === "admin" ? "Add Admin" : "Create Channel"}</h2>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmation();
                handleSubmit();
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
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Are you sure?</h2>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmationModal(false)}>Cancel</button>
              <button onClick={handleConfirmSubmit}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;