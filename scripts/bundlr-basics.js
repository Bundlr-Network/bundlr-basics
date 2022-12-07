import Bundlr from "@bundlr-network/client";
import fs from "fs";

/**************************************** SETUP *********************************************/
/**
 * Connects to Bundlr node using the private key specified
 * @returns A reference to an Bundlr node.
 */
const connectToNode = async () => {
	// Change the following code line to match the name of the private key file
	// you downloaded from https://faucet.arweave.net/.
	// Physically move your key file from the download directory to the
	// project directory that holds this JS file.
	// You can also use any private key from a supported wallet.
	const privateKey = "";
	const jwk = JSON.parse(fs.readFileSync(privateKey).toString());

	// Use the following line for TypeScript
	// const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", jwk);
	// Use the following line for JavaScript
	const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);

	// To connect to our devnet, use either of these instead
	// const bundlr = new Bundlr.default("https://devnet.bundlr.network", "solana", "<solana private key>", {
	//    providerUrl: "https://api.devnet.solana.com"
	// });
	// const bundlr = new Bundlr.default("https://devnet.bundlr.network", "matic", "<ethereum private key>", {
	//    providerUrl: "https://rpc-mumbai.matic.today"
	// });

	// Print your wallet address
	console.log(`wallet address = ${bundlr.address}`);
	return bundlr;
};

/**************************** FUND NODE *********************************************/
/**
 * Checks the price to upload 1MB data, then funds a node with sufficient funds.
 */
const fundNode = async (bundlr) => {
	// const privateKey = "arweave-key-aOTcToJZnW6wQQE6fKSFCta7etFX5Gy8KjJ_B-GsS14.json";
	// const jwk = JSON.parse(fs.readFileSync(privateKey).toString());
	// const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);

	console.log(bundlr);
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
	const atomicBalance = await bundlr.getLoadedBalance();
	console.log(`Node balance (atomic units) = ${atomicBalance}`);

	// Convert balance to an easier to read format
	const convertedBalance = bundlr.utils.unitConverter(atomicBalance);
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
			const response = await bundlr.fund(price1MBAtomic);
			console.log(`Funding successful txID=${response.id} amount funded=${response.quantity}`);
		} catch (e) {
			console.log("Error funding node ", e);
		}
	}
};

/********************************** WITHDRAWING FUNDS FROM A NODE ****************************************/
/**
 * Excess funds sent to a node can be withdrawn at any time.
 */
const withdrawFromNode = async (bundlr) => {
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
		const curBalance = await bundlr.getLoadedBalance();
		// 2. Withdraw all
		const response = await bundlr.withdrawBalance(curBalance);

		console.log(
			`Funds withdrawn txID=${response.data.tx_id} amount requested=${response.data.requested}`,
		);
	} catch (e) {
		console.log("Error wiithdrawing funds ", e);
	}
};

/********************************** UPLOAD DATA ****************************************/
/**
 * Upload any arbitrary data to Bundlr
 */
const uploadData = async (bundlr) => {
	// If it can be reduced to 1s and 0s, you can store it via Bundlr.
	const dataToUpload = "Hello world ... where the llamas at?";
	try {
		const response = await bundlr.upload(dataToUpload); // Returns an axios response
		console.log(`Data uploaded ==> https://arweave.net/${response.id}`);
	} catch (e) {
		console.log("Error uploading file ", e);
	}
};

/********************************** UPLOAD A FILE ****************************************/
/**
 * Practice uploading with this lovely llama, or use any file you own.
 * You've got 1MB of data paid for, so choose whatever you want.
 * BUT ... REMEMBER ... You CAN'T DELETE THE FILE ONCE UPLOADED, SO BE CAREFUL! :)
 */
const uploadFile = async (bundlr) => {
	const fileToUpload = "large_llama.png";
	try {
		const response = await bundlr.uploadFile("../assets/" + fileToUpload); // Returns an axios response
		console.log(`File uploaded ==> https://arweave.net/${response.id}`);
	} catch (e) {
		console.log("Error uploading file ", e);
	}
};

/********************************** UPLOAD A FOLDER ****************************************/
/**
 * More llamas for you to upload ... or change to your own files
 * Upload some NFTs, your vacation photos or your band's latest album.
 */
const uploadFolder = async (bundlr) => {
	const folderToUpload = "llama_folder";
	try {
		const response = await bundlr.uploadFolder("../assets/" + folderToUpload, {
			indexFile: "", // optional index file (file the user will load when accessing the manifest)
			batchSize: 50, //number of items to upload at once
			keepDeleted: false, // whether to keep now deleted items from previous uploads
		}); //returns the manifest ID

		console.log(`Files uploaded ==> Manifest Id = ${response.id}`);
	} catch (e) {
		console.log("Error uploading file ", e);
	}
};

// This function must always be called
const bundlr = await connectToNode();

// These functions can be selectively commented out depending on the features you need to test
await fundNode(bundlr);
await uploadData(bundlr);
await uploadFile(bundlr);
await uploadFolder(bundlr);
