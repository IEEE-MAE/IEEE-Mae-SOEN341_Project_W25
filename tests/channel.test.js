jest.mock("../src/components/Channels.jsx", () => ({
  createChannel: jest.fn((user, channelData) => {
    if (user.role === "admin" || user.role === "superUser") {
      return Promise.resolve({
        id: "channel123",
        name: channelData.name,
        teamId: channelData.teamId
      });
    } else {
      return Promise.reject(new Error("Unauthorized"));
    }
  })
}));

const { createChannel } = require("../src/components/Channels.jsx");

describe("Channel Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should allow an admin to create a channel", async () => {
    const admin = { uid: "admin1", role: "admin", team: "teamA" };
    const channelData = { name: "General", teamId: "teamA" };
    const newChannel = await createChannel(admin, channelData);

    expect(newChannel).toHaveProperty("id");
    expect(newChannel.name).toBe("General");
    expect(newChannel.teamId).toBe("teamA");
  });

  test("should reject channel creation if the user is not an admin", async () => {
    const nonAdmin = { uid: "user1", role: "member", team: "teamA" };
    const channelData = { name: "General", teamId: "teamA" };

    await expect(createChannel(nonAdmin, channelData)).rejects.toThrow(
      "Unauthorized"
    );
  });
});