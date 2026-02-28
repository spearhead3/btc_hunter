import * as bitcoin from 'bitcoinjs-lib';
import * as ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
import crypto from 'crypto';

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

import { writeData } from './firebase.js';
import { bruteForce } from './bruteforce.js';
import { generatePrivateKeyForBruteForce } from './wallet.js';

let privateKeyBytes = generatePrivateKeyForBruteForce();
bruteForce(privateKeyBytes, (result) => {
    console.log(`${new Date().toISOString()} Found Wallet Info:`, result);
    writeData(result);
});