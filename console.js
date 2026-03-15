import { writeData } from './core/firebase.js';
import { bruteForce } from './core/bruteforce.js';
import { generatePrivateKeyForBruteForce } from './core/wallet.js';

let privateKeyBytes = generatePrivateKeyForBruteForce();
bruteForce(privateKeyBytes, (result) => {
    logger.log(`${new Date().toISOString()} Found Wallet Info:`, result);
    writeData(result);
}, console);