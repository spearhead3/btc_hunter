import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import { setMainWindow } from './ipcHandlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

// Create the browser window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    // Load the app from local file
    const startUrl = `file://${path.join(__dirname, 'ui/index.html')}`;
    
    mainWindow.loadURL(startUrl);

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Initialize IPC handlers with main window reference
setMainWindow(mainWindow);

// IPC handler to get default sniper name
ipcMain.handle('get-default-sniper-name', () => {
    return process.env.SNIPER_NAME || 'DEFAULT_SNIPER';
});

// Create window when electron is ready
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
