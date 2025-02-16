import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Pair, Route } from "@uniswap/v2-sdk";
import { createPublicClient, http, parseAbi } from "viem";
import { goerli } from "viem/chains";
import { mainnet } from "wagmi";
import CONFIG from "~~/config";
import logger from "~~/services/logger.service";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`${goerli.rpcUrls.alchemy.http[0]}/${CONFIG.alchemyApiKey}`),
});

const ABI = parseAbi([
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
]);

export const fetchPriceFromUniswap = async (): Promise<number> => {
  const configuredNetwork = getTargetNetwork();
  if (
    configuredNetwork.stableCoin.symbol !== "ETH" &&
    configuredNetwork.stableCoin.symbol !== "SEP" &&
    !configuredNetwork.stableCoin
  ) {
    return 0;
  }
  try {
    const DAI = new Token(1, "0x6B175474E89094C44Da98b954EedeAC495271d0F", 18);
    const TOKEN = new Token(
      1,
      configuredNetwork.stableCoin.address || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      18,
    );
    const pairAddress = Pair.getAddress(TOKEN, DAI);

    const wagmiConfig = {
      address: pairAddress,
      abi: ABI,
    };

    const reserves = await publicClient.readContract({
      ...wagmiConfig,
      functionName: "getReserves",
    });

    const token0Address = await publicClient.readContract({
      ...wagmiConfig,
      functionName: "token0",
    });

    const token1Address = await publicClient.readContract({
      ...wagmiConfig,
      functionName: "token1",
    });
    const token0 = [TOKEN, DAI].find(token => token.address === token0Address) as Token;
    const token1 = [TOKEN, DAI].find(token => token.address === token1Address) as Token;
    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, reserves[0].toString()),
      CurrencyAmount.fromRawAmount(token1, reserves[1].toString()),
    );
    const route = new Route([pair], TOKEN, DAI);
    const price = parseFloat(route.midPrice.toSignificant(6));
    return price;
  } catch (error) {
    logger.error("useNativeCurrencyPrice - Error fetching ETH price from Uniswap: ", error);
    return 0;
  }
};
