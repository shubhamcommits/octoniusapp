import { MSAuthProvider } from "../api/service/msAuth.service";

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const graph = require('@microsoft/microsoft-graph-client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const OAUTH_SCOPES = 'user.read,mail.read,Files.ReadWrite.All';
const SUBSCRIPTION_CLIENT_STATE = '';

const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
});

const msAuthProvider = new MSAuthProvider();

/**
 * Gets a Graph client configured to use delegated auth
 * @param  {IConfidentialClientApplication} msalClient - The MSAL client used to retrieve user tokens
 * @param  {string} userAccountId - The user's account ID
 */
function getGraphClientForUser(msalClient, userAccountId) {

	if (!msalClient || !userAccountId) {
		throw new Error(`Invalid MSAL state. Client: ${msalClient ? 'present' : 'missing'}, User Account ID: ${userAccountId ? 'present' : 'missing'}`);
	}

	// Initialize Graph client
	return graph.Client.init({
		// Implement an auth provider that gets a token
		// from the app's MSAL instance
		authProvider: async (done) => {
			try {
				// Get the user's account
				const account = await msalClient
					.getTokenCache()
					.getAccountByHomeId(userAccountId);

				if (account) {
					// Prepare the callback url
					let callBackUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.CLIENT_PORT}/dashboard/user/clouds`

					// Check if the env is production
					if(process.env.NODE_ENV == 'production') {
						callBackUrl = `${process.env.PROTOCOL}://${process.env.HOST}/dashboard/user/clouds`
					}
					// Attempt to get the token silently
					// This method uses the token cache and
					// refreshes expired tokens as needed
					const response = await msalClient.acquireTokenSilent({
						scopes: OAUTH_SCOPES.split(','),
						// redirectUri: process.env.OAUTH_REDIRECT_URI,
						redirectUri: callBackUrl,
						account: account,
					});

					// First param to callback is the error,
					// Set to null in success case
					done(null, response.accessToken);
				}
			} catch (err) {
				console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
				done(err, null);
			}
		}
	});
}

/**
 * Gets a Graph client configured to use app-only auth
 * @param  {IConfidentialClientApplication} msalClient - The MSAL client used to retrieve app-only tokens
 */
function getGraphClientForApp(msalClient) {
	if (!msalClient) {
		throw new Error('Invalid MSAL state. MSAL client is missing.');
	}

	// Initialize Graph client
	return graph.Client.init({
		// Implement an auth provider that gets a token
		// from the app's MSAL instance
		authProvider: async (done) => {
			try {
			// Get a token using client credentials
			const response = await msalClient.acquireTokenByClientCredential({
				scopes: ['https://graph.microsoft.com/.default'],
			});

			// First param to callback is the error,
			// Set to null in success case
			done(null, response.accessToken);
			} catch (err) {
			console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
			done(err, null);
			}
		},
	});
}

/**
 * Processes an encrypted notification
 * @param  {object} notification - The notification containing encrypted content
 */
function processEncryptedNotification(notification) {
	// Decrypt the symmetric key sent by Microsoft Graph
	const symmetricKey = decryptSymmetricKey(
		notification.encryptedContent.dataKey,
		process.env.PRIVATE_KEY_PATH,
	);

	// Validate the signature on the encrypted content
	const isSignatureValid = verifySignature(
		notification.encryptedContent.dataSignature,
		notification.encryptedContent.data,
		symmetricKey,
	);

	if (isSignatureValid) {
		// Decrypt the payload
		const decryptedPayload = decryptPayload(
			notification.encryptedContent.data,
			symmetricKey,
		);
console.log(decryptedPayload);
	}
}

/**
 * Process a non-encrypted notification
 * @param  {object} notification - The notification to process
 * @param  {IConfidentialClientApplication} msalClient - The MSAL client to retrieve tokens for Graph requests
 * @param  {string} userAccountId - The user's account ID
 */
