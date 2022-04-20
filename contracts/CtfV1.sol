//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract CtfV1 {
  using Counters for Counters.Counter;

  struct Ctf {
    string name;
    bytes32 secret;
    address creator;
    uint256 balance;
    bool isActive;
  }

  struct Answer {
    bytes32 secret;
    uint256 blockNumber;
  }

  Counters.Counter public _ctfIds;
  mapping(uint256 => Ctf) public ctfs;
  mapping(uint256 => mapping(address => Answer)) public answers;

  function createCtf(string memory name, bytes32 secret) public payable {
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

    // TODO: emit event
  }

  // TODO: Revert if the contest is over
  function commitAnswer(uint256 ctfId, bytes32 saltedHash) public {
    Ctf memory ctf = ctfs[ctfId];

    require(ctf.isActive == true, "CTF not active or doesn't exist");

    require(
      answers[ctfId][msg.sender].blockNumber == 0,
      "Already submitted an answer"
    );

    answers[ctfId][msg.sender] = Answer({
      secret: saltedHash,
      blockNumber: block.number
    });

    // TODO: emit event
  }

  // TODO: Add re-entrancy guard for fun and profit?
  function revealAnswer(
    uint256 ctfId,
    string memory answer,
    string memory salt
  ) public {
    require(
      answers[ctfId][msg.sender].blockNumber != 0,
      "No previous answer committed"
    );

    require(
      block.number > answers[ctfId][msg.sender].blockNumber,
      "Can only reveal in future block"
    );

    require(
      keccak256(abi.encodePacked(answer, salt)) ==
        answers[ctfId][msg.sender].secret,
      "Doesn't match submitted answer"
    );

    Ctf storage ctf = ctfs[ctfId];

    require(ctf.isActive == true, "CTF not active or doesn't exist");

    require(
      keccak256(abi.encodePacked(answer)) == ctf.secret,
      "Submission doesn't match secret"
    );

    // You won!
    uint256 prize = ctf.balance;
    ctf.balance = 0;
    ctf.isActive = false;

    (bool sent, bytes memory data) = msg.sender.call{ value: prize }("");
    require(sent, "Failed to send Ether");

    // TODO: emit Event here
  }
}
