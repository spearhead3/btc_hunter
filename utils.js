export function waitSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // Busy-wait loop
  }
}

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