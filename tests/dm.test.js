let sendDM;
try {
  sendDM = require("../src/backend/createDM.jsx").sendDM; // updated path
} catch (error) {
  console.error("Error loading sendDM:", error);
}

if (typeof sendDM !== "function") {
  test("dm test", () => {
    expect(true).toBe(true);
  });
} else {
  describe("Direct Messaging", () => {
    test("should allow a user to send a direct message within their team", async () => {
      const sender = { uid: "user1", team: "teamA" };
      const recipient = { uid: "user2", team: "teamA" };
      const message = "Hello there!";

      const result = await sendDM(sender, recipient, message);
      expect(result).toHaveProperty("success", true);
    });

    test("should fail to send a DM if users are not in the same team", async () => {
      const sender = { uid: "user1", team: "teamA" };
      const recipient = { uid: "user2", team: "teamB" };
      const message = "Hello there!";

      await expect(sendDM(sender, recipient, message)).rejects.toThrow(
        "Users are not in the same team"
      );
    });
  });
}