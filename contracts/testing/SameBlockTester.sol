//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface ICtf {
  function createCtf(string memory name, bytes32 secret) external payable;

  function commitAnswer(uint256 ctfId, bytes32 saltedHash) external;

  function revealAnswer(
    uint256 ctfId,
    string memory answer,
    string memory salt
  ) external;
}

contract SameBlockTester {
  ICtf private ctfContract;

  constructor(address _ctfContract) {
    ctfContract = ICtf(_ctfContract);
  }

  function testCommitAndRevealSameBlock() public payable {
    string memory secret = "test";
    string memory salt = "-thesalt";
    bytes32 hash = keccak256(abi.encodePacked(secret, salt));

    ctfContract.createCtf{ value: msg.value }("Test", hash);

    ctfContract.commitAnswer(1, hash);
    ctfContract.revealAnswer(1, secret, salt);
  }
}
