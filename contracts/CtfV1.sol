//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

// Note: this is very insecure. :)
contract CtfV1 {
    using Counters for Counters.Counter;

    struct Ctf {
        string name;
        string secret;
        address creator;
        uint256 balance;
    }

    Counters.Counter public _ctfIds;
    mapping(uint256 => Ctf) public ctfs;

    function createCtf(string memory name, string memory secret)
        public
        payable
    {
        _ctfIds.increment();
        uint256 newId = _ctfIds.current();

        ctfs[newId] = Ctf({
            name: name,
            secret: secret,
            creator: msg.sender,
            balance: msg.value
        });
    }
}
