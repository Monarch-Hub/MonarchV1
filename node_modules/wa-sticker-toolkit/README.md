<div align="center">
<img src="https://files.catbox.moe/tzde2e.png" alt="package logo" width="300px"/>

# WA Sticker Toolkit

[![NPM](https://img.shields.io/npm/l/wa-sticker-toolkit?style=flat-square&label=License)](https://github.com/DannyAkintunde/wa-sticker-toolkit/blob/main/LICENSE) [![CodeFactor](https://img.shields.io/codefactor/grade/github/DannyAkintunde/wa-sticker-toolkit?style=flat-square&label=Code%20Quality)](https://www.codefactor.io/repository/github/dannyakintunde/wa-sticker-toolkit) [![NPM](https://img.shields.io/npm/dw/wa-sticker-toolkit?style=flat-square&label=Downloads)](https://npmjs.com/package/wa-sticker-toolkit)

</div>

## Installation

Install via npm:

```bash
npm i wa-sticker-toolkit
```

## Overview

wa-sticker-toolkit provides a simple way to create WhatsApp stickers from various sources such as Buffers, URLs, SVG strings, Base64-encoded images, file paths, GIFs, and videos. The output format is WebP, with GIFs and videos automatically converted into animated stickers.

### Importing the Library

```js
const {
    Sticker,
    createSticker,
    StickerTypes,
    TextPositions
} = require("wa-sticker-toolkit");
// ES6 import { Sticker, createSticker, StickerTypes, TextPositions } from "wa-sticker-toolkit";
```

---

## Creating Stickers

There are two main ways to create stickers:

1. Using the Sticker Constructor (Recommended)

    ```js
    const sticker = new Sticker(image, {
        metadata: {
            pack: "My Pack", // Pack name
            author: "Me", // Author name
            id: "12345", // Sticker ID (auto-generated if omitted)
            categories: ["🤩", "🎉"] // Used for WhatsApp sticker search
        },
        type: StickerTypes.FILL, // Sticker type
        quality: 50, // Output quality (1-100)
        background: "#000000" // Background color
    });
    
    // Convert to buffer
    const buffer = await sticker.toBuffer();
    
    // Save to file
    await sticker.toFile("sticker.webp");
    
    // Send using Baileys-MD
    conn.sendMessage(jid, await sticker.toMessage());
    ```

    You can also chain methods for better readability:
    
    ```js
    const buffer = await new Sticker(image)
        .setPack("My Pack")
        .setAuthor("Me")
        .setType(StickerTypes.FILL)
        .setCategories(["🤩", "🎉"])
        .setId("12345")
        .setBackground("#000000")
        .setQuality(50)
        .toBuffer();
    ```

> Note: The image parameter can be a Buffer, URL, SVG string, Base64 string, or file path.

---

2. Using createSticker Function

    ```js
    const buffer = await createSticker(image, options);
    // Returns a Promise that resolves to a Buffer
    ```

---

## Options

The second parameter (options) is an object that allows customization:

```js
{
    metadata: {
        pack: "Pack Name",
        author: "Author Name",
        id: "Sticker ID",
        categories: ["🤣", "❤️"]
    },
    type: StickerTypes.FILL,  // 'default', 'crop', 'fill', 'circle'
    quality: 80,              // Integer (1-100)
    background: "#FFFFFF",    // Hex color or sharp color object
    borderWidth: 5,          // Border width (default: 0)
    borderColor: "#FF0000",  // Border color (default: white)
    borderRadius: "50%",     // Rounded corners (percentage or integer)
    text: {
        content: "Hello!",   // Text overlay
        color: "#FFFFFF",    // Text color (hex only)
        font: "Arial",       // Font family
        fontSize: 24,        // Font size
        position: TextPositions.BOTTOM // 'top', 'center', 'bottom'
    }
}
```

---

## Sticker Types & Text Positions

### Sticker Types

```js
const StickerTypes = Object.freeze({
    DEFAULT: "default",
    CROPPED: "crop",
    FILL: "fill",
    CIRCLE: "circle"
});
```

### Text Positions

```js
const TextPositions = Object.freeze({
    TOP: "top",
    CENTER: "center",
    BOTTOM: "bottom"
});
```

---

## Background Options

You can specify a background color in two ways:

### Hex Color String:

```json
{ "background": "#FFFFFF" }
```

### Sharp Color Object:

```json
{
    "background": {
        "r": 255,
        "g": 255,
        "b": 255,
        "alpha": 1
    }
}
```

> Note: The text color only accepts hex codes.

---

## WhatsApp Sticker Metadata

WhatsApp stickers include metadata such as the pack name, author, and categories.

1. Author & Pack Title

    <img src="https://i.ibb.co/9vmxsKd/metadata.jpg" alt="Metadata example" width="256"/>
    
    Bold text: Pack title
    
    Remaining text: Author name

    > This metadata is stored using Exif data embedded in the WebP file.

2. Sticker Categories

    WhatsApp allows stickers to have emoji-based categories.
    Learn more.

---

# Backward Compatibility

If you're migrating from [`wa-sticker-formatter`](https://www.npmjs.com/package/wa-sticker-formatter) or [`@shibam/sticker-maker`](https://npmjs.com/package/@shibam/sticker-maker), no major changes are needed—just update your import statements, and everything should work seamlessly.

Thanks for using wa-sticker-toolkit!

---

This program is licensed under the [MIT](LICENSE) license.
