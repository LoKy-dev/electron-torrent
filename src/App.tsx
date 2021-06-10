import React, { Component } from 'react';

const { electron, process } = window.api;
const { ipcRenderer } = electron;

interface AppState {
  torrentFilePath: string
  downloadFolderPath: string
}

class App extends Component<any, AppState> {
  public readonly state: Readonly<AppState> = {
    torrentFilePath: '',
    downloadFolderPath: ''
  }

  constructor(props: Readonly<any>) {
    super(props);
    // console.log('App - Constructed: ', this.state);

    // console.log(`${process.env.USERPROFILE}\\Downloads`);
    if (electron.isDev) {
      ipcRenderer.on('main-process-log', (event: any, arg: any) => {
        console.log('Main:', arg);
      });
      ipcRenderer.send('main-process-log-start');
    }
  }

  render() {
    return (
      <div>Tests</div>
    );
  }

  componentDidMount() {
    console.log('App - Mounted');
  }
}

export default App;
