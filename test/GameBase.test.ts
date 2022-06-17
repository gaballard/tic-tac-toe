import { ethers, deployments, getNamedAccounts, network } from "hardhat";
import { Signer } from "ethers";
import { GameBase } from "../typechain";
import { expect } from "./chai-setup";
import config from "../utils/config";
import { impersonateAccount } from "./utils/users";

describe("GameBase", () => {
  let deployer: Signer;
  let player1: Signer;
  let player2: Signer;

  let gameBase: GameBase;

  const FORK = config.currentFork;

  const testCreateGame = async (signer: Signer, count = 1): Promise<Signer> => {
    for (let i = 0; i < count; i += 1) {
      await gameBase.connect(signer).createGame();
    }
    return signer;
  };

  const testJoinGame = async (
    signer: Signer,
    gameId: number
  ): Promise<Signer> => {
    await gameBase.connect(signer).joinGame(gameId);
    return signer;
  };

  const testFinishGame = async (
    signer: Signer,
    gameId: number
  ): Promise<Signer> => {
    await gameBase.connect(signer).finishGame(gameId);
    return signer;
  };

  beforeEach("Deploy and initialize", async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: config.hardhat.forking.url,
            blockNumber: config.hardhat.forking.blockNumber,
          },
        },
      ],
    });
    deployer = await impersonateAccount(config.accounts.deployer[FORK].address);
    player1 = await impersonateAccount(config.accounts.player1[FORK].address);
    player2 = await impersonateAccount(config.accounts.player2[FORK].address);
    await deployments.fixture("gameBase");
    gameBase = await ethers.getContract("GameBase", deployer);
  });

  it("should return a list of all game IDs", async () => {
    await testCreateGame(player1, 2);
    await testJoinGame(player2, 1);
    expect(await gameBase.listGames()).to.have.length(2);
  });

  it("should return a single game's data", async () => {
    await testCreateGame(player1);
    const game = await gameBase.getGame(1);
    expect(game).to.have.property("timestamp");
    expect(game).to.have.property("players");
    expect(game).to.have.property("state");
    expect(game).to.have.property("isOpen");
    expect(game).to.have.property("isPlaying");
    expect(game).to.have.property("isDone");
  });

  it("should return data for all games", async () => {
    await testCreateGame(player1, 2);
    await testJoinGame(player2, 1);
    const games = await gameBase.getGames();
    expect(games).to.have.length(2);
    expect(games[0].players[0]).to.equal(await player2.getAddress());
    expect(games[1].players[0]).to.equal(ethers.constants.AddressZero);
  });

  it("should let players create a game", async () => {
    await testCreateGame(player2);
    const game = await gameBase.getGame(1);
    expect(game.players[0]).to.equal(ethers.constants.AddressZero);
    expect(game.players[1]).to.equal(await player2.getAddress());
  });

  it("should let players join an open game", async () => {
    await testCreateGame(player1);
    await testJoinGame(player2, 1);
    const game = await gameBase.getGame(1);
    expect(game.players[0]).to.equal(await player2.getAddress());
    expect(game.players[1]).to.equal(await player1.getAddress());
    expect(game.isOpen).to.be.false;
    expect(game.isPlaying).to.be.true;
  });

  describe("finishGame()", () => {
    beforeEach(async () => {
      await testCreateGame(player1);
      await testJoinGame(player2, 1);
    });

    it("should let player one finish an open game", async () => {
      await testFinishGame(player2, 1);
      const game = await gameBase.getGame(1);
      expect(game.isPlaying).to.be.false;
      expect(game.isDone).to.be.true;
    });

    it("should let player two finish an open game", async () => {
      await testFinishGame(player1, 1);
      const game = await gameBase.getGame(1);
      expect(game.isPlaying).to.be.false;
      expect(game.isDone).to.be.true;
    });
  });

  it("should emit an event on game creation", async () => {
    await expect(gameBase.connect(player1).createGame())
      .to.emit(gameBase, "GameCreated")
      .withArgs(1);
  });

  it("should emit an event on game join", async () => {
    await testCreateGame(player1);
    await expect(gameBase.connect(player2).joinGame(1))
      .to.emit(gameBase, "GameJoined")
      .withArgs(1, await player2.getAddress());
  });

  it("should emit an event on game finish", async () => {
    await testCreateGame(player1);
    await testJoinGame(player2, 1);
    await expect(gameBase.connect(player2).finishGame(1))
      .to.emit(gameBase, "GameFinished")
      .withArgs(1);
  });
});
