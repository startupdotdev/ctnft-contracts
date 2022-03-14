const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CtfV1", function () {
  it("createCtf() with no value", async function () {
    [signer1, signer2] = await ethers.getSigners();

    const CtfV1 = await ethers.getContractFactory("CtfV1");
    const contract = await CtfV1.deploy();
    await contract.deployed();

    let txn = await contract.createCtf('Party Town', 'partypass');
    await txn.wait();
    
    let result = await contract.ctfs(1);

    expect(result.name).to.equal('Party Town');
    expect(result.creator).to.equal(signer1.address);
    expect(result.balance).to.equal(0);

    // With value 
    let etherValue = ethers.utils.parseEther("1.0");
    txn = await contract.connect(signer2).createCtf('Party Town 2', 'partypass2', {value: etherValue});
    await txn.wait();

    result = await contract.ctfs(2);

    expect(result.name).to.equal('Party Town 2');
    expect(result.creator).to.equal(signer2.address);
    expect(result.balance).to.equal(etherValue);
  });
});
