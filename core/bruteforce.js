import { generatePrivateKeyForBruteForce, generatePrivateKeyTextFromBytes, importWalletAndCheckBalance } from './wallet.js';
import { incrementByteArray } from './utils.js';
import dotenv from 'dotenv'

dotenv.config();
const sniperName = process.env.SNIPER_NAME;

export function bruteForce(privateKeyBytes, onSuccess, logger = console) {
  const privateKeyWIF = generatePrivateKeyTextFromBytes(privateKeyBytes);

  importWalletAndCheckBalance(privateKeyWIF).then(result => {
    logger.log(`${new Date().toISOString()} Generated Private Key By: ${sniperName}, Key: ${Buffer.from(privateKeyBytes).toString('hex')}`);
    logger.log(`${new Date().toISOString()} Generated Address: ${result.address}, Tx Count: ${result.chain_stats.tx_count + result.mempool_stats.tx_count}, Balance: ${(result.chain_stats.funded_txo_sum - result.chain_stats.spent_txo_sum + result.mempool_stats.funded_txo_sum - result.mempool_stats.spent_txo_sum) / 1e8} BTC`);
    const balance1 = result.chain_stats.funded_txo_sum - result.chain_stats.spent_txo_sum;
    const balance2 = result.mempool_stats.funded_txo_sum - result.mempool_stats.spent_txo_sum;

    if (result.chain_stats.tx_count > 0 || result.mempool_stats.tx_count > 0) {
      onSuccess({
        key: privateKeyWIF,
        address: result.address,
        balance1: balance1 / 1e8,
        tx_count1: result.chain_stats.tx_count,
        balance2: balance2 / 1e8,
        tx_count2: result.mempool_stats.tx_count,
        by: sniperName,
        timestamp: new Date().toISOString()
      });
    }
    privateKeyBytes = incrementByteArray(privateKeyBytes);

    if (privateKeyBytes !== 0) {
        setTimeout(() => bruteForce(privateKeyBytes, onSuccess, logger), 6000);
    }
  }).catch(err => {
    logger.error('Failed to fetch wallet info:', err);
        setTimeout(() => bruteForce(privateKeyBytes, onSuccess, logger), 6000);
  });
}

export function bruteForceStep(privateKeyBytes, onSuccess, logger = console) {
  const privateKeyWIF = generatePrivateKeyTextFromBytes(privateKeyBytes);

  importWalletAndCheckBalance(privateKeyWIF).then(result => {
    logger.log(`${new Date().toISOString()} Generated Private Key By: ${sniperName}, Key: ${Buffer.from(privateKeyBytes).toString('hex')}`);
    logger.log(`${new Date().toISOString()} Generated Address: ${result.address}, Tx Count: ${result.chain_stats.tx_count + result.mempool_stats.tx_count}, Balance: ${(result.chain_stats.funded_txo_sum - result.chain_stats.spent_txo_sum + result.mempool_stats.funded_txo_sum - result.mempool_stats.spent_txo_sum) / 1e8} BTC`);
    const balance1 = result.chain_stats.funded_txo_sum - result.chain_stats.spent_txo_sum;
    const balance2 = result.mempool_stats.funded_txo_sum - result.mempool_stats.spent_txo_sum;

    if (result.chain_stats.tx_count > 0 || result.mempool_stats.tx_count > 0) {
      onSuccess({
        key: privateKeyWIF,
        address: result.address,
        balance1: balance1 / 1e8,
        tx_count1: result.chain_stats.tx_count,
        balance2: balance2 / 1e8,
        tx_count2: result.mempool_stats.tx_count,
        by: sniperName,
        timestamp: new Date().toISOString()
      });
    }
  }).catch(err => {
    logger.error('Failed to fetch wallet info:', err);
        setTimeout(() => bruteForceStep(privateKeyBytes, onSuccess, logger), 6000);
  });
}
