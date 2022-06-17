import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const { address: multiplayerAddress }: DeployResult = await deploy(
    "Multiplayer",
    {
      from: deployer,
      log: true,
      autoMine: true,
    }
  );

  await deploy("GameBase", {
    from: deployer,
    log: true,
    autoMine: true,
    libraries: {
      Multiplayer: multiplayerAddress,
    },
  });
};
export default func;

// reference these tags via HardHat's `fixture` method
func.tags = ["gameBase"];
