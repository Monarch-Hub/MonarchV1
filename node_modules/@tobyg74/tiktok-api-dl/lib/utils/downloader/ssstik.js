"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSSTik = void 0;
const axios_1 = __importDefault(require("axios"));
const async_retry_1 = __importDefault(require("async-retry"));
const cheerio_1 = require("cheerio");
const api_1 = require("../../constants/api");
const https_proxy_agent_1 = require("https-proxy-agent");
const socks_proxy_agent_1 = require("socks-proxy-agent");
const TiktokURLregex = /https:\/\/(?:m|www|vm|vt|lite)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video|photo)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;
const fetchTT = (proxy) => new Promise(async (resolve) => {
    (0, axios_1.default)(api_1._ssstikurl, {
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0"
        },
        httpsAgent: (proxy &&
            (proxy.startsWith("http") || proxy.startsWith("https")
                ? new https_proxy_agent_1.HttpsProxyAgent(proxy)
                : proxy.startsWith("socks")
                    ? new socks_proxy_agent_1.SocksProxyAgent(proxy)
                    : undefined)) ||
            undefined
    })
        .then(({ data }) => {
        const regex = /s_tt\s*=\s*["']([^"']+)["']/;
        const match = data.match(regex);
        if (match) {
            const value = match[1];
            return resolve({ status: "success", result: value });
        }
        else {
            return resolve({
                status: "error",
                message: "Failed to get the request form!"
            });
        }
    })
        .catch((e) => resolve({ status: "error", message: e.message }));
});
const SSSTik = (url, proxy) => new Promise(async (resolve) => {
    try {
        if (!TiktokURLregex.test(url)) {
            return resolve({
                status: "error",
                message: "Invalid Tiktok URL. Make sure your url is correct!"
            });
        }
        const tt = await fetchTT(proxy);
        if (tt.status !== "success")
            return resolve({ status: "error", message: tt.message });
        const response = (0, async_retry_1.default)(async () => {
            const res = await (0, axios_1.default)(api_1._ssstikapi, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Origin: api_1._ssstikurl,
                    Referer: api_1._ssstikurl + "/en",
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/111.0"
                },
                data: new URLSearchParams(Object.entries({
                    id: url,
                    locale: "en",
                    tt: tt.result
                })),
                httpsAgent: (proxy &&
                    (proxy.startsWith("http") || proxy.startsWith("https")
                        ? new https_proxy_agent_1.HttpsProxyAgent(proxy)
                        : proxy.startsWith("socks")
                            ? new socks_proxy_agent_1.SocksProxyAgent(proxy)
                            : undefined)) ||
                    undefined
            });
            if (res.status === 200 && res.data !== "")
                return res.data;
            throw new Error("Failed to fetch data from SSSTik!");
        }, {
            retries: 20,
            minTimeout: 200,
            maxTimeout: 1000
        });
        const $ = (0, cheerio_1.load)(await response);
        const author = {
            avatar: $("img.result_author").attr("src"),
            nickname: $("h2").text().trim()
        };
        const statistics = {
            likeCount: $("#trending-actions > .justify-content-start")
                .text()
                .trim(),
            commentCount: $("#trending-actions > .justify-content-center")
                .text()
                .trim(),
            shareCount: $("#trending-actions > .justify-content-end").text().trim()
        };
        const video = $("a.without_watermark").attr("href");
        const music = $("a.music").attr("href");
        const direct = $("a.music_direct").attr("href");
        const images = [];
        $("ul.splide__list > li")
            .get()
            .map((img) => {
            images.push($(img).find("a").attr("href"));
        });
        let result;
        if (images.length !== 0) {
            result = {
                type: "image",
                desc: $("p.maintext").text().trim(),
                author,
                statistics,
                images
            };
            if (music) {
                result.music = music;
            }
        }
        else if (video) {
            result = {
                type: "video",
                desc: $("p.maintext").text().trim(),
                author,
                statistics,
                video
            };
            if (music) {
                result.music = music;
            }
        }
        else if (music) {
            result = {
                type: "music",
                music,
                direct: direct || "",
            };
        }
        resolve({ status: "success", result });
    }
    catch (err) {
        resolve({ status: "error", message: err.message });
    }
});
exports.SSSTik = SSSTik;
