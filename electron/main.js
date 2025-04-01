const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const url = require('url');
const isDev = process.env.NODE_ENV !== 'production';

// ハンドラーのインポート
const configHandler = require('./handlers/configHandler');
const fileHandler = require('./handlers/fileHandler');
const imageHandler = require('./handlers/imageHandler');
const syncHandler = require('./handlers/syncHandler');

// メインウィンドウを保持する変数
let mainWindow;

function createWindow() {
    // メインウィンドウを作成
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // 開発環境の場合はDevServerから読み込み、本番環境ではビルドしたファイルを読み込む
    const startUrl = isDev
        ? 'http://localhost:3000'
        : url.format({
              pathname: path.join(__dirname, '../build/index.html'),
              protocol: 'file:',
              slashes: true,
          });

    mainWindow.loadURL(startUrl);

    // 開発ツールを開く（開発環境のみ）
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // ウィンドウが閉じられたときの処理
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Electronの初期化が完了したらウィンドウを作成
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// すべてのウィンドウが閉じられたらアプリを終了
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC通信のハンドラー登録
// 設定関連
ipcMain.handle('load-config', async () => {
    return await configHandler.loadConfig();
});

ipcMain.handle('save-config', async (event, config) => {
    return await configHandler.saveConfig(config);
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    });
    return result.filePaths[0];
});

// ファイル操作関連
ipcMain.handle('get-target-images', async (event, targetDir) => {
    return await fileHandler.getTargetImages(targetDir);
});

// 画像処理関連
ipcMain.handle('resize-images', async (event, images, config) => {
    return await imageHandler.processImages(images, config);
});

// 同期処理関連
ipcMain.handle('sync-files', async (event, srcDir, dstDir) => {
    return await syncHandler.syncFiles(srcDir, dstDir);
});
