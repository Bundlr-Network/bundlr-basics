import Bundlr from "@bundlr-network/client";
import fs from "fs";

/**************************************** SETUP *********************************************/
// Change the following code line to match the name of the wallet key file
// you downloaded from https://faucet.arweave.net/.
// Physically move your key file from the download directory to the
// project directory that holds this JS file.
// You can also use any private key from a supported wallet.
const privateKey = "";

const jwk = JSON.parse(fs.readFileSync(privateKey).toString());

// NOTE: Depending on the version of JavaScript / TypeScript you use, you may need to use
// the commented out line below to create a new Bundlr object.
// const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", jwk);
const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);

// To connect to our devnet, use any of these instead
// const bundlr = new Bundlr.default("https://devnet.bundlr.network", "solana", "<solana private key>", {
//    providerUrl: "https://api.devnet.solana.com"
// });
// const bundlr = new Bundlr.default("https://devnet.bundlr.network", "matic", "<ethereum private key>", {
//    providerUrl: "https://rpc-mumbai.matic.today"
// });
// const bundlr = new Bundlr.default("https://devnet.bundlr.network", "ethereum", "<ethereum private key>", {
//    providerUrl: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
// });

// Print your wallet address
console.log(`wallet address = ${bundlr.address}`);

/**************************** CHECK UPLOAD PRICE *********************************************/
// Check the price to upload 1MB of data
// The function accepts a number of bytes, so to check the price of
// 1MB, check the price of 1,048,576 bytes.
const dataSizeToCheck = 1048576;
const price1MBAtomic = await bundlr.getPrice(dataSizeToCheck);
// To ensure accuracy when performing mathematical operations
// on fractional numbers in JavaScript, it is common to use atomic units.
// This is a way to represent a floating point (decimal) number using non-decimal notation.
// Once we have the value in atomic units, we can convert it into something easier to read.
const price1MBConverted = bundlr.utils.unitConverter(price1MBAtomic);
console.log(`Uploading 1MB to Bundlr costs $${price1MBAtomic}`);

/********************************** CHECK LOADED BALANCE ****************************************/
// Get loaded balance in atomic units
let atomicBalance = await bundlr.getLoadedBalance();
console.log(`Node balance (atomic units) = ${atomicBalance}`);

// Convert balance to an easier to read format
let convertedBalance = bundlr.utils.unitConverter(atomicBalance);
console.log(`Node balance (converted) = ${convertedBalance}`);

/********************************** LAZY FUNDING A NODE ******************************************/
// If the balance funded (atomicBalance) is less than the cost
// to upload 1MB (price1MBAtomic), then go ahead and fund your wallet
// NOTE: Some chains are faster or slower than others. It can take
// upwards of 40 minutes for Arweave to process your funding. If you
// don't see your balance right away, don't stress. Grab a cup of tea
// maybe take a walk, and then check back.
if (atomicBalance < price1MBAtomic) {
	console.log("Funding wallet--->");
	// Fund the node, give it enough so you can upload a full MB
	try {
		// response = {
		// 	id, // the txID of the fund transfer
		// 	quantity, // how much is being transferred
		// 	reward, // the amount taken by the network as a fee
		// 	target, // the address the funds were sent to
		// };
		let response = await bundlr.fund(price1MBAtomic);
		console.log(`Funding successful txID=${response.id} amount funded=${response.quantity}`);
	} catch (e) {
		console.log("Error funding node ", e);
	}
}

/********************************** WITHDRAWING FUNDS FROM A NODE ****************************************/
try {
	// 400 - something went wrong
	// response.data  = "Not enough balance for requested withdrawal"

	// 200 - Ok
	// response.data = {
	//     requested, // the requested amount,
	//     fee,       // the reward required by the network (network fee)
	//     final,     // total cost to your account (requested + fee)
	//     tx_id,     // the ID of the withdrawal transaction
	// }
	// 1. Get current balance
	let curBalance = await bundlr.getLoadedBalance();
	// 2. Withdraw all
	let response = await bundlr.withdrawBalance(curBalance);

	console.log(`Funds withdrawn txID=${response.data.tx_id} amount requested=${response.data.requested}`);
} catch (e) {
	console.log("Error funding node ", e);
}

/********************************** UPLOAD DATA ****************************************/
// If it can be reduced to 1s and 0s, you can store it via Bundlr.
const dataToUpload = "Hello world ... where the llamas at?";
try {
	let response = await bundlr.upload(dataToUpload); // Returns an axios response
	console.log(`Data uploaded ==> https://arweave.net/${response.id}`);
} catch (e) {
	console.log("Error uploading file ", e);
}

/********************************** UPLOAD A FILE ****************************************/
// Practice uploading with this lovely llama, or use any file you own.
// You've got 1MB of data paid for, so choose whatever you want.
// BUT ... REMEMBER ... You CAN'T DELETE THE FILE ONCE UPLOADED, SO BE CAREFUL! :)
const fileToUpload = "large_llama.png";
try {
	let response = await bundlr.uploadFile("./" + fileToUpload); // Returns an axios response
	console.log(`File uploaded ==> https://arweave.net/${response.id}`);
} catch (e) {
	console.log("Error uploading file ", e);
}

/********************************** UPLOAD A FOLDER ****************************************/
// More llamas for you to upload ... or change to your own files
// Upload some NFTs, your vacation photos or your band's latest album.
const folderToUpload = "llama_folder";
try {
	let response = await bundlr.uploadFolder("./" + folderToUpload, {
		indexFile: "", // optional index file (file the user will load when accessing the manifest)
		batchSize: 50, //number of items to upload at once
		keepDeleted: false, // whether to keep now deleted items from previous uploads
	}); //returns the manifest ID

	console.log(`Files uploaded ==> Manifest Id = ${response.id}`);
} catch (e) {
	console.log("Error uploading file ", e);
}
