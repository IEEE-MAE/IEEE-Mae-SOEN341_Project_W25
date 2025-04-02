import { doc, updateDoc } from "firebase/firestore";
import { getCurrentUser } from "../src/backend/auth.jsx";
import { createChannel } from "../src/backend/createChannel.jsx";
import { getSuperUserId } from "../src/backend/Queries/getSuperUser.jsx";
import { getUserTeam } from "../src/backend/Queries/getUserFields.jsx";

// Mock Firebase and related functions
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "mockDocRef"),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(val => val),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [], 
    empty: false
  }),
  getFirestore: jest.fn(() => ({})),
  getDoc: jest.fn(),
}));

jest.mock("../src/config/firebase.jsx", () => ({
  db: {},
  auth: {},
  realtimeDB: {},
}));

jest.mock("../src/backend/auth.jsx", () => ({
  getCurrentUser: jest.fn(),
}));

// Update the getUserFields mock to include getTeamAdmins as a proper function
jest.mock('../src/backend/Queries/getUserFields.jsx', () => ({
  getUserTeam: jest.fn(),
  getSuperUserId: jest.fn(),
  getTeamAdmins: jest.fn().mockResolvedValue(['admin1', 'admin2'])
}));

jest.mock("../src/backend/Queries/getSuperUser.jsx", () => ({
  getSuperUserId: jest.fn(),
  getSuperUserChannels: jest.fn(),
}));

describe("Channel Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createChannel", () => {
    it("should create a channel and update superuser channels", async () => {
      // Set up mocks
      getCurrentUser.mockReturnValue({ uid: "user123" });
      getUserTeam.mockResolvedValue("team456");
      getSuperUserId.mockResolvedValue("superuser789");
      
      // Call the function
      await createChannel("general");

      // Verify channel was created with correct ID
      const expectedChannelId = "team456general";
      
      // Check that updateDoc was called to update the superuser's channels
      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", "superuser789");
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
        channels: "team456general"
      });
    });

    it("should handle missing team ID", async () => {
      // Set up mocks to return null for team ID
      getCurrentUser.mockReturnValue({ uid: "user123" });
      getUserTeam.mockResolvedValue(null);
      
      console.log = jest.fn(); // Mock console.log
      
      // Call the function
      await createChannel("general");
      
      // Verify error handling
      expect(console.log).toHaveBeenCalledWith("ERROR: No team ID found.");
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("should handle missing superUser ID", async () => {
      // Set up mocks
      getCurrentUser.mockReturnValue({ uid: "user123" });
      getUserTeam.mockResolvedValue("team456");
      getSuperUserId.mockResolvedValue(null);
      
      console.log = jest.fn(); // Mock console.log
      
      // Call the function
      await createChannel("general");
      
      // Verify error handling
      expect(console.log).toHaveBeenCalledWith("ERROR: No superUser ID found.");
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it("should handle empty channel name", async () => {
      // Set up mocks
      getCurrentUser.mockReturnValue({ uid: "user123" });
      getUserTeam.mockResolvedValue("team456");
      
      // Call with empty channel name
      await createChannel("");
      
      // Verify no updates called
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
});
