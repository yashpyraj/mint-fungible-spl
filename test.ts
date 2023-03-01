import {
  Account,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

const mintPublicKey = new PublicKey(
  "AmDvQf4U9ieSBc38X2mt56Mux6qc8BERr8tN84atXMxo"
);

console.log(mintPublicKey);
