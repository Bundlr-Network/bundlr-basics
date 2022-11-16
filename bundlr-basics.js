import Bundlr from "@bundlr-network/client";
import fs from "fs";

// Change this line to match the name of the wallet key file
// you downloaded from https://faucet.arweave.net/.
// Physically move your key file from the download directory to the
// project directory that holds this JS file.
const walletAddress = "arweave-key-aOTcToJZnW6wQQE6fKSFCta7etFX5Gy8KjJ_B-GsS14.json";

const jwk = JSON.parse(fs.readFileSync(walletAddress).toString());

// NOTE: Depending on the version of JavaScript you use, you may need to use
// the commented out line below to create a new Bundlr object.
// const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", jwk);
const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);

// Print your wallet address
console.log(`wallet address = ${bundlr.address}`);

// Check the price to upload 1MG of data
// The function accepts a number of bytes, so to check the price of
// 1MG, you'll need to check the price of 1,048,576 bytes.
const dataSizeToCheck = 1048576;
const price1MGAtomic = await bundlr.getPrice(dataSizeToCheck);
// To ensure accuracy when performing mathematical operations
// on fractional numbers in JavaScript, it is common to use atomic units.
// This is a way to represent a floating point (decimal) number using non-decimal notation.
// Once we have the value in atomic units, we can convert it into something easier to read.
const price1MGConverted = bundlr.utils.unitConverter(price1MGAtomic);
console.log(`Uploading 1MG to Bundlr costs $${price1MGConverted}`);

// Get loaded balance in atomic units
let atomicBalance = await bundlr.getLoadedBalance();
console.log(`node balance (atomic units) = ${atomicBalance}`);

// Convert balance to an easier to read format
let convertedBalance = bundlr.utils.unitConverter(atomicBalance);
console.log(`node balance (converted) = ${convertedBalance}`);

// If the balance funded (atomicBalance) is less than the cost
// to upload 1MG (price1MGAtomic), then go ahead and fund your wallet
// NOTE: Some chains are faster or slower than others. It can take
// upwards of 40 minutes for Arweave to process your funding. If you
// don't see your balance right away, don't stress. Grab a cup of tea
// maybe take a walk, and then check back.
if (atomicBalance < price1MGAtomic) {
	console.log("Funding wallet--->");
	// Fund the node, give it enough so you can upload a full MG
	try {
		// response = {
		// 	id, // the txID of the fund transfer
		// 	quantity, // how much is being transferred
		// 	reward, // the amount taken by the network as a fee
		// 	target, // the address the funds were sent to
		// };
		let response = await bundlr.fund(price1MGAtomic);
		console.log(`Funding successful txID=${response.id} amount funded=${response.quantity}`);
	} catch (e) {
		console.log("Error funding node ", e);
	}
}

// Check wallet balance (post fund)
// Get loaded balance in atomic units
atomicBalance = await bundlr.getLoadedBalance();
console.log(`AFTER FUNDING node balance (atomic units) = ${atomicBalance}`);

// Convert balance to an easier to read format
convertedBalance = bundlr.utils.unitConverter(atomicBalance);
console.log(`AFTER FUNDING node balance (converted) = ${convertedBalance}`);

// Upload data
// If it can be reduced to 1s and 0s, you can store it via Bundlr.
const dataToUpload = "Hello world ... where the llamas at?";
try {
	let response = await bundlr.upload(dataToUpload); // Returns an axios response
	console.log(`Data uploaded ==> https://arweave.net/${response.id}`);
} catch (e) {
	console.log("Error uploading file ", e);
}

// Upload a file
// Practice uploading with this lovely llama, or use any file you own.
// You've got 1MG of data paid for, so choose whatever you want.
// BUT ... REMEMBER ... You CAN'T DELETE THE FILE ONCE UPLOADED, SO BE CAREFUL! :)
const fileToUpload = "large_llama.png";
try {
	let response = await bundlr.uploadFile("./" + fileToUpload); // Returns an axios response
	console.log(`File uploaded ==> https://arweave.net/${response.id}`);
} catch (e) {
	console.log("Error uploading file ", e);
}

// Upload an entire folder
// More llamas for you to upload ... or change to your own files
// Upload some NFTs, your vacation photos or your band's latest album.
const folderToUpload = "llama_folder";
try {
	let response = await bundlr.uploadFolder("./" + folderToUpload, {
		indexFile: "", // optional index file (file the user will load when accessing the manifest)
		batchSize: 50, //number of items to upload at once
		keepDeleted: false, // whether to keep now deleted items from previous uploads
	}); //returns the manifest ID

	console.log(`Files uploaded ==> https://arweave.net/${response.id}`);
} catch (e) {
	console.log("Error uploading file ", e);
}
