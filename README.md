# Bundler Basics

Code repository to accompany [Bundlr SDK docs](https://staging.docs.bundlr.network/docs/overview) and this [tutorial on using Bundlr with NodeJS.](https://staging.docs.bundlr.network/docs/tutorials/bundlr-nodejs).

## Installation

1. Clone the repository
2. Run `npm install` from the project directory

## Scripts

`scripts/bundlr-basics.js`
A NodeJS script showing how to how to do the following using the `Bundlr` class:

-   Connecting to a node
-   Checking price to upload 1MB data
-   Checking loaded balance on a node
-   Funding a node
-   Withdrawing excess funds from a node
-   Uploading data
-   Uploading a file
-   Uploading a folder

`scripts/chunked-uploader.js`
A NodeJS script showing how to use our [Chunked Uploader](https://staging.docs.bundlr.network/docs/category/chunked-uploder) to do the following:

-   Obtaining a reference to the chunked uploader
-   Setting batch size
-   Setting chunk size
-   Uploading in data mode
-   Uploading in transaction mode
-   Pausing the upload
-   Resuming a paused upload
-   Registering event callbacks

## Assets

The scripts are designed to pull images and data from the assets folder when running. Sample assets are provided to make testing easier, feel free to change to anything you want.

## Usage

The scripts are designed to run from beginning to end, executing the featured listed above in sequence. When testing, you're welcome to comment out features you don't need for your application.

Running `bundlr-basics.js`

```console
cd scripts
node bundlr-basics.js
```

Running `chunked-uploader.js`

```console
cd scripts
node chunked-uploader.js
```
