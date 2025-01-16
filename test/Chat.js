const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Chat", function () {
  let deployer, user;
  let chat;

  const NAME = "Chat";
  const SYMBOL = "DC";

  beforeEach(async () => {
    // Setup accounts
    [deployer, user] = await ethers.getSigners()

    const Chat = await ethers.getContractFactory("Chat");
    chat = await Chat.deploy(NAME, SYMBOL);
  });

  describe("Deployment", function () {
    it("Sets the name", async () => {
      // Fetch name
      let result = await chat.name();
      // Check name
      expect(result).to.equal(NAME);
    });

    it("Sets the symbol", async () => {
      // Fetch symbol
      let result = await chat.symbol();
      // Check symbol
      expect(result).to.equal(SYMBOL);
      it("Sets the owner", async () => {
        const result = await chat.owner()
        expect(result).to.equal(deployer.address)
      })
    });
  });
});
