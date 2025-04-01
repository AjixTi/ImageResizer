const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

/**
 * 指定されたディレクトリからPNG画像のリストを取得する
 * @param {string} targetDir - 対象ディレクトリパス
 * @returns {Array} - 画像ファイルパスのリスト
 */
async function getTargetImages(targetDir) {
    try {
        const targetImages = [];

        // ディレクトリが存在しない場合は空配列を返す
        if (!(await fs.pathExists(targetDir))) {
            return targetImages;
        }

        // ディレクトリ内のサブディレクトリを探索
        const entries = await fs.readdir(targetDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const subDir = path.join(targetDir, entry.name);

                // サブディレクトリ内のPNGファイルを検索
                const pngFiles = await glob.glob(path.join(subDir, '*.png'));
                targetImages.push(...pngFiles);
            }
        }

        return targetImages;
    } catch (error) {
        console.error('Error getting target images:', error);
        return [];
    }
}

/**
 * 新しいディレクトリを作成する
 * @param {string} filePath - 元のファイルパス
 * @returns {Object} - 新しいディレクトリパスとファイル名
 */
function makeDir(filePath) {
    try {
        const fileName = path.basename(filePath, '.png');
        const dirName = path.dirname(filePath);
        const now = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const newDirPath = path.join(dirName, `${now}_${fileName}`);

        fs.ensureDirSync(newDirPath);

        return {
            dirPath: newDirPath,
            fileName: fileName,
        };
    } catch (error) {
        console.error('Error making directory:', error);
        throw error;
    }
}

/**
 * ファイルを移動する
 * @param {string} srcPath - 元のファイルパス
 * @param {string} destPath - 移動先のファイルパス
 * @returns {boolean} - 成功したかどうか
 */
async function moveFile(srcPath, destPath) {
    try {
        await fs.move(srcPath, destPath, { overwrite: true });
        return true;
    } catch (error) {
        console.error('Error moving file:', error);
        return false;
    }
}

module.exports = {
    getTargetImages,
    makeDir,
    moveFile,
};
