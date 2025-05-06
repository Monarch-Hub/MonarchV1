const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const fs = require("fs");
const tmp = require("tmp");
const TempFiles = require("../helpers/TempFiles");
const { createSvgMaskAndBorder } = require("./svgMaskOverlay");

/**
 * Generates a PNG mask file from the SVG mask.
 * Returns the path to the generated mask image.
 */
async function generateMaskBorderImage(
    borderRadius,
    borderWidth,
    borderColor,
    imgSize,
    tempManager
) {
    const { mask, maskCutOutDimensions, border } = createSvgMaskAndBorder(
        borderRadius,
        borderWidth,
        borderColor,
        imgSize,
        true
    );
    // Create a temporary file name for the mask image.
    const maskPath = tmp.fileSync({ postfix: ".png" });
    const borderPath = tmp.fileSync({ postfix: ".png" });
    tempManager.addFile(maskPath, borderPath);
    await sharp(mask).png().toFile(maskPath.name);
    await sharp(border).png().toFile(borderPath.name);
    return { mask: maskPath, maskCutOutDimensions, border: borderPath };
}

/**
 * Helper function that applies the provided video filter chain and,
 * if border options are specified, composites the result with a mask.
 *
 * The final filter_complex graph produces a stream labeled [out],
 * which is then mapped to the output.
 */
async function processMedia(
    inputPath,
    outputPath,
    filter,
    isVideo,
    options = {},
    size
) {
    const {
        borderRadius = 0,
        borderWidth = 0,
        borderColor = "white",
        backgroundColor = "transparent",
        quality = 100
    } = options;
    const filterFirst = !Array.isArray(size);
    const useMask = parseInt(borderRadius) > 0 || borderWidth > 0;
    const tempManager = new TempFiles();

    let filterComplex = [];

    // Apply the video filter first if required
    if (filterFirst) {
        filterComplex.push({
            filter: filter,
            inputs: "0",
            outputs: "v"
        });
    } else {
        filterComplex.push({ filter: "null", inputs: "0:v", outputs: "v" });
    }

    // Generate and apply a mask if needed
    if (useMask) {
        const maskFilters = await generateMaskFilters(
            borderRadius,
            borderWidth,
            borderColor,
            size,
            tempManager
        );
        filterComplex.push(...maskFilters);
    } else {
        filterComplex.push({ filter: "null", inputs: "v", outputs: "ev" });
    }

    // Apply video filter after the mask if needed
    if (!filterFirst) {
        filterComplex[filterComplex.length - 1].outputs = "final";
        filterComplex.push({
            filter: filter,
            inputs: "final",
            outputs: "ev"
        });
    }

    // Apply the background overlay
    const backgroundFilters = await applyBackgroundFilter(
        backgroundColor,
        tempManager
    );
    filterComplex.push(...backgroundFilters);

    // Run FFmpeg with the constructed filter_complex
    const output = await processFilters(
        inputPath,
        outputPath,
        filterComplex,
        quality,
        isVideo
    );
    tempManager.clear();
    return output;
}

/**
 * Generates mask-related FFmpeg filters if border or mask options are specified.
 */
async function generateMaskFilters(
    borderRadius,
    borderWidth,
    borderColor,
    size,
    tempManager
) {
    const { mask, maskCutOutDimensions, border } =
        await generateMaskBorderImage(
            borderRadius,
            borderWidth,
            borderColor,
            size,
            tempManager
        );

    let pad = "512:512";
    if (Array.isArray(size)) pad = `${size[0]}:${size[1]}`;

    return [
        {
            inputs: "v",
            filter: `scale=${maskCutOutDimensions[0]}:${maskCutOutDimensions[1]}:force_original_aspect_ratio=none,pad=${pad}:-1:-1,format=yuva420p`,
            outputs: "fv"
        },
        { filter: "movie", options: mask.name, outputs: "m" },
        { filter: "format", options: "rgba", inputs: "m", outputs: "mask" },
        { filter: "alphamerge", inputs: ["fv", "mask"], outputs: "mv" },
        { filter: "movie", options: border.name, outputs: "b" },
        {
            filter: "format",
            options: "rgba",
            inputs: "b",
            outputs: "border"
        },
        { filter: "overlay", inputs: ["mv", "border"], outputs: "ev" }
    ];
}

/**
 * Creates and applies a background overlay to the video.
 */
async function applyBackgroundFilter(backgroundColor, tempManager) {
    const backgroundImage = tmp.fileSync({ postfix: ".png" });
    tempManager.addFile(backgroundImage);

    await sharp({
        create: {
            width: 512,
            height: 512,
            channels: 4,
            background: backgroundColor
        }
    })
        .png()
        .toFile(backgroundImage.name);

    return [
        { filter: "movie", options: backgroundImage.name, outputs: "bg" },
        {
            filter: "format",
            options: "yuva420p",
            inputs: "bg",
            outputs: "background"
        },
        {
            filter: "overlay=x=(W-w)/2:y=(H-h)/2",
            inputs: ["background", "ev"]
        }
    ];
}

/**
 * Executes FFmpeg with the given filter_complex.
 */
function processFilters(
    inputPath,
    outputPath,
    filterComplex,
    quality,
    isVideo
) {
    return new Promise((resolve, reject) => {
        const process = ffmpeg(inputPath)
            .complexFilter(filterComplex)
            .output(outputPath)
            .outputOptions(["-quality", `${quality}`, "-pix_fmt", "rgba"])
            .on("end", () => {
                console.log(`Processed video saved: ${outputPath}`);
                resolve(fs.readFileSync(outputPath));
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
            .on("error", reject);
        if (isVideo) {
            process.outputOptions([
                "-loop",
                "0",
                "-lossless",
                "1",
                "-c:v",
                "qtrle",
                "-pix_fmt",
                "argb"
            ]);
        }

        process.run();
    });
}

function getDimensions(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) reject(err);
            const videoStream = metadata.streams.find(
                stream => stream.codec_type === "video"
            );
            const dimensions = [videoStream.width, videoStream.height];
            resolve(dimensions);
        });
    });
}

module.exports = { processMedia, processFilters, getDimensions };
