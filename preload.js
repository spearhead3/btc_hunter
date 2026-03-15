const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    ipcRenderer: {
        send: (channel, data) => {
            // Whitelist allowed channels
            const validChannels = ['start-scanning', 'stop-scanning'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        on: (channel, func) => {
            // Whitelist allowed channels
            const validChannels = ['log', 'wallet-found', 'key-generated', 'scanner-error'];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes the sending context
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        once: (channel, func) => {
            const validChannels = ['log', 'wallet-found', 'key-generated', 'scanner-error'];
            if (validChannels.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
        },
        invoke: (channel, ...args) => {
            // Whitelist allowed invoke channels
            const validChannels = ['get-default-sniper-name'];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, ...args);
            }
        }
    },
    versions: process.versions,
    platform: process.platform
});
