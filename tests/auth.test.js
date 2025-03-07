import { getDocs } from "firebase/firestore";
import { doesUserExist } from "../src/backend/auth.jsx";

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getFirestore: jest.fn(() => ({})),
}));

describe("doesUserExist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when querySnapshot.size > 0", async () => {
    getDocs.mockResolvedValue({ size: 1 });
    const result = await doesUserExist("testUser");
    expect(result).toBe(true);
    expect(getDocs).toHaveBeenCalled();
  });

  it("should return false when querySnapshot.size is 0", async () => {
    getDocs.mockResolvedValue({ size: 0 });
    const result = await doesUserExist("anotherUser");
    expect(result).toBe(false);
    expect(getDocs).toHaveBeenCalled();
  });
});
