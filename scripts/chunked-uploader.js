// cSpell:words Bundlr WebBundlr
/**
 * The chunking uploader is a fault tolerant, resumable, stream based signer/uploader.
 * It allows you to pause / resume uploads, and to do things like
 * create progress bars to show upload progress.
 *
 * The chunking uploader is supported both with Bundlr / NodeJS on the server
 * and with WebBundlr in the browser. This code shows how to use it with
 * the standard Bundlr / NodeJS combination.
 *
 * For an example of how to use it in the browser, please see
 * https://staging.docs.bundlr.network/docs/tutorials/WebBundlr-ProgressBars
 *
 * Key Terminology
 * Batch size - the maximum number of chunks to upload at once. Defaults to 5.
 * Chunk size - the maximum size of a single chunk. Defaults to 25MB.
 *              For those with slower/unstable connections, reducing both should
 *              lead to improved reliability. \ For those with faster connections,
 *              increasing both will lead to higher throughput,
 *              at the cost of more memory (and CPU).
 */
import Bundlr from "@bundlr-network/client";
import fs from "fs";

/**************************************** SETUP *********************************************/
const connectToUploader = async () => {
	// Change the following line to match the name of the wallet key file
	const privateKey = "arweave-key-aOTcToJZnW6wQQE6fKSFCta7etFX5Gy8KjJ_B-GsS14.json";

	const jwk = JSON.parse(fs.readFileSync(privateKey).toString());

	// First create a Bundlr object
	// NOTE: Depending on the version of JavaScript / TypeScript you use, you may need to use
	// the commented out line below to create a new Bundlr object.
	// const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", jwk);
	const bundlr = new Bundlr.default("http://node1.bundlr.network", "arweave", jwk);

	// Now get a reference to the chunked uploader
	// If you're doing more than one upload, you will need to refresh this
	// object reference for each upload.
	const uploader = bundlr.uploader.chunkedUploader;

	// Optionally change the batch size (default is 5)
	uploader.setBatchSize(10);

	// Optionally change the chunk size, value is set in bytes (default is 25MB)
	uploader.setChunkSize(2000000);
	return [bundlr, uploader];
};

/******************************** DATA MODE *********************************************/
/**
 * The uploader has two modes of operation, data mode and transaction mode.
 * When using data mode, do not create a transaction, this will be done
 * automatically for you.
 */
const uploadDataMode = async (uploader) => {
	const transactionOptions = { tags: [{ name: "Content-Type", value: "text/plain" }] };
	// Within data mode you have two options:
	// 1. Using a Buffer containing just the data you want to upload.
	const dataBuffer = Buffer.from("Hello, world!");
	const response1 = await uploader.uploadData(dataBuffer, transactionOptions);
	// The transaction id (used to query the network) is found in response.data.id
	console.log(`Data buffer uploaded ==> https://arweave.net/${response1.data.id}`);

	// 2. Using a Readable (stream) pointing to the data
	uploader = bundlr.uploader.chunkedUploader; // recreate for each transaction
	const dataStream = fs.createReadStream("../assets/data.txt");
	const response2 = await uploader.uploadData(dataStream, transactionOptions);
	console.log(`Read Stream uploaded ==> https://arweave.net/${response2.data.id}`);
};

/******************************** TRANSACTION MODE *****************************************/
/** Transaction mode is used if you've created the transaction you want to upload yourself.
 * This allows you to create and store somewhere and upload at a later time.
 */
const uploadTransactionMode = async (uploader) => {
	uploader = bundlr.uploader.chunkedUploader; // recreate for each transaction
	const transaction = bundlr.createTransaction("Hello, world!");
	await transaction.sign();
	const response = await uploader.uploadTransaction(transaction);
	console.log(`Transaction mode uploaded ==> https://arweave.net/${response.data.id}`);
};

/***************************** CONTROLLING THE UPLOAD **************************************/
/**
 * When uploading smaller files, it's common to use they await keyword before
 * uploadData() or uploadTransaction(). This causes execution to pause until the file
 * is fully uploaded. If you omit await, the upload happens in the background
 * and you can use pause and resume as needed.
 * The uploader is able to be paused and resumed, even by a new uploader instance.
 * To resume an upload from a new uploader instance, you must:
 * 		- Use the same currency
 * 		- Use the same Bundlr node
 * 		- Use the same input data
 * 		- Use the same configured chunk size
 */
const pauseResumeUpload = async (bundlr, uploader) => {
	const transaction = bundlr.createTransaction("Hello, world!");
	uploader = bundlr.uploader.chunkedUploader; // recreate for each transaction
	const upload = uploader.uploadTransaction(transaction);
	uploader.pause(); // pauses the upload
	console.log("Upload paused");
	uploader.resume(); // resumes the upload
	console.log("Upload resumed");

	// You can call await at ANY TIME to ensure the upload has completed
	const response = await upload;
	console.log(`Pause / Resume mode uploaded ==> https://arweave.net/${response.data.id}`);

	// Paused uploads will expire after a period of inactivity.
	// If you do need to recover an expired upload, use the following functions
	const resumeData = uploader.getResumeData(); // get the data required to resume the upload with a new instance
	console.log("resumeData=", resumeData);
	uploader.setResumeData(resumeData); // set resume data
	await uploader.uploadTransaction(dataItem); // upload as normal
};

/*********************************** UPLOAD EVENTS **************************************/
/**
 * The uploader emits 3 events during each upload.
 * These can be subscribed to for any use case when tracking upload progress is needed.
 * 1. chunkUpload: Emitted whenever a chunk is uploaded.
 * 2. chunkError:  Emitted whenever a chunk upload fails.
 *                 Due to internal retry logic, these errors can most likely be ignored
 *                 as long as the upload doesn't error overall.
 * 3. done:        Emitted when the upload completes.
 */
const registerEventListeners = async (uploader) => {
	uploader.on("chunkUpload", (chunkInfo) => {
		console.log(
			`Uploaded Chunk number ${chunkInfo.id}, offset o f ${chunkInfo.offset}, size ${chunkInfo.size} Bytes, with a total of ${chunkInfo.totalUploaded} bytes uploaded.`,
		);
	});

	uploader.on("chunkError", (e) => {
		console.error(`Error uploading chunk number ${e.id} - ${e.res.statusText}`);
	});

	uploader.on("done", (finishRes) => {
		console.log(`Upload completed with ID ${finishRes.id}`);
	});
	console.log("Registered event listeners");
};

// This function must always be called
const setup = await connectToUploader();
const bundlr = setup[0];
const uploader = setup[1];

// These functions can be selectively commented out depending on the features you need to test
await uploadDataMode(uploader);
await uploadTransactionMode(uploader);
await pauseResumeUpload(bundlr, uploader);
await registerEventListeners(uploader);
