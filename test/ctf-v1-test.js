const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CtfV1", function () {
  describe("createCtf()", () => {
    it("reverts without ether sent", async () => {
      [signer1, signer2] = await ethers.getSigners();

      const CtfV1 = await ethers.getContractFactory("CtfV1");
      const contract = await CtfV1.deploy();
      await contract.deployed();

      // With no value reverts
      await expect(
        contract.createCtf("Party Town", "partypass")
      ).to.be.revertedWith("An Ether prize is required to create a CTF");
    });

    it("with ether sent creates a new CTF", async function () {
      [signer1, signer2] = await ethers.getSigners();

      const CtfV1 = await ethers.getContractFactory("CtfV1");
      const contract = await CtfV1.deploy();
      await contract.deployed();

      let etherValue = ethers.utils.parseEther("1.0");
      txn = await contract
        .connect(signer2)
        .createCtf("Party Town 2", "partypass2", { value: etherValue });
      await txn.wait();

      result = await contract.ctfs(1);

      expect(result.name).to.equal("Party Town 2");
      expect(result.creator).to.equal(signer2.address);
      expect(result.balance).to.equal(etherValue);
    });
  });

  // describe("solveCtf()", () => {
  //   let contract;
  //   const ctfId = 1;

  //   beforeEach(async () => {
  //     [signer1, signer2] = await ethers.getSigners();

  //     const CtfV1 = await ethers.getContractFactory("CtfV1");
  //     contract = await CtfV1.deploy();
  //     await contract.deployed();

  //     let txn = await contract.createCtf("Party Town", "correct-answer");
  //     await txn.wait();
  //   });

  //   it("with the correct answer stops the contest and pays the balance", async () => {
  //     await expect(
  //       await contract.solveCtf(ctfId, "correct-answer")
  //     ).to.changeEtherBalance(signer1, ethers.utils.parseEther("1"));

  //     let ctf = await contract.ctfs(1);
  //     expect(ctf.isActive).to.equal(false);
  //   });

  //   it("with the incorrect answer stops the contest and pays the balance", async () => {});
  // });
});
