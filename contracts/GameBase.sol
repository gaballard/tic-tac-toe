//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "hardhat/console.sol";
import "./Multiplayer.sol";

contract GameBase {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Multiplayer for Multiplayer.Games;
    using Multiplayer for Multiplayer.Game;

    /** Properties **/
    CountersUpgradeable.Counter public gamesPlayed;
    Multiplayer.Games private games;

    /** Events **/
    event GameCreated(uint256 gameId);
    event GameJoined(uint256 gameId, address player);
    event GameFinished(uint256 gameId);

    /** Methods **/
    function listGames() public view returns (uint256[] memory) {
        uint256[] memory list = games.list();
        console.log("Found %s games", list.length);
        return list;
    }

    function getGames() public view returns (Multiplayer.Game[] memory) {
        uint256[] memory list = games.list();
        Multiplayer.Game[] memory data = new Multiplayer.Game[](list.length);
        for (uint256 i = 0; i < list.length; i++) {
            data[i] = games.get(list[i]);
        }
        return data;
    }

    function getGame(uint256 gameId) public view returns (Multiplayer.Game memory) {
        return games.get(gameId);
    }

    function createGame() public {
        gamesPlayed.increment();
        uint256 gameId = gamesPlayed.current();
        address player = msg.sender;
        games.create(gameId, player);
        console.log("Created new game with ID %s!", gameId);
        emit GameCreated(gameId);
    }

    function joinGame(uint256 gameId) public {
        address player = msg.sender;
        games.join(gameId, player);
        console.log("Player %s joined game %s!", player, gameId);
        emit GameJoined(gameId, player);
    }

    function finishGame(uint256 gameId) public {
        address player = msg.sender;
        games.finish(gameId, player);
        console.log("Player %s finished game %s!", player, gameId);
        emit GameFinished(gameId);
    }
}
