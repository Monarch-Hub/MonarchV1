"use strict";

const fetchBuffer = require("./internal/fetchBuffer");
const { writeExif } = require("./internal/exif");
const { imageToPng, videoToWebp, videoToMov } = require("./converter");
const { addTextToMedia } = require("./addTextToMedia");
const {
    applyStickerTypeToStatic,
    applyStickerTypeToAnimated
} = require("./StickerTypes");

async function buildSticker(stickerObject) {
    const { data, mime, ext } = await fetchBuffer(stickerObject.data);
    console.log(mime);
    if (/image|video/.test(mime)) {
        let buffer = data;
        let isVideo = false;
        // convert if needed
        if (/image/.test(mime)) {
            if (ext !== "png") buffer = await imageToPng(buffer, ext);
            buffer = await applyStickerTypeToStatic(
                buffer,
                stickerObject.options
            );
        } else if (/video/.test(mime)) {
            buffer = await videoToMov(
                buffer,
                stickerObject.video.length,
                stickerObject.video.fps
            );
            isVideo = true;
            buffer = await applyStickerTypeToAnimated(
                buffer,
                stickerObject.options
            );
        }
        if (stickerObject.text?.content) {
            buffer = await addTextToMedia(
                buffer,
                stickerObject.text.content,
                stickerObject.text,
                isVideo
            );
        }
        if (isVideo) {
            buffer = await videoToWebp(buffer, stickerObject.options.quality);
        }

        // write metadata
        buffer = await writeExif(buffer, stickerObject.metadata);

        return buffer;
    }
    throw new Error("Invalid file type.");
}

module.exports = { buildSticker };
