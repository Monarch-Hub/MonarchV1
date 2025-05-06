const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const tmp = require("tmp");

const TextPositions = Object.freeze({
    TOP: "top",
    CENTER: "center",
    BOTTOM: "bottom"
});

/**
 * Adds text to static/animated webp using ffmpeg.
 */
function addTextToMedia(inputBuffer, content, options = {}, isVideo) {
    const text = content;
    const textColor = options.color || "white";
    const font = options.font || "Sans";
    const fontSize = options.fontSize || options.size || 31;
    const position = options.position || "center";

    const filters = {
        top: `drawtext=text='${text}':x=(w-text_w)/2:y=20:fontsize=${fontSize}:fontcolor=${textColor}:font='${font}'`,
        center: `drawtext=text='${text}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=${fontSize}:fontcolor=${textColor}:font='${font}'`,
        bottom: `drawtext=text='${text}':x=(w-text_w)/2:y=h-text_h-20:fontsize=${fontSize}:fontcolor=${textColor}:font='${font}'`
    };

    const codec = isVideo ? "qtrle" : "libwebp";
    const ext = isVideo ? ".mov" : ".webp";

    const inputFile = tmp.fileSync();
    const outputFile = tmp.fileSync({ postfix: ext });

    fs.writeFileSync(inputFile.name, inputBuffer);

    return new Promise((resolve, reject) => {
        ffmpeg(inputFile.name)
            .output(outputFile.name)
            .videoFilters(filters[position])
            .outputOptions(["-c:v", codec])
            .on("end", () => {
                console.log("done");
                const outputBuffer = fs.readFileSync(outputFile.name);
                resolve(outputBuffer);
                inputFile.removeCallback();
                outputFile.removeCallback();
            })
            .on("error", err => {
                reject(err);
                console.log(err);
                inputFile.removeCallback();
                outputFile.removeCallback();
            })
            .run();
    });
}

// Example usage:
// const inputBuffer = fs.readFileSync("input.webp");
// addTextToMedia(inputBuffer, "Hello, WebP!", { fontSize: 50, color: "red", gravity: "southwest" })
//     .then((outputBuffer) => fs.writeFileSync("output.webp", outputBuffer))
//     .catch(console.error);

module.exports = { addTextToMedia, TextPositions };
