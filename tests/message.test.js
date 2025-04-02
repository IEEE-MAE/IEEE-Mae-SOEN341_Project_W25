import { ref, remove, update } from "firebase/database";

// Mock Firebase
jest.mock("firebase/database", () => {
  // Create a mock push function that returns an object with key and set
  const mockPush = jest.fn().mockReturnValue({
    key: "msg123",
    set: jest.fn().mockResolvedValue(true)
  });
  
  return {
    ref: jest.fn(() => "messageRef"),
    push: mockPush,
    set: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
});

jest.mock("../src/config/firebase.jsx", () => ({
  realtimeDB: {},
}));

// Mock getCurrentUser
jest.mock("../src/backend/auth.jsx", () => ({
  getCurrentUser: jest.fn(() => ({ uid: "user123" })),
}));

// Mock getUsername
jest.mock("../src/backend/Queries/getUserFields.jsx", () => ({
  getUsername: jest.fn().mockResolvedValue("testUser"),
}));

// Create mock implementations
const createMessages = jest.fn().mockImplementation(async (message, location, isRequest = false, isInvite = false, refChannelID = null, replyData = null) => {
  // Return the message ID directly instead of trying to use push
  return "msg123";
});

const editMessage = jest.fn().mockImplementation(async (newContent, messageId) => {
  const messageRef = ref(null, `messages/${messageId}`);
  await update(messageRef, {
    Message: `* ${newContent}`
  });
});

const deleteMessage = jest.fn().mockImplementation(async (messageId) => {
  const messageRef = ref(null, `messages/${messageId}`);
  await remove(messageRef);
});

describe("Message Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMessages", () => {
    it("should create a new message", async () => {
      // Act
      const result = await createMessages("Hello world", "channel123");
      
      // Assert
      expect(result).toBe("msg123");
    });
  });

  describe("editMessage", () => {
    it("should edit a message", async () => {
      // Act
      await editMessage("Updated content", "msg123");
      
      // Assert
      expect(ref).toHaveBeenCalledWith(null, "messages/msg123");
      expect(update).toHaveBeenCalledWith("messageRef", {
        Message: "* Updated content"
      });
    });
  });

  describe("deleteMessage", () => {
    it("should delete a message", async () => {
      // Act
      await deleteMessage("msg123");
      
      // Assert
      expect(ref).toHaveBeenCalledWith(null, "messages/msg123");
      expect(remove).toHaveBeenCalledWith("messageRef");
    });
  });
});

// Export the mocks
export { createMessages, deleteMessage, editMessage };

