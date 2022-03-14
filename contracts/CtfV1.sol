//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// Note: this is very insecure. :)
contract CtfV1 {
    struct Ctf {
        string name;
        string secret;
        address creator;
    }

    Ctf[] private _ctfs;

    function createCtf(string memory name, string memory secret)
        public
        payable
    {
        _ctfs.push(Ctf({name: name, secret: secret, creator: msg.sender}));
    }

    function getCtfsCount() public view returns (uint256) {
        return _ctfs.length;
    }
}
