import { ipcMain } from 'electron';

import dotenv from 'dotenv';
import { bruteForceStep } from './core/bruteforce.js';
import { incrementByteArray } from './core/utils.js';


dotenv.config();
const sniperName = process.env.SNIPER_NAME;

let isScanning = false;
let mainWindow = null;

export function setMainWindow(window) {
    mainWindow = window;
}

export function getScanningStatus() {
    return isScanning;
}

// IPC Handlers for scanner operations
ipcMain.on('start-scanning', async (event, args) => {
    if (isScanning) {
        event.reply('log', {
            message: 'Scanner is already running',
            type: 'warning'
        });
        return;
    }

    isScanning = true;
    
    event.reply('log', {
        message: `Sniper name set to: ${args.sniperName.trim().length > 0 ? args.sniperName : $sniperName}`,
        type: 'info'
    });

    try {
        // Import core modules
        const { bruteForce } = await import('./core/bruteforce.js');
        const { generatePrivateKeyForBruteForce } = await import('./core/wallet.js');
        const { writeData } = await import('./core/firebase.js');

        let privateKeyBytes = generatePrivateKeyForBruteForce();

        const onSuccess = async (result) => {
            event.reply('wallet-found', {
                address: result.address,
                balance: result.balance1 + result.balance2,
                tx_count: result.tx_count1 + result.tx_count2
            });

            event.reply('log', {
                message: `SUCCESS: Found wallet ${result.address} with ${result.balance1 + result.balance2} BTC`,
                type: 'success'
            });

            try {
                await writeData(result);
                event.reply('log', {
                    message: 'Wallet data saved to Firebase',
                    type: 'success'
                });
            } catch (err) {
                event.reply('log', {
                    message: `Failed to save to Firebase: ${err.message}`,
                    type: 'error'
                });
            }
        };

        // Create a custom logger for the scanner
        const logger = {
            log: (message) => {
                event.reply('log', {
                    message: message,
                    type: 'info'
                });
            },
            error: (message) => {
                event.reply('log', {
                    message: message,
                    type: 'error'
                });
            }
        };

        // Start brute force with cancellation check
        const scanningLoop = async () => {
            while (isScanning) {
                try {
                    await new Promise((resolve) => {
                        bruteForceStep(privateKeyBytes, onSuccess, logger);
                        // Simulate async behavior
                        setTimeout(resolve, 6000);
                        event.reply('key-generated');
                        privateKeyBytes = incrementByteArray(privateKeyBytes);
                    });

                } catch (err) {
                    event.reply('scanner-error', {
                        message: err.message
                    });
                    break;
                }
            }
        };

        scanningLoop();
    } catch (err) {
        event.reply('scanner-error', {
            message: `Failed to start scanner: ${err.message}`
        });
        isScanning = false;
    }
});

ipcMain.on('stop-scanning', (event) => {
    if (!isScanning) {
        event.reply('log', {
            message: 'Scanner is not running',
            type: 'warning'
        });
        return;
    }

    isScanning = false;
    event.reply('log', {
        message: 'Scanner stopped by user',
        type: 'warning'
    });
});

// Handle any uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (mainWindow) {
        mainWindow.webContents.send('scanner-error', {
            message: `Fatal error: ${err.message}`
        });
    }
});
