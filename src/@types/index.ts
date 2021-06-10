import Electron from 'electron';

declare global {
  export interface Window {
    api: {
      electron: {
        isDev: boolean
        ipcRenderer: Electron.IpcRenderer
      }
      process: {
        env: NodeJS.ProcessEnv
      }
    }
  }
}

export {}