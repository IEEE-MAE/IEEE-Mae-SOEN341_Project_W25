import { doc, updateDoc } from "firebase/firestore";
import { getCurrentUser } from "../src/backend/auth.jsx";
import { createTeam } from "../src/backend/createTeam.jsx";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => "mockDocRef"),
  updateDoc: jest.fn(),
  getFirestore: jest.fn(() => ({})),
}));

jest.mock("../src/backend/auth.jsx", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("../src/config/firebase.jsx", () => ({
  db: {},
}));

describe("createTeam", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a team with a teamId based on user uid and teamName", async () => {
    // Arrange: simulate a logged-in user
    getCurrentUser.mockReturnValue({ uid: "abc123" });
    
    // Act: call createTeam with teamName "TeamAlpha"
    await createTeam("TeamAlpha");
    
    // Assert: doc should be called with the right path and user ID
    expect(doc).toHaveBeenCalledWith(expect.anything(), "users", "abc123");
    
    // Assert: updateDoc is called with the proper doc ref and update object
    expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
      team: "abc123TeamAlpha",
      role: "superUser",
    });
  });

  it("should handle special characters in team name", async () => {
    // Arrange: simulate a logged-in user
    getCurrentUser.mockReturnValue({ uid: "abc123" });
    
    // Act: call createTeam with teamName containing special characters
    await createTeam("Team@#$%^");
    
    // Assert: doc should be called with the right path and user ID
    expect(doc).toHaveBeenCalledWith(expect.anything(), "users", "abc123");
    
    // Assert: updateDoc is called with the proper doc ref and update object
    expect(updateDoc).toHaveBeenCalledWith("mockDocRef", {
      team: "abc123Team@#$%^",
      role: "superUser",
    });
  });

  it("should handle errors during team creation", async () => {
    // Arrange: simulate a logged-in user
    getCurrentUser.mockReturnValue({ uid: "abc123" });
    
    // Make updateDoc throw an error
    updateDoc.mockRejectedValue(new Error("Database error"));
    
    console.error = jest.fn(); // Mock console.error
    
    // Act & Assert: expect the function to throw
    await expect(createTeam("TeamBeta")).rejects.toThrow("Database error");
    expect(console.error).toHaveBeenCalled();
  });

  it("should handle a null user case", async () => {
    // Arrange: simulate no logged-in user
    getCurrentUser.mockReturnValue(null);
    
    console.error = jest.fn(); // Mock console.error
    
    // Act & Assert: Function should handle null user
    await expect(createTeam("TeamGamma")).rejects.toThrow();
  });
});
