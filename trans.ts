import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import secret from "../../../.config/solana/id.json";

const endpoint = "https://api.devnet.solana.com"; //Replace with your RPC Endpoint
const connection = new Connection(endpoint);
const mintPublicKey = new PublicKey(
  "AmDvQf4U9ieSBc38X2mt56Mux6qc8BERr8tN84atXMxo"
);

const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secret));
const MINT_ADDRESS = "AmDvQf4U9ieSBc38X2mt56Mux6qc8BERr8tN84atXMxo"; //You must change this value!
const TRANSFER_AMOUNT = 50;
console.log(`My public key is: ${FROM_KEYPAIR.publicKey.toString()}.`);

async function getNumberDecimals(mintAddress: string): Promise<number> {
  const info = await connection.getParsedAccountInfo(
    new PublicKey(MINT_ADDRESS)
  );
  const result = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  return result;
}
async function sendTokens(destination) {
  console.log(
    `Sending ${TRANSFER_AMOUNT} ${MINT_ADDRESS} from ${FROM_KEYPAIR.publicKey.toString()} to ${destination.publicKey.toString()}.`
  );
  //Step 1
  console.log(`1 - Getting Source Token Account`);
  let sourceAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    FROM_KEYPAIR,
    new PublicKey(MINT_ADDRESS),
    FROM_KEYPAIR.publicKey
  );
  console.log(`    Source Account: ${sourceAccount.address.toString()}`);

  //Step 2
  console.log(`2 - Getting Destination Token Account`);
  let destinationAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    FROM_KEYPAIR,
    new PublicKey(MINT_ADDRESS),
    destination.publicKey
  );
  console.log(
    `    Destination Account: ${destinationAccount.address.toString()}`
  );
  //Step 3
  console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
  const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
  console.log(`    Number of Decimals: ${numberDecimals}`);
  console.log(`4 - Creating and Sending Transaction`);
  const tx = new Transaction();
  tx.add(
    createTransferInstruction(
      sourceAccount.address,
      destinationAccount.address,
      FROM_KEYPAIR.publicKey,
      TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
    )
  );
  const latestBlockHash = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = await latestBlockHash.blockhash;
  const signature = await sendAndConfirmTransaction(connection, tx, [
    FROM_KEYPAIR,
  ]);
  console.log(
    "\x1b[32m", //Green Text
    `   Transaction Success!🎉`,
    `\n    https://explorer.solana.com/tx/${signature}?cluster=devnet`
  );
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

async function main() {
  for (let i = 0; i < 300; i++) {
    const DESTINATION_WALLET = Keypair.generate();

    try {
      await sendTokens(DESTINATION_WALLET);
    } catch (err) {
      console.log(err);
      continue;
    }
  }
}

main();
