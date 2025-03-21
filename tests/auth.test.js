import { collection, getDocs, query, where } from "firebase/firestore";
import { doesUserExist } from "../src/backend/auth.jsx";

// Mock Firebase
jest.mock("firebase/firestore", () => ({
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  where: jest.fn(),
  query: jest.fn(),
  collection: jest.fn(),
}));

jest.mock("../src/config/firebase.jsx", () => ({
  db: {},
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  }
}));

describe("Authentication Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("doesUserExist", () => {
    it("should return true when a user exists", async () => {
      // Mock query response with user
      const mockQuerySnapshot = {
        empty: false,
        size: 1,
        docs: [{ id: "user1", data: () => ({ username: "testUser" }) }]
      };
      
      // Set up mocks
      collection.mockReturnValue("users-collection");
      where.mockReturnValue("username-condition");
      query.mockReturnValue("users-query");
      getDocs.mockResolvedValue(mockQuerySnapshot);

      // Call the function
      const result = await doesUserExist("testUser");
      
      // Verify the result
      expect(result).toBe(true);
      expect(collection).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith("username", "==", "testUser");
      expect(query).toHaveBeenCalledWith("users-collection", "username-condition");
      expect(getDocs).toHaveBeenCalledWith("users-query");
    });

    it("should return false when a user does not exist", async () => {
      // Mock empty query response
      const mockQuerySnapshot = {
        empty: true,
        size: 0,
        docs: []
      };
      
      // Set up mocks
      collection.mockReturnValue("users-collection");
      where.mockReturnValue("username-condition");
      query.mockReturnValue("users-query");
      getDocs.mockResolvedValue(mockQuerySnapshot);
      
      // Save original console.log
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      
      // Call the function
      const result = await doesUserExist("nonexistentUser");
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      // Verify the result
      expect(result).toBe(false);
    });

    it("should handle database errors gracefully", async () => {
      // Mock a database error
      collection.mockReturnValue("users-collection");
      where.mockReturnValue("username-condition");
      query.mockReturnValue("users-query");
      getDocs.mockRejectedValue(new Error("Database connection error"));
      
      // Save original console.log
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      
      // Call the function and expect it to handle the error
      const result = await doesUserExist("testUser");
      
      // Verify error was logged
      expect(console.log).toHaveBeenCalledWith("Error fetching username:", expect.any(Error));
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      // Function should handle errors gracefully
      expect(result).toBeUndefined();
    });

    it("should handle empty username input", async () => {
      // Save original console.log
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      
      // Call with empty username
      const result = await doesUserExist("");
      
      // Should still make the query but return false since no matches
      expect(collection).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith("username", "==", "");
      
      // Restore console.log
      console.log = originalConsoleLog;
    });
  });
});
