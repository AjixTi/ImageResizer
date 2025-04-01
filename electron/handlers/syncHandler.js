const fs = require('fs-extra');
const path = require('path');

/**
 * 2つのディレクトリ間でファイルを同期する
 * @param {string} srcDir - 元ディレクトリ
 * @param {string} dstDir - 先ディレクトリ
 * @returns {Object} - 同期結果
 */
async function syncFiles(srcDir, dstDir) {
    try {
        // ディレクトリが存在するか確認
        if (!(await fs.pathExists(srcDir))) {
            return { success: false, error: 'Source directory does not exist', syncedFiles: [] };
        }

        if (!(await fs.pathExists(dstDir))) {
            await fs.ensureDir(dstDir);
        }

        // 元ディレクトリのファイル一覧を取得
        const srcFiles = await fs.readdir(srcDir);

        // 同期が必要なファイルをリスト化
        const syncTargets = [];

        for (const file of srcFiles) {
            // ファイル拡張子をチェック (.sai または .sai2のみ)
            const ext = path.extname(file).toLowerCase();
            if (ext !== '.sai' && ext !== '.sai2') {
                continue;
            }

            const srcFilePath = path.join(srcDir, file);
            const dstFilePath = path.join(dstDir, file);

            // 宛先にファイルが存在するかチェック
            const dstExists = await fs.pathExists(dstFilePath);

            if (!dstExists) {
                // 宛先にファイルが存在しなければ同期対象
                syncTargets.push({
                    file,
                    srcPath: srcFilePath,
                    dstPath: dstFilePath,
                    reason: 'file_not_exist',
                });
            } else {
                // 日付を比較
                const srcStat = await fs.stat(srcFilePath);
                const dstStat = await fs.stat(dstFilePath);

                if (dstStat.mtime < srcStat.mtime) {
                    // 宛先のほうが古ければ同期対象
                    syncTargets.push({
                        file,
                        srcPath: srcFilePath,
                        dstPath: dstFilePath,
                        reason: 'outdated',
                    });
                }
            }
        }

        // 同期実行
        const results = [];

        for (const target of syncTargets) {
            try {
                await fs.copy(target.srcPath, target.dstPath, { overwrite: true });
                results.push({
                    file: target.file,
                    success: true,
                    reason: target.reason,
                });
            } catch (error) {
                results.push({
                    file: target.file,
                    success: false,
                    reason: target.reason,
                    error: error.message,
                });
            }
        }

        return {
            success: true,
            syncedFiles: results,
            totalSynced: results.filter((r) => r.success).length,
        };
    } catch (error) {
        console.error('Error syncing files:', error);
        return { success: false, error: error.message, syncedFiles: [] };
    }
}

module.exports = {
    syncFiles,
};
