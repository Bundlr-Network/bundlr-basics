/**
 * Example code showing how to use uploadFolder to upload a SPA to Arweave using Bundlr.
 */
import Bundlr from "@bundlr-network/client";
import fs from "fs";

/**
 * Connects to Bundlr node using the private key specified
 * @returns A reference to an Bundlr node.
 */
const connectToNode = async () => {
	// Change the following code line to match the name your private key
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

/**
 * By using bundlr.uploadFolder() with the indexFile parameter pointing to index.html file of your
 * website, you can upload entire static websites to the permaweb.
 *
 * In `assets/example_spa` there is a small example website featuring and index.html file,
 * a styles.css file and 5 images. The website structure was designed to mimic most common
 * Single Page Application (SPA) Websites. The index file loads the css file, displays
 * some text and some images.
 *
 * Due to the way URLs are generated when using uploadFolder, all referenced css and image
 * files will continue to work as part of the website once uploaded.
 *
 */
const uploadSPA = async (bundlr) => {
	try {
		// Call upload folder.
		// You MUST pass the name of your main index file as the indexFile parameter
		const response = await bundlr.uploadFolder("../assets/example_spa/", {
			indexFile: "index.html",
		});

		// This URL will now load your entire website from the permaweb
		console.log(`SPA Uploaded https://arweave.net/${response.id}`);
	} catch (e) {
		console.log("Error uploading file ", e);
	}
};

const bundlr = await connectToNode();
await uploadSPA(bundlr);
