//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";

library Multiplayer {
    struct Game {
        uint256 timestamp;
        address[2] players;
        uint24 state;
        bool isOpen;
        bool isPlaying;
        bool isDone;
    }

    struct Games {
        uint256[] gameIds;
        mapping(uint256 => Game) data;
        mapping(uint256 => uint256) indexOf;
        mapping(uint256 => bool) inserted;
    }

    function list(Games storage games) internal view returns (uint256[] memory) {
        return games.gameIds;
    }

    function get(Games storage games, uint256 gameId) internal view returns (Game memory) {
        require(exists(games, gameId), "Game does not exist");
        return games.data[gameId];
    }

    function getAtIndex(Games storage games, uint256 index) internal view returns (uint256) {
        return games.gameIds[index];
    }

    function getPlayers(Games storage games, uint256 gameId) internal view returns (address[2] memory) {
        require(exists(games, gameId), "Game does not exist");
        return games.data[gameId].players;
    }

    function exists(Games storage games, uint256 gameId) internal view returns (bool) {
        return games.inserted[gameId];
    }

    function isOpen(Games storage games, uint256 gameId) internal view returns (bool) {
        require(exists(games, gameId), "Game does not exist");
        return games.data[gameId].isOpen;
    }

    function isPlaying(Games storage games, uint256 gameId) internal view returns (bool) {
        require(exists(games, gameId), "Game does not exist");
        return games.data[gameId].isPlaying;
    }

    function create(
        Games storage games,
        uint256 gameId,
        address player
    ) public {
        require(!exists(games, gameId), "Game already exists");

        Multiplayer.Game memory game;

        game.timestamp = block.timestamp;
        game.players[1] = player;
        game.state = 0x0;
        game.isOpen = true;
        game.isPlaying = false;
        game.isDone = false;

        games.inserted[gameId] = true;
        games.data[gameId] = game;
        games.indexOf[gameId] = games.gameIds.length;
        games.gameIds.push(gameId);
    }

    function join(
        Games storage games,
        uint256 gameId,
        address player
    ) public {
        require(exists(games, gameId), "Game does not exist");
        require(isOpen(games, gameId), "Game is full");
        require(getPlayers(games, gameId)[1] != player, "Player already joined");

        Multiplayer.Game memory game = games.data[gameId];

        game.players[0] = player;
        game.isOpen = false;
        game.isPlaying = true;

        games.data[gameId] = game;
    }

    function finish(
        Games storage games,
        uint256 gameId,
        address player
    ) public {
        require(exists(games, gameId), "Game does not exist");
        require(isPlaying(games, gameId), "Game is not in progress");
        require(
            getPlayers(games, gameId)[0] == player || getPlayers(games, gameId)[1] == player,
            "Player is not part of game"
        );

        Multiplayer.Game memory game = games.data[gameId];

        game.isPlaying = false;
        game.isDone = true;

        games.data[gameId] = game;
    }
}
