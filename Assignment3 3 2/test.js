const EventTicketing = artifacts.require("EventTicketing");

contract("EventTicketing", (accounts) => {
  let instance;
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  before(async () => {
    instance = await EventTicketing.new(100, web3.utils.toWei("0.01", "ether"), { from: admin });
  });

  it("should purchase a ticket", async () => {
    await instance.purchaseTicket(1, { from: user1, value: web3.utils.toWei("0.01", "ether") });
    const owner = await instance.ticketHolders(1);
    assert.equal(owner, user1, "Ticket not assigned to the correct owner");
  });

  it("should initiate a ticket swap request", async () => {
    await instance.requestSwap(1, { from: user1 });
    const swapRequest = await instance.swapRequests(1);
    assert.equal(swapRequest, user1, "Swap request not recorded correctly");
  });

  it("should approve a ticket swap", async () => {
    await instance.purchaseTicket(2, { from: user2, value: web3.utils.toWei("0.01", "ether") });
    await instance.approveSwap(1, { from: user2 });
    const newOwner = await instance.ticketHolders(1);
    assert.equal(newOwner, user2, "Swap not approved correctly");
  });

  it("should list a ticket for resale", async () => {
    await instance.listResale(web3.utils.toWei("0.02", "ether"), { from: user2 });
    const resaleInfo = await instance.ticketsForResale(1);
    assert.equal(resaleInfo.price, web3.utils.toWei("0.02", "ether"), "Resale price not set correctly");
  });

  it("should buy a ticket from the resale list", async () => {
    await instance.buyResaleTicket(1, { from: user1, value: web3.utils.toWei("0.02", "ether") });
    const newOwner = await instance.ticketHolders(1);
    assert.equal(newOwner, user1, "Resale ticket not bought correctly");
  });
});
