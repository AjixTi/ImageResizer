const fs = require('fs-extra');
const path = require('path');
const ini = require('ini');

// アプリケーションのデータディレクトリにあるconfigパス
const getUserConfigPath = () => {
    const userDataPath = path.join(require('electron').app.getPath('userData'));
    return path.join(userDataPath, 'config.ini');
};

// デフォルト設定
const defaultConfig = {
    ResizeConfigure: {
        target_dir: '',
    },
    SaiSync: {
        src_dir: '',
        dst_dir: '',
    },
    PixivSizes: [
        [600, 850],
        [724, 1024],
        [1000, 750],
        [1200, 750],
        [1024, 768],
        [1280, 800],
        [1280, 960],
    ],
    TwitterSize: 1080,
    Tolerance: 90,
    ReductionValue: 0.9375,
};

/**
 * 設定をロードする
 */
async function loadConfig() {
    try {
        const configPath = getUserConfigPath();

        // 設定ファイルが存在しない場合、デフォルト設定をコピー
        if (!(await fs.pathExists(configPath))) {
            // アプリケーションバンドルからデフォルト設定を取得
            let bundledConfigPath;
            if (process.env.NODE_ENV === 'production') {
                bundledConfigPath = path.join(process.resourcesPath, 'config.ini');
            } else {
                bundledConfigPath = path.join(__dirname, '../../config.ini');
            }

            // デフォルト設定が存在すればコピー、なければデフォルト値を作成
            if (await fs.pathExists(bundledConfigPath)) {
                await fs.copy(bundledConfigPath, configPath);
            } else {
                await fs.writeFile(configPath, ini.stringify(defaultConfig));
            }
        }

        // 設定ファイルを読み込む
        const configData = await fs.readFile(configPath, 'utf8');
        const config = ini.parse(configData);

        // PixivSizes配列が文字列化されているのでJSONに変換
        if (typeof config.PixivSizes === 'string') {
            try {
                config.PixivSizes = JSON.parse(config.PixivSizes);
            } catch (e) {
                config.PixivSizes = defaultConfig.PixivSizes;
            }
        }

        // TwitterSizeが文字列になっているので数値に変換
        if (typeof config.TwitterSize === 'string') {
            config.TwitterSize = parseInt(config.TwitterSize);
        }

        // デフォルト値との比較・マージ
        return {
            ...defaultConfig,
            ...config,
            ResizeConfigure: {
                ...defaultConfig.ResizeConfigure,
                ...config.ResizeConfigure,
            },
            SaiSync: {
                ...defaultConfig.SaiSync,
                ...config.SaiSync,
            },
        };
    } catch (error) {
        console.error('Failed to load config:', error);
        return defaultConfig;
    }
}

/**
 * 設定を保存する
 */
async function saveConfig(config) {
    try {
        const configPath = getUserConfigPath();

        // PixivSizes配列を文字列化して保存
        const configToSave = {
            ...config,
            PixivSizes: JSON.stringify(config.PixivSizes),
        };

        await fs.writeFile(configPath, ini.stringify(configToSave));
        return { success: true };
    } catch (error) {
        console.error('Failed to save config:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    loadConfig,
    saveConfig,
};
