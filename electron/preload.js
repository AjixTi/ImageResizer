const { contextBridge, ipcRenderer } = require('electron');

// Reactアプリに公開するAPI
contextBridge.exposeInMainWorld('electron', {
    // 設定関連
    loadConfig: () => ipcRenderer.invoke('load-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),

    // ファイル操作関連
    getTargetImages: (targetDir) => ipcRenderer.invoke('get-target-images', targetDir),

    // 画像処理関連
    resizeImages: (images, config) => ipcRenderer.invoke('resize-images', images, config),

    // 同期処理関連
    syncFiles: (srcDir, dstDir) => ipcRenderer.invoke('sync-files', srcDir, dstDir),
});
