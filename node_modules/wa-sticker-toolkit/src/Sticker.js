"use strict";

const tmp = require("tmp");
const fs = require("fs");
const { buildSticker } = require("./lib/build");

const {
    StickerTypes,
    applyStickerTypeToStatic,
    applyStickerTypeToAnimated
} = require("./lib/StickerTypes");

class Sticker {
    constructor(data, options) {
        this.data = data;
        this.options = options || {};
        this.text = this.options.text || {};
        if (typeof this.text === "string") this.text = { content: this.text };
        this.metadata = {
            id: this.options.id,
            author: this.options.author,
            pack: this.options.pack,
            ...this.options.metadata
        };
        this.video = {
            length: this.options.length || 6,
            fps: this.options.fps || 8,
            ...this.options.video
        };
        delete this.options.id;
        delete this.options.author;
        delete this.options.pack;
        delete this.options.metadata;
        delete this.options.text;

        this.build = async () => await buildSticker(this);

        this.toBuffer = this.build;
        this.toFile = async filename => {
            const output = await this.build();
            const file = tmp.fileSync({ keep: true });
            const fN = filename || file.name; // auctual filename that sticker will be saved in
            const fileName = await new Promise((resolve, reject) => {
                fs.writeFile(fN, output, err => {
                    if (err) reject(err);
                    resolve(fN);
                });
            });
            return fileName;
        };
        /*Deprecated only add to alw reverse compatability to alternatives.*/
        this.toMessage = async () => {
            return { sticker: await this.build() };
        };

        this.setID = id => {
            this.metadata.id = id;
            return this;
        };
        this.setPack = pack => {
            this.metadata.pack = pack || "";
            return this;
        };
        this.setAuthor = author => {
            this.metadata.author = author;
            return this;
        };
        this.setQuality = quality => {
            this.options.quality = quality;
            return this;
        };
        this.setType = type => {
            this.options.type = type;
            return this;
        };
        this.setText = textObj => {
            this.text = textObj;
            return this;
        };
        this.setTextCotent = textString => {
            this.text.content = textString;
            return this;
        };
        this.setTextColor = color => {
            this.text.color = color;
            return this;
        };
        this.setTextFont = font => {
            this.text.font = font;
            return this;
        };
        this.setTextFontSize = fontSize => {
            this.text.fontSize = fontSize;
            return this;
        };
        this.setTextPosition = position => {
            this.text.position = position;
            return this;
        };
        this.setTextSize = this.setTextFontSize;
        this.setBackgroundColor = backgroundColor => {
            this.options.backgroundColor = backgroundColor;
            return backgroundColor;
        };
        this.setBackground = this.setBackgroundColor;
        this.setBorderColor = borderColor => {
            this.options.borderColor = borderColor;
            return this;
        };
        this.setBorderWidth = borderWidth => {
            this.options.borderColor = borderWidth;
            return this;
        };
        this.setBorderRadiud = borderRadius => {
            this.options.borderRadius = borderRadius;
            return this;
        };

        // this.metadata.id = this.metadata.id
        //     ? this.metadata.id
        //     : crypto.randomBytes(36).toString("hex");
        this.metadata.pack = this.metadata.pack || "";
        this.options.quality = this.options.quality || 100;
        this.options.backgroundColor =
            this.options.backgroundColor || this.options.background;
        this.options.type = Object.values(StickerTypes).includes(
            this.options.type
        )
            ? this.options.type
            : StickerTypes.DEFAULT;
    }
}

function createSticker(...options) {
    return new Sticker(...options).build();
}

module.exports = { Sticker, createSticker };
