const { ipcRenderer } = require('electron');

let isInitialized = false;

let folderButton = document.getElementById('chooseFolder');
let torrentButton = document.getElementById('chooseTorrent');
let startButton = document.getElementById('startDownload');
let reportsDiv = document.getElementById('reports');

// Chose folder event
folderButton.addEventListener('click', () => {
  ipcRenderer.send('choose-download-folder');
});
// Main process confirmation
ipcRenderer.on('folder-selection-result',(event, arg) => {
  if (!arg.success) return;

  let parent = folderButton.parentElement;
  let text = document.createTextNode(arg.folderPath);

  while (parent.firstChild) parent.removeChild(parent.firstChild);

  parent.appendChild(folderButton);
  parent.appendChild(text);
});


// "scripts": {
//   "start": "electron . --dev",
//       "test": "echo \"Error: no test specified\" && exit 1",
//       "pack-windows-portable": "electron-builder -w",
//       "pack": "electron-builder -nwl"
// },

// Choose file event
torrentButton.addEventListener('click', () => {
  ipcRenderer.send('select-torrent-file');
});
// Main process confirmation
ipcRenderer.on('torrent-selection-result',(event, arg) => {
  if (!arg.success) return;

  let parent = torrentButton.parentElement;
  let text = document.createTextNode(arg.filename);

  while (parent.firstChild) parent.removeChild(parent.firstChild);

  parent.appendChild(torrentButton);
  parent.appendChild(text);
});

// Start download event
startButton.addEventListener('click', () => {
  ipcRenderer.send('start-download');
});
// Main process confirmation TODO DOC
ipcRenderer.on('download-init',(event) => {
  document.body.appendChild(document.createTextNode('Inizializzazione in corso...'));

  console.log('download-init');
});

// TODO DOC
ipcRenderer.on('download-init-completed',(event, arg) => {
  isInitialized = true;
  document.body.appendChild(document.createTextNode('Inizializzazione completata'));

  arg.files.forEach(el => {
    let div = document.createElement('div');
    div.setAttribute('class', 'progress');
    let span = document.createElement('span');
    span.setAttribute('id', el.id);
    span.style.width = el.progress + '%';

    div.appendChild(span);
    reportsDiv.appendChild(div);
  })

  console.log('download-init-completed');
});

// TODO DOC
ipcRenderer.on('download-update',(event, arg) => {
  if (!isInitialized) return;

  arg.files.forEach(el => {
    let progressBar = document.getElementById(el.id);

    progressBar.style.width = el.progress + '%';
  })
});

// TODO DOC
ipcRenderer.on('download-completed',(event, arg) => {
  if (!isInitialized) return;

  document.body.appendChild(document.createTextNode('Download completato'))
});

// // Pause download event
// document.getElementById('pauseDownload').addEventListener('click', () => {
//   ipcRenderer.send('choose-download-folder');
// });
// // Main process confirmation
// ipcRenderer.on('folder-selection-result',(event, arg) => {
//   if (!arg.success) return;
//
//   console.log(arg);
// });


// Stop download event
// document.getElementById('stopDownload').addEventListener('click', () => {
//   ipcRenderer.send('choose-download-folder');
// });
// // Main process confirmation
// ipcRenderer.on('folder-selection-result',(event, arg) => {
//   if (!arg.success) return;
//
//   console.log(arg);
// });

console.log(`${process.env.USERPROFILE}\\Downloads`);
console.log(process.env);
console.log(process.defaultApp);

ipcRenderer.on('main-process-log', (event, arg) => {
  console.log('Main:', arg);
});
ipcRenderer.send('main-process-log-start');