import { mkdir, mkdirSync, readFileSync, writeFile, writeFileSync } from 'fs';
import { join } from 'path';
import { exit } from 'process';
import puppeteer, { Page } from 'puppeteer-core';
export interface Project {
    '项目id': string,
    '项目名称': string,
    '模型日期': number,
    'tileset文件url': string,
    'tileset文件所在路径': string
}
type serializedCamera = {
    position: number[];
    direction: number[];
    up: number[];
    right: number[];
    frustum: {
        aspectRatio: number;
        far: number;
        near: number;
        width: number;
    };
}
type NodeType = 0 | 1 | 2 | 3
interface Config {
    camera?: serializedCamera
    positions?: Array<Array<number>>
    url?: string,
    projects: Array<Project>,
    size?: Array<number>
    id?: string
}
interface Meta {
    type: NodeType
    config?: Config
}
interface Tree {
    label: string
    children?: Tree[]
    meta: Meta
}

const transformRawUrl = (rawUrl: string) => {
    return `${new URL(rawUrl).pathname}`
}

async function screenshot(page: Page, path: string) {
    let dataURI = await page.evaluate(async () => {
        //@ts-ignore
        return  window.cesiumViewer.captureUrl()
    });

    let data = dataURI.split(',')[1]; 
    let buf = Buffer.from(data,'base64')
    writeFileSync(path, buf)
}

async function render(page: Page) {
    await page.evaluate(async () => {
        //@ts-ignore
        return  window.cesiumViewer.render();
    });
}

async function goto(page: Page, config: Config) {
    await page.evaluate(async (config: Config) => {
        //@ts-ignore
        return  window.cesiumViewer.goto(config)
    }, config);
}
function readSetting(path:string) {
    return JSON.parse(readFileSync(path,{
        encoding: 'utf-8'
    }))
}
async function clipJob(configPath: string) {
    
    const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    const options = {
        executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
        args: [`--window-size=1920,1080`, `--use-gl=angle` , `--js-flags="--max-old-space-size=4096"` ], // 解决无头浏览器的webgl不显示问题 `--use-gl=egl`
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    }
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    const target = "http://localhost:8080/"
    async function toTarget() {
        await page.goto(target);
        await page.waitForNetworkIdle()
    }

    await toTarget()

    let setting:[Tree] = readSetting(configPath)
    let projects = setting[0].children as Tree[];

    let path = [];
    for (const project of projects) {
        const jobs = project.meta.config!.projects;
        const children = project.children as Tree[]
        path.push(project.label)
        for (const child of children) {
            const grandChild = child.children as Tree[]
            path.push(child.label)
            for await (const job of jobs) {
                path.push(job.模型日期)
                let dirConfig = join(__dirname, '../', 'data')
                let dir = join(dirConfig, path.join('/'))
                mkdirSync(dir, {
                    recursive: true
                })
                for (const c of grandChild) {
                    let config = c.meta.config as Config;
                    let url = transformRawUrl(job.tileset文件url);
                    config!.url = url;
                    await page.setViewport({
                        width: config?.size![0],
                        height: config?.size![1],
                        deviceScaleFactor: 1,
                    })
                    await goto(page, config)
                    await page.waitForNetworkIdle()
                    await page.waitForTimeout(500)
                    let path = join(dir, `${c.label}.png`)
                    await screenshot(page, path)
                }
                path.pop()
            }
            path.pop()
        }
        path.pop()
    }

    exit();

}
clipJob('./src/setting.json');

