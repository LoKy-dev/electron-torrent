// Modules to control application life and create native browser window
const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
const WebTorrent = require('webtorrent')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      // To allow use of require() inside renderer process
      nodeIntegration: true,
      // Don't know what it does TODO Capire cosa fa
      contextIsolation: false,
      //preload: path.join(__dirname, 'preload.js')
    }
  });

  // To hide the "File Edit View Navigate" bar
  mainWindow.setMenuBarVisibility(false);

  // and load the index.html of the app.
  mainWindow
      .loadURL(
          // If this environment variable is set to true the app will load the React web server
          process.env.ELECTRON_USE_REACT_SERVER
              ? 'http://localhost:3000'
              : `file://${path.join(__dirname, '../build/index.html')}`)
      .then(_ => {});

  // Open the DevTools.
  if (isDev) mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// --- END OF BOILERPLATE CODE

// Adding useful method to check file identity
String.prototype.hashCode = function () {
  let hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

String.prototype.hashCodeString = function () {
  let result = `${this.hashCode()}`;
  //return 'Ox' + (result[0] === '-' ? 'n' : 'p') + result.substring(1);
  return `Ox${result[0] === '-' ? '0' : '1'}${result.substring(1)}`;
};

let ipcSender;
// Log to renderer console
ipcMain.on('main-process-log-start', event => {
  ipcSender = event.sender;
  console.log('Log channel opened');
  // ipcSender.send('main-process-log', {dummy: 'data'});
});

// --- Adding listeners to renderer process calls
let folderPath;
let torrentPath;

// React to choose-download-folder event
ipcMain.on('choose-download-folder', (event, arg) => {
  let replyChannel = 'folder-selection-result';
  let dialogLog = dialog.showOpenDialog({
    title: 'Scegli la cartella in cui eseguire il download',
    properties: ['openDirectory']
  }).then(value => {
    // Checks if the user close the dialog without selecting
    if (value.canceled) {
      event.reply(replyChannel, { success: false });
      return;
    }

    folderPath = value.filePaths[0];

    if (ipcSender) ipcSender.send('main-process-log', {folderPath: folderPath});

    // Sending back the download folder path
    event.reply(replyChannel, {
      success: true,
      folderPath: folderPath
    });
  }).catch(err => {
    console.log(err);
  });
});

// React to select-torrent-file event
ipcMain.on('select-torrent-file',(event, arg) => {
  let replyChannel = 'torrent-selection-result';
  let dialogLog = dialog.showOpenDialog({
    title: 'Scegli il file torrent',
    filters: [
      { name: 'Torrent files', extensions: ['torrent'] }
    ],
    properties: ['openFile']
  }).then(value => {
    // Checks if the user close the dialog without selecting
    if (value.canceled) {
      event.reply(replyChannel, { success: false });
      return;
    }

    torrentPath = value.filePaths[0];

    if (ipcSender) ipcSender.send('main-process-log', {folderPath: folderPath});

    // TODO Check for file integrity
    // Sending back the torrent file path
    event.reply(replyChannel, {
      success: true,
      filename: torrentPath
    });
  }).catch(err => {
    console.log(err);
  });
});

// React to start-download event
ipcMain.on('start-download', (event, arg) => {
  if (!folderPath || !torrentPath) return;

  event.reply('download-init');

  // Initializing WebTorrent
  let client = new WebTorrent();

  //
  client.add(torrentPath, { path: `${folderPath}\\` }, function (torrent) {
    let logObj = {
      progress: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      lastDownloadedBytes: 0,
      downloadedBytes: 0,
      files: []
    }

    event.reply('download-init-completed', {
      files: torrent.files.map(el => ({
        id: el.name.hashCodeString(),
        progress: Math.floor(el.progress * 100),
        name: el.name
      }))
    });

    let canUpdate = true;

    torrent.on('download', bytes => {
      if (!canUpdate) return;

      // Updating local object
      logObj.progress = torrent.progress;
      logObj.downloadSpeed = torrent.downloadSpeed;
      logObj.uploadSpeed = torrent.uploadSpeed;
      logObj.lastDownloadedBytes = bytes;
      logObj.downloadedBytes = torrent.downloaded;
      logObj.files = torrent.files.map(el => ({
        id: el.name.hashCodeString(),
        progress: Math.floor(el.progress * 100),
        name: el.name
      }));
      canUpdate = false;
    })

    let downloadUpdateInterval = setInterval(() => {
      canUpdate = true;
      event.reply('download-update', logObj);
    }, 1000 / 2);

    torrent.on('done', () => {
      clearInterval(downloadUpdateInterval);
      event.reply('download-completed');
    });
  });
});
