// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('settings', {
  passSettingsToMain: (...args) => ipcRenderer.send('settings', ...args),
})
// NB: everything in handy API uses invoke and is therefore async
contextBridge.exposeInMainWorld('handy', {
  pickDir: (...args) => ipcRenderer.invoke('pickDir', ...args),
  pickFile: (...args) => ipcRenderer.invoke('pickFile', ...args),
  slurp: (filePath, options) => ipcRenderer.invoke('slurp', filePath, options),
  readDir: (path) => ipcRenderer.invoke('readDir', path),
  pathParse: (...args) => ipcRenderer.invoke('pathParse', ...args),
  pathJoin: (...args) => ipcRenderer.invoke('pathJoin', ...args),
  outputFile: (...args) => ipcRenderer.invoke('outputFile', ...args),
})
