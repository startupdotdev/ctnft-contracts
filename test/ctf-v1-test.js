const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CtfV1", function () {
  let contract;
  let secret = "secret-withsalt";
  let secretHash = ethers.utils.id(secret);
  let ctfId;
  let etherValue = ethers.utils.parseEther("1.0");

  beforeEach(async () => {
    [signer1] = await ethers.getSigners();

    const CtfV1 = await ethers.getContractFactory("CtfV1");
    contract = await CtfV1.deploy();
    await contract.deployed();
  });

  const createCtf = async () => {
    let txn = await contract.createCtf("Party Town", secretHash, {
      value: etherValue,
    });
    await txn.wait();

    ctfId = 1;
  };

  describe("createCtf()", () => {
    it("reverts without ether sent", async () => {
      await expect(
        contract.createCtf("Party Town", secretHash)
      ).to.be.revertedWith("Ether required to create a CTF");
    });

    it("with ether sent creates a new CTF", async function () {
      await createCtf();

      let result = await contract.ctfs(ctfId);

      expect(result.name).to.equal("Party Town");
      expect(result.creator).to.equal(signer1.address);
      expect(result.balance).to.equal(etherValue);
      expect(result.isActive).to.equal(true);
      expect(result.secret).to.equal(secretHash);
    });
  });

  describe("commitAnswer()", async () => {
    it("reverts if the ctf doesn't exist", async () => {
      await expect(
        contract.commitAnswer(1, ethers.utils.id("boop + salt"))
      ).to.be.revertedWith("CTF not active or doesn't exist");
    });

    it("accepts an answer", async () => {
      await createCtf();

      let answer = ethers.utils.id("boop + salt");
      let commitTxn = await contract.commitAnswer(ctfId, answer);
      await commitTxn.wait();

      let commitAnswer = await contract.answers(ctfId, signer1.address);
      expect(commitAnswer.secret).to.equal(answer);
      expect(commitAnswer.blockNumber.toNumber()).to.be.greaterThan(0);
    });

    it("returns empty if the user hasn't submitted an answer yet", async () => {
      await createCtf();

      let commitAnswer = await contract.answers(ctfId, signer1.address);
      expect(commitAnswer.secret).to.equal(ethers.constants.HashZero);
      expect(commitAnswer.blockNumber.toNumber()).to.equal(0);
    });

    it("reverts if the user has already submitted an answer yet", async () => {
      await createCtf();

      let answer = ethers.utils.id("boop + salt");
      let commitTxn = await contract.commitAnswer(ctfId, answer);
      await commitTxn.wait();

      await expect(contract.commitAnswer(ctfId, answer)).to.be.revertedWith(
        "Already submitted an answer"
      );
    });
  });

  describe("revealAnswer()", async () => {
    it("reverts if there isn't a committed answer", async () => {
      await createCtf();

      await expect(
        contract.revealAnswer(ctfId, "answer", "the salt")
      ).to.be.revertedWith("No previous answer committed");
    });

    it("reverts if the submitted answer doesn't match the committed answer", async () => {
      await createCtf();

      let answer = "boop";
      let salt = "-thesalt";
      let answerHash = ethers.utils.id(`${answer}${salt}`);

      let commitTxn = await contract.commitAnswer(ctfId, answerHash);
      await commitTxn.wait();

      await expect(
        contract.revealAnswer(ctfId, "not", "the same")
      ).to.be.revertedWith("Doesn't match submitted answer");
    });

    it("reverts if the block isn't a future block", async () => {
      const Tester = await ethers.getContractFactory("SameBlockTester");
      testerContract = await Tester.deploy(contract.address);
      await testerContract.deployed();

      await expect(
        testerContract.testCommitAndRevealSameBlock({
          value: ethers.utils.parseEther("1.0"),
        })
      ).to.be.revertedWith("Can only reveal in future block");
    });

    // TODO: after we can stop contests add this test
    // it("reverts if the ctf doesn't exist", async () => {});

    it("reverts if the submitted answer doesn't match the secret", async () => {
      await createCtf();

      let answer = "boop";
      let salt = "-thesalt";
      let answerHash = ethers.utils.id(`${answer}${salt}`);

      let commitTxn = await contract.commitAnswer(ctfId, answerHash);
      await commitTxn.wait();

      await expect(
        contract.revealAnswer(ctfId, answer, salt)
      ).to.be.revertedWith("Submission doesn't match secret");
    });

    it("succeeds and pays the winner if the answer matches the secret", async () => {
      await createCtf();

      let answer = secret;
      let salt = "-moresalt";
      let answerHash = ethers.utils.id(`${answer}${salt}`);

      let commitTxn = await contract.commitAnswer(ctfId, answerHash);
      await commitTxn.wait();

      await expect(
        await contract.revealAnswer(ctfId, answer, salt)
      ).to.changeEtherBalances(
        [contract, signer1],
        [ethers.utils.parseEther("-1.0"), ethers.utils.parseEther("1.0")]
      );

      let ctf = await contract.ctfs(1);
      expect(ctf.isActive).to.equal(false);
    });
  });
});
