import { updateDoc } from "firebase/firestore";
import { getCurrentUser } from "../src/backend/auth.jsx";
import { createTeam } from "../src/backend/createTeam.jsx";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock("../src/backend/auth.jsx", () => ({
  getCurrentUser: jest.fn(),
}));

describe("createTeam", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a team with a teamId based on user uid and teamName", async () => {
    // Arrange: simulate a logged-in user
    getCurrentUser.mockReturnValue({ uid: "abc" });
    // Act: call createTeam with teamName "TeamA"
    await createTeam("TeamA");
    const teamID = "abcTeamA";
    // Assert: updateDoc is called with the proper doc ref and update object
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      team: teamID,
      role: "superUser",
    });
  });
});