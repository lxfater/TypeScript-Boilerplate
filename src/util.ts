import { readFileSync, writeFile, writeFileSync } from "fs";
import { join } from "path";
import xlsl, { writeXLSX } from "xlsx"

export function transform() {
    let filePath = join(__dirname, './input.xlsx')
    let workbook = xlsl.readFile(filePath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data: Array<Project> = xlsl.utils.sheet_to_json(worksheet, {raw: false});
    interface Project {
        '项目id': string,
        '项目名称': string,
        '模型日期': string,
        'tileset文件url': string,
        'tileset文件所在路径': string
    }
    let map = new Map<string, Record<string,Project>>()
    for (const item of data) {
        const { 项目id: projectId } = item;
        if (map.has(projectId)) {
            let object = map.get(projectId);
            //@ts-ignore
            object[item.模型日期] = item
            //@ts-ignore
            map.set(projectId, object)
        } else {
            let object = {
                [item.模型日期]: item
            }
            map.set(projectId, object)
        }
    }

   writeFileSync(join(__dirname, 'output.json'),JSON.stringify(Object.fromEntries(map)))

}