import { ethers } from "ethers";
import LockJson from "./contracts/Lock.json";

const LOCK_ADDRESS = import.meta.env.VITE_LOCK_ADDRESS;
const RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";
const ABI = LockJson.abi;

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  return provider;
}

export function getRpcProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export async function getContract(signerOrProvider) {
  if (!LOCK_ADDRESS) {
    throw new Error("Contract address not configured. Please set VITE_LOCK_ADDRESS in frontend/.env");
  }
  if (!ethers.isAddress(LOCK_ADDRESS)) {
    throw new Error(`Invalid contract address: ${LOCK_ADDRESS}`);
  }
  // Verify there is contract code at the address using a reliable JSON-RPC provider
  try {
    const rpc = getRpcProvider();
    const code = await rpc.getCode(LOCK_ADDRESS);
    if (!code || code === "0x") {
      throw new Error(`No contract code found at address ${LOCK_ADDRESS}`);
    }
  } catch (err) {
    // Re-throw with a concise message for the UI
    throw new Error(err.message || "Failed to validate contract code");
  }

  return new ethers.Contract(LOCK_ADDRESS, ABI, signerOrProvider);
}
