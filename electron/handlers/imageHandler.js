const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const fileHandler = require('./fileHandler');

/**
 * Twitter用にリサイズした画像を生成する
 * @param {Buffer} imageBuffer - 画像バッファ
 * @param {Object} metadata - 画像メタデータ
 * @param {number} twitterSize - Twitter用サイズ（最大幅/高さ）
 * @returns {Promise<Buffer>} - リサイズされた画像
 */
async function resizeTwitter(imageBuffer, metadata, twitterSize) {
    const { width, height } = metadata;
    let reducePer = 1;

    // 2048を超える場合は縮小
    if (width >= height && width > twitterSize) {
        reducePer = twitterSize / width;
    } else if (height >= width && height > twitterSize) {
        reducePer = twitterSize / height;
    }

    // サイズ変更が必要ない場合はそのまま返す
    if (reducePer === 1) {
        return imageBuffer;
    }

    // 新しいサイズを計算
    const newWidth = Math.floor(width * reducePer);
    const newHeight = Math.floor(height * reducePer);

    // リサイズ実行
    const resizedImage = await sharp(imageBuffer)
        .resize(newWidth, newHeight, {
            kernel: sharp.kernel.lanczos3,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .toBuffer();

    return resizedImage;
}

/**
 * Pixiv用にリサイズした画像を生成する
 * @param {Buffer} imageBuffer - 画像バッファ
 * @param {Object} metadata - 画像メタデータ
 * @param {Array} pixivSizes - Pixiv用サイズリスト
 * @param {number} tolerance - 許容範囲
 * @param {number} reductionValue - 縮小率
 * @returns {Promise<Buffer>} - リサイズされた画像
 */
async function resizePixiv(imageBuffer, metadata, pixivSizes, tolerance, reductionValue) {
    let { width, height } = metadata;
    let converted = false;

    // Pixivサイズに合うように縮小
    while (!converted) {
        for (const [pxWidth, pxHeight] of pixivSizes) {
            if (pxWidth + tolerance >= width && pxHeight + tolerance >= height) {
                converted = true;
                break;
            }
        }

        if (!converted) {
            width = width * reductionValue;
            height = height * reductionValue;
        }
    }

    // リサイズ実行
    const resizedImage = await sharp(imageBuffer)
        .resize(Math.floor(width), Math.floor(height), {
            kernel: sharp.kernel.lanczos3,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .toBuffer();

    return resizedImage;
}

/**
 * 画像を処理し、リサイズして保存する
 * @param {Array} images - 処理対象の画像パスリスト
 * @param {Object} config - 設定情報
 * @returns {Array} - 処理結果
 */
async function processImages(images, config) {
    const results = [];

    for (const imagePath of images) {
        try {
            // 画像を読み込む
            const imageBuffer = await fs.readFile(imagePath);

            // 画像のメタデータを取得
            const metadata = await sharp(imageBuffer).metadata();

            // 新しいディレクトリを作成
            const { dirPath, fileName } = fileHandler.makeDir(imagePath);

            // Twitter用にリサイズ
            const twitterImageBuffer = await resizeTwitter(imageBuffer, metadata, config.TwitterSize || 1080);

            // Pixiv用にリサイズ
            const pixivImageBuffer = await resizePixiv(
                imageBuffer,
                metadata,
                config.PixivSizes || [
                    [600, 850],
                    [724, 1024],
                    [1000, 750],
                    [1200, 750],
                    [1024, 768],
                    [1280, 800],
                    [1280, 960],
                ],
                config.Tolerance || 90,
                config.ReductionValue || 0.9375
            );

            // リサイズした画像を保存
            const twitterFilePath = path.join(dirPath, `${fileName}.twitter.png`);
            const pixivFilePath = path.join(dirPath, `${fileName}.pixiv.png`);
            const originalFilePath = path.join(dirPath, `${fileName}.origin.png`);

            await fs.writeFile(twitterFilePath, twitterImageBuffer);
            await fs.writeFile(pixivFilePath, pixivImageBuffer);

            // オリジナル画像を移動
            await fileHandler.moveFile(imagePath, originalFilePath);

            results.push({
                original: imagePath,
                twitter: twitterFilePath,
                pixiv: pixivFilePath,
                directory: dirPath,
                success: true,
            });
        } catch (error) {
            console.error(`Error processing image ${imagePath}:`, error);
            results.push({
                original: imagePath,
                success: false,
                error: error.message,
            });
        }
    }

    return results;
}

module.exports = {
    processImages,
    resizeTwitter,
    resizePixiv,
};
