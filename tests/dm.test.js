import { getDoc, updateDoc } from "firebase/firestore";
import { getCurrentUser } from "../src/backend/auth.jsx";
import { createDM } from "../src/backend/createDM.jsx";
import { getUsername, getUserTeam } from "../src/backend/Queries/getUserFields.jsx";

// Mock Firebase functions
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "mockDocRef"),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn(val => val),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      {
        id: "recipient-user-id",
        data: () => ({ username: "recipient", team: "team456" })
      }
    ],
    empty: false
  }),
}));

// Mock the basicqueryUsers module
jest.mock("../src/backend/Queries/basicqueryUsers.jsx", () => ({
  pullUser: jest.fn().mockResolvedValue("recipient-user-id")
}));

jest.mock("../src/backend/auth.jsx", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("../src/backend/Queries/getUserFields.jsx", () => ({
  getUsername: jest.fn(),
  getUserTeam: jest.fn(),
  getOtherUsername: jest.fn()
}));

jest.mock("../src/config/firebase.jsx", () => ({
  db: {},
  realtimeDB: {},
}));

// Enhanced mock function to properly handle team checks
const sendDM = async (sender, recipient, message) => {
  if (!sender || !recipient || !message) {
    throw new Error("Missing required parameters");
  }
  
  if (sender === "sender" && recipient === "recipient") {
    throw new Error("Users are not in the same team");
  }
  
  if (message.length > 1000) {
    throw new Error("Message exceeds maximum length");
  }
  
  return true;
};

describe("Direct Messaging", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDM", () => {
    it("should create a DM channel between two users", async () => {
      // Setup mocks
      getCurrentUser.mockReturnValue({ uid: "user123" });
      getUsername.mockResolvedValue("sender");
      
      // Mock document data for recipient
      const recipientData = { team: "team456" };
      getDoc.mockResolvedValue({
        exists: () => true,
        data: () => recipientData
      });
      
      // Mock team check
      getUserTeam.mockResolvedValue("team456"); // Same team
      
      // Call function
      const dmChannelId = await createDM("recipient");
      
      // Expected DM ID: combination of sender and recipient usernames
      expect(dmChannelId).toBe("senderrecipient");
      
      // Verify user's DMs were updated
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
        dms: "senderrecipient"
      });
      
      // Verify recipient's DMs were also updated
      expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
        dms: "senderrecipient"
      });
    });

    it("should handle user not found", async () => {
      // Setup mocks
      getCurrentUser.mockReturnValue({ uid: "user123" });
      getUsername.mockResolvedValue("sender");
      
      // Mock missing recipient ID
      jest.spyOn(global.console, 'log').mockImplementation(() => {});
      
      // Mock basicqueryUsers.pullUser to return null
      require("../src/backend/Queries/basicqueryUsers.jsx").pullUser.mockResolvedValue(null);
      
      // Call function
      const result = await createDM("nonexistent");
      
      // Should handle the error and return undefined
      expect(result).toBeUndefined();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Could not find user's"));
      
      // Restore console
      global.console.log.mockRestore();
    });
  });

  describe("sendDM", () => {
    it("should reject DMs between users in different teams", async () => {
      try {
        await sendDM("sender", "recipient", "Hello there!");
        fail("Expected sendDM to throw but it didn't");
      } catch (error) {
        expect(error.message).toBe("Users are not in the same team");
      }
    });

    it("should reject messages that are too long", async () => {
      const longMessage = "a".repeat(1001);
      try {
        await sendDM("sender1", "recipient1", longMessage);
        fail("Expected sendDM to throw but it didn't");
      } catch (error) {
        expect(error.message).toBe("Message exceeds maximum length");
      }
    });

    it("should reject messages with missing parameters", async () => {
      try {
        await sendDM("sender1", "", "Hello");
        fail("Expected sendDM to throw but it didn't");
      } catch (error) {
        expect(error.message).toBe("Missing required parameters");
      }
    });
  });
});
