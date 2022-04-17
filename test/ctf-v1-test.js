const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CtfV1", function () {
  let contract;

  beforeEach(async () => {
    [signer1] = await ethers.getSigners();

    const CtfV1 = await ethers.getContractFactory("CtfV1");
    contract = await CtfV1.deploy();
    await contract.deployed();
  });

  describe("createCtf()", () => {
    it("reverts without ether sent", async () => {
      await expect(
        contract.createCtf("Party Town", "partypass")
      ).to.be.revertedWith("Ether required to create a CTF");
    });

    it("with ether sent creates a new CTF", async function () {
      let etherValue = ethers.utils.parseEther("1.0");
      let txn = await contract.createCtf("Party Town 2", "partypass2", {
        value: etherValue,
      });
      await txn.wait();

      let result = await contract.ctfs(1);

      expect(result.name).to.equal("Party Town 2");
      expect(result.creator).to.equal(signer1.address);
      expect(result.balance).to.equal(etherValue);
      expect(result.isActive).to.equal(true);
    });
  });

  describe("commitAnswer()", async () => {
    it("reverts if the ctf doesn't exist", async () => {
      await expect(
        contract.commitAnswer(1, ethers.utils.id("boop + salt"))
      ).to.be.revertedWith("CTF not active or doesn't exist");
    });

    it("reverts if the hash isn't a keccak256 length value", async () => {
      let etherValue = ethers.utils.parseEther("1.0");

      let txn = await contract.createCtf("Party Town 2", "partypass2", {
        value: etherValue,
      });
      await txn.wait();

      let ctfId = 1;
      let answer = "not-keccak256-hash-length";
      await expect(contract.commitAnswer(ctfId, answer)).to.be.revertedWith(
        "Answer is not a keccak256 hash"
      );
    });

    it("accepts an answer that is hashed", async () => {
      let etherValue = ethers.utils.parseEther("1.0");

      let txn = await contract.createCtf("Party Town 2", "partypass2", {
        value: etherValue,
      });
      await txn.wait();

      let ctfId = 1;

      let answer = ethers.utils.id("boop + salt");
      let commitTxn = await contract.commitAnswer(ctfId, answer);
      await commitTxn.wait();

      let commitAnswer = await contract.answers(ctfId, signer1.address);
      expect(commitAnswer).to.equal(answer);
    });

    it("returns empty if the user hasn't submitted an answer yet", async () => {
      let etherValue = ethers.utils.parseEther("1.0");

      let txn = await contract.createCtf("Party Town 2", "partypass2", {
        value: etherValue,
      });
      await txn.wait();

      let ctfId = 1;

      let commitAnswer = await contract.answers(ctfId, signer1.address);
      expect(commitAnswer).to.equal("");
    });

    it("reverts if the user has already submitted an answer yet", async () => {
      let etherValue = ethers.utils.parseEther("1.0");

      let txn = await contract.createCtf("Party Town 2", "partypass2", {
        value: etherValue,
      });
      await txn.wait();

      let ctfId = 1;
      let answer = ethers.utils.id("boop + salt");
      let commitTxn = await contract.commitAnswer(ctfId, answer);
      await commitTxn.wait();

      await expect(contract.commitAnswer(ctfId, answer)).to.be.revertedWith(
        "Already submitted an answer"
      );
    });
  });
});
