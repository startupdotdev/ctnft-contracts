//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract CtfV1 {
  using Counters for Counters.Counter;

  struct Ctf {
    string name;
    string secret;
    address creator;
    uint256 balance;
    bool isActive;
  }

  Counters.Counter public _ctfIds;
  mapping(uint256 => Ctf) public ctfs;
  mapping(uint256 => mapping(address => string)) public answers;

  function createCtf(string memory name, string memory secret) public payable {
    require(msg.value > 0, "Ether required to create a CTF");

    _ctfIds.increment();
    uint256 newId = _ctfIds.current();

    ctfs[newId] = Ctf({
      name: name,
      secret: secret,
      creator: msg.sender,
      balance: msg.value,
      isActive: true
    });
  }

  // TODO: Revert if the contest is over
  function commitAnswer(uint256 ctfId, string memory answerHash) public {
    require(bytes(answerHash).length == 66, "Answer is not a keccak256 hash");

    Ctf memory ctf = ctfs[ctfId];

    require(ctf.isActive == true, "CTF not active or doesn't exist");

    require(
      bytes(answers[ctfId][msg.sender]).length == 0,
      "Already submitted an answer"
    );

    answers[ctfId][msg.sender] = answerHash;
  }
}
