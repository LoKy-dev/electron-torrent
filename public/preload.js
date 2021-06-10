const { contextBridge, ipcRenderer } = require('electron');

console.log(process.env);

// This method exposes the api object to the renderer process
// Direct object references like 'env: process.env' can't be done for security
// reasons, object destructuring is required 'env: {...process.env}'
contextBridge.exposeInMainWorld(
    'api',
    {
      electron: {
        ipcRenderer: {
          on (channel, listener) { ipcRenderer.on(channel, listener) },
          once: (channel, listener) => ipcRenderer.once(channel, listener),
          removeListener: (channel, listener) => ipcRenderer.removeListener(
              channel, listener),
          removeAllListeners: channel => ipcRenderer.removeAllListeners(channel),
          send: (channel, args) => ipcRenderer.send(channel, args),
          invoke: (channel, args) => ipcRenderer.invoke(channel, args),
          sendSync: (channel, args) => ipcRenderer.sendSync(channel, args),
          postMessage: (channel, message, transfer) => ipcRenderer.postMessage(
              channel, message, transfer),
          sendTo: (webContentsId, channel, args) => ipcRenderer.sendTo(
              webContentsId, channel, args),
          sendToHost: (channel, args) => ipcRenderer.sendToHost(channel, args),
        },
      },
      process: {
        env: {...process.env}
      },
    },
);
