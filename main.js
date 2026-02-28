import { writeData } from './firebase.js';
import { bruteForce } from './bruteforce.js';
import { generatePrivateKeyForBruteForce } from './wallet.js';

let privateKeyBytes = generatePrivateKeyForBruteForce();
bruteForce(privateKeyBytes, (result) => {
    console.log(`${new Date().toISOString()} Found Wallet Info:`, result);
    writeData(result);
});