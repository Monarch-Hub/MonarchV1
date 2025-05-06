const fs = require("fs");
const tmp = require("tmp");

const {
    cropMedia,
    shrinkMedia,
    makeCircularMedia,
    fillMedia
} = require("./editor");

const StickerTypes = Object.freeze({
    DEFAULT: "defualt",
    FILL: "fill",
    CROPPED: "crop",
    CIRCLE: "circle",
});

async function applyStickerTypeToMedia(
    inputFile,
    outputFile,
    isVideo,
    options
) {
    const stickerType = options.type;
    switch (stickerType) {
        case StickerTypes.DEFAULT:
            {
                await shrinkMedia(
                    inputFile.name,
                    outputFile.name,
                    isVideo,
                    options
                );
            }
            break;
        case StickerTypes.FILL:
            {
                await fillMedia(
                    inputFile.name,
                    outputFile.name,
                    isVideo,
                    options
                );
            }
            break;
        case StickerTypes.CROPPED:
            {
                await cropMedia(
                    inputFile.name,
                    outputFile.name,
                    isVideo,
                    options
                );
            }
            break;
        case StickerTypes.CIRCLE:
            {
                await makeCircularMedia(
                    inputFile.name,
                    outputFile.name,
                    isVideo,
                    options
                );
            }
            break;
        default: {
            throw new Error("Invalid Sticker Type selected.");
        }
    }
}

async function applyStickerTypeToStatic(buffer, options) {
    const stickerType = options.type;
    const tmpFileIn = tmp.fileSync({ postfix: ".png" });
    const tmpFileOut = tmp.fileSync({ postfix: ".webp" });

    fs.writeFileSync(tmpFileIn.name, buffer);

    await applyStickerTypeToMedia(tmpFileIn, tmpFileOut, false, options);

    const outputBuffer = fs.readFileSync(tmpFileOut.name);
    tmpFileOut.removeCallback();
    return outputBuffer;
}

async function applyStickerTypeToAnimated(buffer, options) {
    const stickerType = options.type;
    const tmpFileIn = tmp.fileSync({ postfix: ".mov" });
    const tmpFileOut = tmp.fileSync({ postfix: ".mov" });

    fs.writeFileSync(tmpFileIn.name, buffer);

    await applyStickerTypeToMedia(tmpFileIn, tmpFileOut, true, options);

    const outputBuffer = fs.readFileSync(tmpFileOut.name);
    tmpFileOut.removeCallback();
    return outputBuffer;
}

module.exports = {
    StickerTypes,
    applyStickerTypeToStatic,
    applyStickerTypeToAnimated
};
