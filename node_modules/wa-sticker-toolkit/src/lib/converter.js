const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const tmp = require("tmp");

async function imageToWebp(media) {
    const tmpFileOut = tmp.fileSync({ postfix: ".webp" });
    const tmpFileIn = tmp.fileSync({ postfix: ".jpg" });

    fs.writeFileSync(tmpFileIn.name, media);

    await new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn.name)
            .on("error", err => {
                reject(err);
                tmpFileIn.removeCallback();
                tmpFileOut.removeCallback();
            })
            .on("end", () => {
                resolve(true);
                tmpFileIn.removeCallback();
            })
            .on("start", command => {
                if (global.DEBUG) {
                    console.info("Image conversion to webp started");
                    console.log(command);
                }
            })
            .on("stdout", outLine => {
                if (global.DEBUG) console.log(outLine);
            })
            .on("stderr", errLine => {
                if (global.DEBUG) console.log(errLine);
            })
            .addOutputOptions(["-vcodec", "libwebp"])
            .toFormat("webp")
            .save(tmpFileOut.name);
    });

    const buff = fs.readFileSync(tmpFileOut.name);
    tmpFileOut.removeCallback();
    return buff;
}

async function imageToPng(media, ext) {
    const tmpFileOut = tmp.fileSync({ postfix: ".png" });
    const tmpFileIn = tmp.fileSync({ postfix: `.${ext}` });

    fs.writeFileSync(tmpFileIn.name, media);

    await sharp(tmpFileIn.name).png().toFile(tmpFileOut.name);

    const buff = fs.readFileSync(tmpFileOut.name);
    tmpFileOut.removeCallback();
    return buff;
}

async function videoToWebp(media, quality) {
    const tmpFileOut = tmp.fileSync({ postfix: ".webp" });
    const tmpFileIn = tmp.fileSync({ postfix: ".mov" });

    fs.writeFileSync(tmpFileIn.name, media);

    await new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn.name)
            .on("error", err => {
                reject(err);
                tmpFileIn.removeCallback();
                tmpFileOut.removeCallback();
            })
            .on("end", () => {
                resolve(true);
                tmpFileIn.removeCallback();
                console.log("video successful converted to webp");
            })
            .on("start", command => {
                if (global.DEBUG) console.log(command);
            })
            .on("stdout", outLine => {
                if (global.DEBUG) console.log(outLine);
            })
            .on("stderr", errLine => {
                if (global.DEBUG) console.log(errLine);
            })
            .outputOptions([
                "-loop",
                "0",
                "-lossless",
                "0",
                "-c:v",
                "libwebp",
                "-quality",
                `${quality}`,
                "-vsync",
                "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut.name);
    });

    const buff = fs.readFileSync(tmpFileOut.name);
    tmpFileOut.removeCallback();
    return buff;
}

async function videoToMov(media, stickerLength, frameRate) {
    const tmpFileOut = tmp.fileSync({ postfix: ".mov" });
    const tmpFileIn = tmp.fileSync();

    fs.writeFileSync(tmpFileIn.name, media);

    await new Promise((resolve, reject) => {
        ffmpeg(tmpFileIn.name)
            .on("error", err => {
                reject(err);
                tmpFileIn.removeCallback();
                tmpFileOut.removeCallback();
            })
            .on("end", () => {
                resolve(true);
                tmpFileIn.removeCallback();
            })
            .on("start", command => {
                if (global.DEBUG) {
                    console.info("Video conversion to mov started");
                    console.log(command);
                }
            })
            .on("stdout", outLine => {
                if (global.DEBUG) console.log(outLine);
            })
            .on("stderr", errLine => {
                if (global.DEBUG) console.log(errLine);
            })
            .addOutputOptions([
                "-t",
                stickerLength,
                "-c:v",
                "qtrle",
                "-pix_fmt",
                "argb",
                "-an",
                "-vsync",
                "0"
            ])
            .videoFilters(`fps=${frameRate}`)
            .toFormat("mov")
            .save(tmpFileOut.name);
    });

    const buff = fs.readFileSync(tmpFileOut.name);
    tmpFileOut.removeCallback();
    return buff;
}

module.exports = { imageToWebp, videoToWebp, imageToPng, videoToMov };
