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
    [deployer, user] = await ethers.getSigners();

    const Chat = await ethers.getContractFactory("Chat");
    chat = await Chat.deploy(NAME, SYMBOL);

    // Create a channel
    const transaction = await chat
      .connect(deployer)
      .createChannel("general", tokens(1));
    await transaction.wait();
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
    });
    it("Sets the owner", async () => {
      const result = await chat.owner();
      expect(result).to.equal(deployer.address);
    });
  });

  describe("Creating Channels", () => {
    it("Returns total channels", async () => {
      const result = await chat.totalChannels();
      expect(result).to.be.equal(1);
    });

    it("Returns channel attributes", async () => {
      const channel = await chat.getChannel(1);
      expect(channel.id).to.be.equal(1);
      expect(channel.name).to.be.equal("general");
      expect(channel.cost).to.be.equal(tokens(1));
    });
  });

  describe("Joining Channels", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("1", 'ether')

    beforeEach(async () => {
      const transaction = await chat.connect(user).mint(ID, { value: AMOUNT })
      await transaction.wait()
    })

    it('Joins the user', async () => {
      const result = await chat.hasJoined(ID, user.address)
      expect(result).to.be.equal(true)
    })

    it('Increases total supply', async () => {
      const result = await chat.totalSupply()
      expect(result).to.be.equal(ID)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(chat.address)
      expect(result).to.be.equal(AMOUNT)
    })
  })

  describe("Withdrawing", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')
    let balanceBefore

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await chat.connect(user).mint(ID, { value: AMOUNT })
      await transaction.wait()

      transaction = await chat.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(chat.address)
      expect(result).to.equal(0)
    })
  })

});
