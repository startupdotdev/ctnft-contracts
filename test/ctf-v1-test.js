const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CtfV1", function () {
  it("Should return the new greeting once it's changed", async function () {
    const CtfV1 = await ethers.getContractFactory("CtfV1");
    const ctf = await CtfV1.deploy();
    await ctf.deployed();

    expect(await ctf.getCtfsCount()).to.equal(0);

    await ctf.createCtf('Party Town', 'partypass');

    expect(await ctf.getCtfsCount()).to.equal(1);
  });
});
