import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "../idl/crowdfunding.json";
import type { Crowdfunding } from "../idl/crowdfunding";

// devnet "2YwZqidKUCJvQxpcuyqii4eT9hsPJcUbjZUZZVXukHVU"

export function useAnchorProgram() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  return useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    // Create an Anchor-compatible wallet
    const wallet = {
      publicKey,
      signTransaction,
      signAllTransactions,
    };

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    return new Program<Crowdfunding>(idl, provider);
  }, [connection, publicKey, signTransaction, signAllTransactions]);
}
