const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CtfV1", function () {
  it("createCtf() with no value", async function () {
    [signer] = await ethers.getSigners();

    const CtfV1 = await ethers.getContractFactory("CtfV1");
    const contract = await CtfV1.deploy();
    await contract.deployed();

    await contract.createCtf('Party Town', 'partypass');

    let { name, creator, balance } = await contract.ctfs(1);

    expect(name).to.equal('Party Town');
    expect(creator).to.equal(signer.address);
    expect(balance).to.equal(0);
  });
});