async function processNotification(notification, msalClient, userAccountId) {
	// Get the message ID
	const messageId = notification.resourceData.id;

	const client = graph.getGraphClientForUser(msalClient, userAccountId);

	try {
		// Get the message from Graph
		const message = await client
			.api(`/me/messages/${messageId}`)
			.select('subject,id')
			.get();
console.log(message);
	} catch (err) {
		console.log(`Error getting message with ${messageId}:`);
		console.error(err);
	}
}

/**
 * Decrypts the encrypted symmetric key sent by Microsoft Graph
 * @param  {string} encodedKey - A base64 string containing an encrypted symmetric key
 * @param  {string} keyPath - The relative path to the private key file to decrypt with
 * @returns {Buffer} The decrypted symmetric key
 */
function decryptSymmetricKey(encodedKey, keyPath) {
	const asymmetricKey = getPrivateKey(keyPath);
	const encryptedKey = Buffer.from(encodedKey, 'base64');
	const decryptedSymmetricKey = crypto.privateDecrypt(
		asymmetricKey,
		encryptedKey,
	);
	return decryptedSymmetricKey;
}

/**
 * Decrypts the payload data using the one-time use symmetric key
 * @param  {string} encryptedPayload - The base64-encoded encrypted payload
 * @param  {Buffer} symmetricKey - The one-time use symmetric key sent by Microsoft Graph
 * @returns {string} - The decrypted payload
 */
function decryptPayload(encryptedPayload, symmetricKey) {
	// Copy the initialization vector from the symmetric key
	const iv = Buffer.alloc(16, 0);
	symmetricKey.copy(iv, 0, 0, 16);

	// Create a decipher object
	const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, iv);

	// Decrypt the payload
	let decryptedPayload = decipher.update(encryptedPayload, 'base64', 'utf8');
	decryptedPayload += decipher.final('utf8');
	return decryptedPayload;
}

/**
 * Process a non-encrypted notification
 * @param  {object} subscription - The subscription to renew
 * @param  {IConfidentialClientApplication} msalClient - The MSAL client to retrieve tokens for Graph requests
 */
async function renewSubscription(subscription, msalClient) {
	// Get the Graph client
	const client = (subscription.userAccountId === 'APP-ONLY')
		? graph.getGraphClientForApp(msalClient)
		: graph.getGraphClientForUser(msalClient, subscription.userAccountId);

	try {
		// Update the expiration on the subscription
		await client.api(`/subscriptions/${subscription.subscriptionId}`).update({
			expirationDateTime: new Date(Date.now() + 3600000).toISOString(),
		});
		console.log(`Renewed subscription ${subscription.subscriptionId}`);
	} catch (err) {
		console.log(`Error updating subscription ${subscription.subscriptionId}:`);
		console.error(err);
	}
}

function isTokenValid(token, appId, tenantId) {
	return new Promise((resolve) => {
		const options = {
			audience: [appId],
			issuer: [`https://sts.windows.net/${tenantId}/`],
		};

		jwt.verify(token, getKey, options, (err) => {
			if (err) {
			console.log(`Token validation error: ${err.message}`);
			resolve(false);
			}
			resolve(true);
		});
	});
}

async function getKey(header, callback) {
  try {
    const key = await client.getSigningKey(header.kid);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  } catch (err) {
    callback(err, null);
  }
}

/**
 * @param  {string} encodedSignature - The base64-encoded signature
 * @param  {string} signedPayload - The base64-encoded signed payload
 * @param  {Buffer} symmetricKey - The one-time use symmetric key
 * @returns {boolean} - True if signature is valid, false if invalid
 */
function verifySignature(encodedSignature, signedPayload, symmetricKey) {
	const hmac = crypto.createHmac('sha256', symmetricKey);
	hmac.write(signedPayload, 'base64');
	return encodedSignature === hmac.digest('base64');
}

/**
 * @param  {string} keyPath - The relative path to the file containing the private key
 * @returns {string} Contents of the private key file
 */
function getPrivateKey(keyPath) {
  const key = fs.readFileSync(path.join(__dirname, keyPath), 'utf8');
  return key;
}

export { OAUTH_SCOPES, SUBSCRIPTION_CLIENT_STATE, getGraphClientForUser, getGraphClientForApp, verifySignature, processEncryptedNotification , processNotification, isTokenValid, renewSubscription }