const { version } = require("../../../package.json");
const fs = require("fs");
const axios = require("axios");
const mimes = require("mime-types");
const { default: fileType } = require("magic-bytes.js");

/*
 * Checks if the provided string is a valid URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isUrl(url) {
    const pattern = new RegExp(
        "^((https|http)?:\\/\\/)?" + // protocol
            "((([a-z0-9]+([\\-\\.][a-z0-9]+)*\\.)+[a-z]{2,}|localhost|" + // domain name
            "(([0-9]{1,3}\\.){3}[0-9]{1,3}))" + // OR ip (v4) address
            "(\\:[0-9]{1,5})?)" + // optional port
            "(\\/.*)?$"
    ); // path
    return pattern.test(url);
}

/*
 * Gets file information from buffer.
 * @param {Buffer} buffer - The buffer to fetch info from.
 * @returns {object} - An object containinhe the file data.
 */
function fileTypeFromBuffer(buffer) {
    const type = fileType(buffer)[0];
    if (type) return { mime: type.mime, ext: type.extension };
    return {
        mime: "application/octet-stream",
        ext: ".bin"
    };
}

function fetchBuffer(string, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            if (isUrl(string)) {
                let data = await axios.get(string, {
                    headers: {
                        "User-Agent": `wa-sticker-maker/${version}`,
                        ...(!!options.headers ? options.headers : {})
                    },
                    responseType: "arraybuffer",
                    ...options
                });
                let buffer = await data?.data;
                let name = /filename/i.test(
                    data.headers?.get("content-disposition")
                )
                    ? data.headers
                          ?.get("content-disposition")
                          ?.match(/filename=(.*)/)?.[1]
                          ?.replace(/["';]/g, "")
                    : "";
                let mime =
                    mimes.lookup(name) ||
                    data.headers.get("content-type") ||
                    fileType(buffer)[0]?.mimetype;
                resolve({
                    data: buffer,
                    size:
                        data.headers.get("content-length") ||
                        Buffer.byteLength(buffer),
                    name,
                    mime,
                    ext: mimes.extension(mime)
                });
            } else if (/^data:.*?\/.*?;base64,/i.test(string)) {
                let data = Buffer.from(string.split`,`[1], "base64");
                let size = Buffer.byteLength(data);
                resolve({
                    data,
                    size,
                    ...fileTypeFromBuffer(data)
                });
            } else if (fs.existsSync(string) && fs.statSync(string).isFile()) {
                let data = fs.readFileSync(string);
                let size = Buffer.byteLength(data);
                resolve({
                    data,
                    size,
                    ...fileTypeFromBuffer(data)
                });
            } else if (Buffer.isBuffer(string)) {
                let size = Buffer.byteLength(string) || 0;
                resolve({
                    data: string,
                    size,
                    ...fileTypeFromBuffer(string)
                });
            } else if (/^[a-zA-Z0-9+/]={0,2}$/i.test(string)) {
                let data = Buffer.from(string, "base64");
                let size = Buffer.byteLength(data);
                resolve({
                    data,
                    size,
                    ...fileTypeFromBuffer(data)
                });
            } else if (/^\s*<svg\b[^>]*>[\s\S]*<\/svg>\s*$/.test(string)) {
                const data = Buffer.from(string, "utf-8");
                let size = Buffer.byteLength(data);
                resolve({
                    data,
                    size,
                    mime: "image/svg+xml",
                    ext: "svg"
                });
            }
            reject(new Error("fetchBuffer: Invlaid Input verify the input"));
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
}

module.exports = fetchBuffer;
