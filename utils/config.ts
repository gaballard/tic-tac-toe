import { config as dotenvConfig } from "dotenv";
dotenvConfig();

export type TNetworkName = string;
export type TAddress = string;
export type TPrivateKey = string;

export interface IConfig {
  hardhat: {
    chainId: number;
    forking: {
      url: string;
      blockNumber?: number;
    };
    mining?: {
      auto?: boolean;
    };
    allowUnlimitedContractSize?: boolean;
    saveDeployments?: boolean;
  };
  currentFork: TNetworkName;
  accounts: {
    [accountName: string]: {
      [networkName: string]: {
        address: TAddress;
        private_key: TPrivateKey;
      };
    };
  };
  providerUrls: {
    [networkName: string]: string;
  };
}

const config: IConfig = {
  hardhat: {
    chainId: Number(process.env.HARDHAT_FORKING_CHAINID) || 31337,
    forking: {
      url: process.env.HARDHAT_FORKING_URL || "",
      blockNumber:
        Number(process.env.HARDHAT_FORKING_BLOCK_NUMBER) || undefined,
    },
    mining: {
      auto: process.env.HARDHAT_MINING === "true" || true,
    },
    allowUnlimitedContractSize:
      process.env.HARDHAT_ALLOW_UNLIMITED_CONTRACT_SIZE === "true" || true,
    saveDeployments: process.env.HARDHAT_SAVE_DEPLOYMENTS === "true" || true,
  },
  currentFork: process.env.CURRENT_FORK || "mumbai",
  accounts: {
    deployer: {
      mumbai: {
        address: process.env.MUMBAI_DEPLOYER_ADDRESS || "",
        private_key: process.env.MUMBAI_DEPLOYER_PRIVATE_KEY || "",
      },
    },
    player1: {
      mumbai: {
        address: process.env.MUMBAI_PLAYER_ONE_ADDRESS || "",
        private_key: process.env.MUMBAI_PLAYER_ONE_PRIVATE_KEY || "",
      },
    },
    player2: {
      mumbai: {
        address: process.env.MUMBAI_PLAYER_TWO_ADDRESS || "",
        private_key: process.env.MUMBAI_PLAYER_TWO_PRIVATE_KEY || "",
      },
    },
  },
  providerUrls: {
    mumbai: process.env.MUMBAI_PROVIDER_URL || "",
  },
};

export default config;
