function createSvgMaskAndBorder(radius, borderWidth, borderColor, imgSize) {
    const size = 512;
    const [width, height] = Array.isArray(imgSize) ? imgSize : [size, size];

    // Convert percentage-based radius to absolute value
    const r =
        typeof radius === "string" && radius.includes("%")
            ? (parseInt(radius) / 100) * (Math.max([width, height]) || height)
            : radius;

    const innerWidth = width - 2 * borderWidth;
    const innerHeight = height - 2 * borderWidth;
    const innerRadius = Math.max(0, r - borderWidth);
    const externalRadius = r + borderWidth;

    // Create the mask (white center, black border for transparency)
    const maskSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="black"/>
            <rect  x="${borderWidth}" y="${borderWidth}"
                width="${innerWidth}" height="${innerHeight}" 
                fill="white" rx="${innerRadius}" ry="${innerRadius}"/>
        </svg>
    `.trim();

    // Create the border overlay (transparent center, colored border)
    const borderSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${
                width - borderWidth
            }" height="${
                height - borderWidth
            }" fill="transparent" stroke="${borderColor}" 
                stroke-width="${borderWidth}" stroke-alignment="inside" rx="${r}" ry="${r}"/>
        </svg>
    `.trim();

    return {
        mask: Buffer.from(maskSvg),
        maskCutOutDimensions: [innerWidth, innerHeight],
        border: Buffer.from(borderSvg) // Buffer.from(`<svg></svg>`)
    };
}

module.exports = { createSvgMaskAndBorder };
