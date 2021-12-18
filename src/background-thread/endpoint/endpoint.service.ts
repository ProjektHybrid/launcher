import { BrowserWindow, ipcMain } from "electron";
import fetch from 'electron-fetch'

export interface IEndpoint {
  id: string;
  updateUrl: string;
  newsUrl: string;
  identificationUrl: string;
  floControllerHost: string;
  staticBaseUpdateFileUrl?: string;
}

const ENDPOINTS_PROD: IEndpoint[] = [
  // {
  //   id: "Europe",
  //   updateUrl: "https://update-service.w3champions.com/",
  //   newsUrl: "https://statistic-service.w3champions.com/",
  //   identificationUrl: "https://identification-service.w3champions.com/",
  //   floControllerHost: "service.w3flo.com",
  // },
  {
    id: "中国",
    updateUrl: "http://123.57.23.5:25053/",
    newsUrl: "http://123.57.23.5:25052/",
    identificationUrl: "http://123.57.23.5:25051/",
    floControllerHost: "ea2d46.pathx.ucloudgda.com",
    staticBaseUpdateFileUrl: 'https://w3champions.oss-cn-shanghai.aliyuncs.com/update-service-content/'
  },
];

const TEST_ENDPOINTS: IEndpoint[] = [
  {
    id: "PTR Europe",
    updateUrl: "https://update-service.test.w3champions.com/",
    newsUrl: "https://statistic-service.test.w3champions.com/",
    identificationUrl: "https://identification-service.test.w3champions.com/",
    floControllerHost: "157.90.1.251",
  }
]

export class EndpointService {
  private window: BrowserWindow | null = null

  constructor() {
    ipcMain.handle('w3c-select-endpoint', async (_evt: unknown, isTest: boolean) => {
      try {
        const endpoint = await this.selectFastestEndpoint(isTest);
        this.window?.webContents.send('w3c-endpoint-selected', endpoint);
      }
      catch(e) {
        console.log(e);
      }
    });
  }

  public setWindow(window: BrowserWindow) {
    this.window = window;
  }

  async selectFastestEndpoint(
    isTest: boolean
  ): Promise<IEndpoint> {
    let selected
    const endpoints = isTest ? TEST_ENDPOINTS : ENDPOINTS_PROD;
    selected = await Promise.any(
      endpoints.map(async (i) => {
        await fetch(`${i.updateUrl}api/client-version`);
        return i;
      })
    );
    return selected;
  }
}

export const endpontService = new EndpointService();
