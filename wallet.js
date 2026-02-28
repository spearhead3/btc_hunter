import * as bitcoin from 'bitcoinjs-lib';
import * as ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import axios from 'axios';
import crypto from 'crypto';

const ECPair = ECPairFactory.ECPairFactory(ecc);

export async function importWalletAndCheckBalance(privateKeyWIF) {
  try {
    const keyPair = ECPair.fromWIF(privateKeyWIF);
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

    const response = await axios.get(`https://blockstream.info/api/address/${address}`);
    return response.data;
  } catch (error) {
    console.error('Error importing wallet or fetching balance:', error.message);
    throw error;
  }
}

export function generatePrivateKeyString() {
  try {
    const keyPair = ECPair.makeRandom();
    return keyPair.toWIF();
  } catch (error) {
    console.error('Error generating private key:', error.message);
    throw error;
  }
}

export function generatePrivateKeyForBruteForce() {
  try {
    return crypto.randomBytes(32);
  } catch (error) {
    console.error('Error generating private key for brute force:', error.message);
    throw error;
  }
}

export function generatePrivateKeyTextFromBytes(bytes) {
  try {
    const keyPair = ECPair.fromPrivateKey(bytes);
    return keyPair.toWIF();
  } catch (error) {
    console.error('Error generating private key text from bytes:', error.message);
    throw error;
  }
}