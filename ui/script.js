// Preload script will inject this if running in Electron
const { ipcRenderer } = window.electronAPI || {};

const elements = {
    sniperName: document.getElementById('sniper-name'),
    toggleBtn: document.getElementById('toggle-btn'),
    clearLogBtn: document.getElementById('clear-log-btn'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    logContainer: document.getElementById('log-container'),
    keysCount: document.getElementById('keys-count'),
    walletsFound: document.getElementById('wallets-found'),
    envInfo: document.getElementById('env-name')
};

let isScanning = false;
let keysGenerated = 0;
let walletsDiscovered = 0;

function addLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ${message}`;
    elements.logContainer.appendChild(logEntry);
    elements.logContainer.scrollTop = elements.logContainer.scrollHeight;
}

function updateUI() {
    if (isScanning) {
        elements.toggleBtn.textContent = 'Stop Scanning';
        elements.toggleBtn.classList.add('scanning');
        elements.statusDot.classList.add('active');
        elements.statusText.textContent = 'Scanning...';
    } else {
        elements.toggleBtn.textContent = 'Start Scanning';
        elements.toggleBtn.classList.remove('scanning');
        elements.statusDot.classList.remove('active');
        elements.statusText.textContent = 'Ready to start';
    }
}

elements.toggleBtn.addEventListener('click', () => {
    if (isScanning) {
        // Stop scanning
        isScanning = false;
        updateUI();
        addLog('Scanner stopped', 'warning');

        if (ipcRenderer) {
            ipcRenderer.send('stop-scanning');
        }
    } else {
        // Start scanning
        if (!elements.sniperName.value.trim()) {
            addLog('Please enter a sniper name', 'warning');
            return;
        }

        isScanning = true;
        keysGenerated = 0;
        walletsDiscovered = 0;
        updateUI();
        addLog('Scanner started', 'success');

        // Send to Electron main process if available
        if (ipcRenderer) {
            ipcRenderer.send('start-scanning', {
                sniperName: elements.sniperName.value
            });
        }
    }
});

elements.clearLogBtn.addEventListener('click', () => {
    elements.logContainer.innerHTML = '';
    addLog('Logs cleared');
});

// Listen for updates from Electron main process
if (ipcRenderer) {
    ipcRenderer.on('key-generated', (data) => {
        keysGenerated++;
        elements.keysCount.textContent = keysGenerated;
    });

    ipcRenderer.on('wallet-found', (data) => {
        walletsDiscovered++;
        elements.walletsFound.textContent = walletsDiscovered;
        addLog(`Wallet found: ${data.address}`, 'success');
    });

    ipcRenderer.on('log', (data) => {
        addLog(data.message, data.type || 'info');
    });

    ipcRenderer.on('scanner-error', (data) => {
        addLog(`Error: ${data.message}`, 'error');
    });
}

// Initialize UI
updateUI();

// Load default sniper name from .env
if (ipcRenderer) {
    ipcRenderer.invoke('get-default-sniper-name').then((defaultName) => {
        if (defaultName && !elements.sniperName.value.trim()) {
            elements.sniperName.value = defaultName;
            addLog(`Loaded default sniper name: ${defaultName}`, 'info');
        }
    }).catch((err) => {
        console.error('Failed to load default sniper name:', err);
    });
}

addLog('BTC Hunter loaded');
