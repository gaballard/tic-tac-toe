import envconfig from "./utils/config";
import { HardhatUserConfig, task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      ...envconfig.hardhat,
    },
    mumbai: {
      url: envconfig.providerUrls.mumbai,
      accounts: [
        `0x${envconfig.accounts.deployer.mumbai.private_key}`,
        `0x${envconfig.accounts.player1.mumbai.private_key}`,
        `0x${envconfig.accounts.player2.mumbai.private_key}`,
      ],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      mumbai: envconfig.accounts.deployer.mumbai
        ? `privatekey://${envconfig.accounts.deployer.mumbai.private_key}`
        : null,
    },
    player1: {
      default: 1,
      mumbai: envconfig.accounts.player1.mumbai
        ? `privatekey://${envconfig.accounts.player1.mumbai.private_key}`
        : null,
    },
    player2: {
      default: 2,
      mumbai: envconfig.accounts.player2.mumbai
        ? `privatekey://${envconfig.accounts.player2.mumbai.private_key}`
        : null,
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  contractSizer: {},
};

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default config;
