import React, { useState } from "react";
import { useParams } from "react-router-dom";

const TeamPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [activeModal, setActiveModal] = useState<"none" | "admin" | "channel">("none");
  const [adminName, setAdminName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [teamMembers, setTeamMembers] = useState("");

  const handleSubmit = (type: "admin" | "channel") => {
    if (type === "admin") {
      console.log("Adding admin:", adminName);
    } else {
      console.log("Creating channel:", channelName, "with members:", teamMembers);
    }
    closeModal();
  };

  const closeModal = () => {
    setActiveModal("none");
    setAdminName("");
    setChannelName("");
    setTeamMembers("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-700">
      <h1 className="text-white text-4xl font-bold">Team Page</h1>
      
      <div className="mt-4 space-x-4">
        <button
          onClick={() => setActiveModal("admin")}
          className="px-6 py-2 bg-green-900 text-white rounded-lg"
        >
          Add Admin
        </button>
        <button
          onClick={() => setActiveModal("channel")}
          className="px-6 py-2 bg-green-900 text-white rounded-lg"
        >
          Make Channel
        </button>
      </div>

      {activeModal !== "none" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {activeModal === "admin" ? "Add Admin" : "Create Channel"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {activeModal === "admin" ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Admin Name"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => handleSubmit("admin")}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Channel Name"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="Team Members"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => handleSubmit("channel")}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;