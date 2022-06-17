import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { Contract } from "ethers";
import hre, { ethers } from "hardhat";

export async function setupUsers<
  T extends { [contractName: string]: Contract }
>(addresses: string[], contracts: T): Promise<({ address: string } & T)[]> {
  const users: ({ address: string } & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T
): Promise<{ address: string } & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address };
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }
  return user as { address: string } & T;
}

export const impersonateAccount = async (
  address: string
): Promise<SignerWithAddress> => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  await hre.network.provider.request({
    method: "hardhat_setCode",
    params: [address, "0x00"], // tranforming contract to EOA to be able to receive ETH
  });
  await hre.network.provider.request({
    method: "hardhat_setBalance",
    params: [
      address,
      ethers.utils.hexStripZeros(ethers.utils.parseEther("10").toHexString()),
    ],
  });

  return ethers.getSigner(address);
};
