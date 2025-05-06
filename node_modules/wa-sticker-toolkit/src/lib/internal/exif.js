const fs = require("fs");
const tmp = require("tmp");
const webp = require("node-webpmux");

async function writeExif(wMedia, metadata) {
    const tmpFileOut = tmp.fileSync({ postfix: ".webp" });
    const tmpFileIn = tmp.fileSync({ postfix: ".jpg" });

    fs.writeFileSync(tmpFileIn.name, wMedia);

    const img = new webp.Image();
    const json = {
        "sticker-pack-id":
            metadata.id || "https://github.com/DannyAkintunde/wa-sticker-maker",
        "sticker-pack-name": metadata.packname,
        "sticker-pack-publisher": metadata.author || "wa-sticker-maker",
        emojis: metadata.categories ? metadata.categories : [""]
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntLE(jsonBuff.length, 14, 4);
    await img.load(tmpFileIn.name);
    tmpFileIn.removeCallback();
    img.exif = exif;
    await img.save(tmpFileOut.name);
    return fs.readFileSync(tmpFileOut.name);
}

module.exports = {
    writeExif
};
