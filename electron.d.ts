export interface IElectronAPI {
  saveFile: (data: string) => Promise<void>;
  restoreFromFile: () => Promise<string | null>;
  launchDiscord: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}