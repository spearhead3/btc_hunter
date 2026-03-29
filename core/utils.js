export function incrementByteArray(byteArray) {
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

export function hexStringToBytes(hex) {
  if (hex.length !== 64) {
    throw new Error('Hex string must be exactly 64 characters');
  }
  return Buffer.from(hex, 'hex');
}


export function makeRandom(length) {
  const bytes = new Uint8Array(32);
  const timestamp = Date.now() - 1000 * 3600 * 24 * 365 * 10; // 10 years ago

  for (let i = 0; i < 32; i++) {
    bytes[i] = (timestamp >> ((i % 6) * 8)) & 0xff;
  }

  return Buffer.from(bytes);
}