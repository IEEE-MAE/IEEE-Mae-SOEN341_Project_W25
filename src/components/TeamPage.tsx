import { useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import "../style.css";
import {SignOutAuth} from "../backend/auth.tsx"; // Ensure this matches your SignUp and LogIn styles

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [activeModal, setActiveModal] = useState<"none" | "admin" | "channel">("none");
  const [adminUsername, setAdminUsername] = useState("");
  const [channelName, setChannelName] = useState("");
  const [username, setUsername] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (type: "admin" | "channel") => {
    if (type === "admin" && !adminUsername.trim()) {
      alert("Please enter an admin username.");
      return;
    }
    if (type === "channel" && (!channelName.trim() || !username.trim())) {
      alert("Please fill in all fields.");
      return;
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