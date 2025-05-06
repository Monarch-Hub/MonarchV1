const { processMedia, getDimensions } = require("./internal/mediaProcessor");

/**
 * cropMedia: Center-crops the Media to 512×512.
 * Uses FFmpeg’s crop filter.
 */
async function cropMedia(inputPath, outputPath, isVideo, options = {}) {
    // Crop filter: center crop to 512x512, then output in RGBA.
    const filter =
        "scale=512:512:force_original_aspect_ratio=increase,crop=512:512:(iw-512)/2:(ih-512)/2,format=yuva420p";

    await processMedia(inputPath, outputPath, filter, isVideo, options);
}

/**
 * shrinkMedia: Scales the Media to fit within 512×512 while preserving aspect ratio,
 * adding letterboxes/pillarboxes with the specified background color.
 */
async function shrinkMedia(inputPath, outputPath, isVideo, options = {}) {
    const { backgroundColor = "transparent" } = options;
    const dimensions = await getDimensions(inputPath);
    // Scale (with force_original_aspect_ratio=decrease).
    const filter = `scale=512:512:force_original_aspect_ratio=decrease,format=yuva420p`;

    await processMedia(
        inputPath,
        outputPath,
        filter,
        isVideo,
        options,
        dimensions
    );
}

/**
 * fillMedia: Scales the Media so it completely fills a 512×512 area,
 * cropping as needed.
 */
async function fillMedia(inputPath, outputPath, isVideo, options = {}) {
    // Scale with force_original_aspect_ratio=none then crop to 512x512.
    const filter =
        "scale=512:512:force_original_aspect_ratio=none,crop=512:512,format=yuva420p";

    await processMedia(inputPath, outputPath, filter, isVideo, options);
}

/**
 * makeCircularMedia: Processes the Media (using a fill approach)
 * and applies a circular mask.
 * Note: The borderRadius is overridden to “50%” for a perfect circle.
 */
async function makeCircularMedia(inputPath, outputPath, isVideo, options = {}) {
    options.borderRadius = "50%";
    // Use the crop mode to ensure the entire frame is used.
    const filter =
        "scale=512:512:force_original_aspect_ratio=increase,crop=512:512:(iw-512)/2:(ih-512)/2,format=rgba";

    await processMedia(inputPath, outputPath, filter, isVideo, options);
}

module.exports = {
    cropMedia,
    shrinkMedia,
    makeCircularMedia,
    fillMedia
};
