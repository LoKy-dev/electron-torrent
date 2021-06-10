import Electron from 'electron';

declare global {
  export interface Window {
    api: {
      electron: {
        ipcRenderer: Electron.IpcRenderer
      }
      process: {
        env: NodeJS.ProcessEnv
      }
    }
  }
}

export {}