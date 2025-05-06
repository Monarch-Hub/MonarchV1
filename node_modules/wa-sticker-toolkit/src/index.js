"use strict";

const { Sticker, createSticker } = require("./Sticker");
const { StickerTypes } = require("./lib/StickerTypes");
const { TextPositions } = require("./lib/addTextToMedia");

global.DEBUG = false;

module.exports = { Sticker, createSticker, StickerTypes, TextPositions };
