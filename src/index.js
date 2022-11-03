"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
function screenshot(page, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield page.evaluate((selector) => {
            //@ts-ignore
            let canvasGl = document.querySelector(selector);
            // 无法序列化
            let gl = canvasGl.getContext('webgl2', { preserveDrawingBuffer: true });
            //建立像素集合
            let pixels = new Uint8Array(canvasGl.width * canvasGl.height * 4);
            //从缓冲区读取像素数据，然后将其装到事先建立好的像素集合里
            //@ts-ignore
            gl.readPixels(0, 0, canvasGl.width, canvasGl.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            //基于像素集合和尺寸建立ImageData 对象
            //@ts-ignore
            let imageData = new ImageData(new Uint8ClampedArray(pixels), canvasGl.width, canvasGl.height);
            //@ts-ignore
            return imageData;
        }, selector);
        let path = (0, path_1.join)(__dirname, 'index.png');
        (0, fs_1.writeFileSync)(path, result.data);
    });
}
function readSetting(path) {
    return JSON.parse((0, fs_1.readFileSync)(path, {
        encoding: 'utf-8'
    }));
}
function clipJob(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let setting = readSetting(configPath);
        console.log(setting, '???');
        const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
        const options = {
            executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
            args: [`--window-size=1920,1080`, `--use-gl=angle`],
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        };
        const browser = yield puppeteer_core_1.default.launch(options);
        const page = yield browser.newPage();
        const target = "http://localhost:8080/";
        function toTaget() {
            return __awaiter(this, void 0, void 0, function* () {
                yield page.goto(target);
                yield page.waitForTimeout(10000);
            });
        }
        yield toTaget();
        screenshot(page, "#cesiumContainer > div > div.cesium-viewer-cesiumWidgetContainer > div > canvas");
    });
}
clipJob('./src/setting.json');
//# sourceMappingURL=index.js.map