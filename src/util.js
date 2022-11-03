"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const xlsx_1 = __importDefault(require("xlsx"));
function transform() {
    let filePath = (0, path_1.join)(__dirname, './input.xlsx');
    let workbook = xlsx_1.default.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx_1.default.utils.sheet_to_json(worksheet, { raw: false });
    let map = new Map();
    for (const item of data) {
        const { 项目id: projectId } = item;
        if (map.has(projectId)) {
            let object = map.get(projectId);
            //@ts-ignore
            object[item.模型日期] = item;
            //@ts-ignore
            map.set(projectId, object);
        }
        else {
            let object = {
                [item.模型日期]: item
            };
            map.set(projectId, object);
        }
    }
    (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, 'output.json'), JSON.stringify(Object.fromEntries(map)));
}
exports.transform = transform;
//# sourceMappingURL=util.js.map