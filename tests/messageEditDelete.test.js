import { ref, remove, update } from "firebase/database";

// Import message operations
import { deleteMessage, editMessage } from "./message.test.js";

// Mock Firebase
jest.mock("firebase/database", () => ({
  ref: jest.fn(() => "messageRef"),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("../src/config/firebase.jsx", () => ({
  realtimeDB: {},
}));

// Define isEditable function
export const isEditable = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') {
    return false;
  }
  
  const now = Date.now();
  const fiveMinutesInMs = 5 * 60 * 1000;
  
  return now - timestamp < fiveMinutesInMs;
};

describe("Message Edit & Delete Operations with Time Threshold", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("editMessage", () => {
    it("should update message content with edited prefix", async () => {
      // Call the function
      await editMessage("Updated message content", "msg123");
      
      // Verify ref was called with the right path
      expect(ref).toHaveBeenCalledWith(null, "messages/msg123");
      
      // Verify update was called with the right content
      expect(update).toHaveBeenCalledWith("messageRef", {
        Message: "* Updated message content"
      });
    });
  });

  describe("deleteMessage", () => {
    it("should delete a message by its ID", async () => {
      // Call the function
      await deleteMessage("msg123");
      
      // Verify ref was called with the right path
      expect(ref).toHaveBeenCalledWith(null, "messages/msg123");
      
      // Verify remove was called
      expect(remove).toHaveBeenCalledWith("messageRef");
    });
  });

  describe("isEditable", () => {
    it("should return true for messages less than 5 minutes old", () => {
      const now = Date.now();
      const fourMinutesAgo = now - (4 * 60 * 1000);
      
      expect(isEditable(fourMinutesAgo)).toBe(true);
    });

    it("should return false for messages more than 5 minutes old", () => {
      const now = Date.now();
      const sixMinutesAgo = now - (6 * 60 * 1000);
      
      expect(isEditable(sixMinutesAgo)).toBe(false);
    });

    it("should return false for null or invalid timestamp", () => {
      expect(isEditable(null)).toBe(false);
      expect(isEditable("invalid")).toBe(false);
    });
  });
});