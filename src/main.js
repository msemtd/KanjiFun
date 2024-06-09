import debug from 'debug'
import fs from 'fs-extra'
import path from 'path'
import { URL, pathToFileURL } from 'node:url'
import { app, BrowserWindow, ipcMain, Menu, net, protocol, dialog, shell } from 'electron'

const dbg = debug('main')
debug.enable('main')
dbg('starting')
let mainWindow = null
let kvgDir = ''
const staticDir = path.join(path.resolve(__dirname), '..', 'main', 'static')
protocol.registerSchemesAsPrivileged([
  { scheme: 'kvg', privileges: { standard: true, secure: true, supportFetchAPI: true, bypassCSP: true } }
])
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

Menu.setApplicationMenu(null)
app.whenReady().then(() => {
  ipcMain.on('settings', (event, ...args) => { settingsFromRenderer(...args) })
  // Handler for kvg = an SVG request coming in from a three-js loader
  const p = 'kvg'
  protocol.handle(p, (request) => {
    const incomingUrl = request.url
    dbg('incomingUrl...', incomingUrl)
    let c = incomingUrl.slice(`${p}://`.length)
    dbg('chopped = ' + c)
    // for some reason the drive colon is lost in the URL mangling of THREE
    // loaders and the net module doesn't understand the remains
    // We try to re-insert that here...
    if (c[1] === '/') {
      c = c[0] + ':' + c.slice(1)
    }
    dbg('patched drive = ' + c)
    const fileUrl = pathToFileURL(c)
    // const r = 'file://' + '/' + c
    // dbg('file url = ', r)
    dbg('fileUrl...', fileUrl)
    return net.fetch(fileUrl.href)
  })
  // The HandyApi...
  ipcMain.handle('pickFile', pickFile)
  ipcMain.handle('pickDir', pickDir)
  ipcMain.handle('slurp', async (event, ...args) => { return await slurp(...args) })
  ipcMain.handle('shellOpenPath', async (event, ...args) => { return await shellOpenPath(...args) })
  ipcMain.handle('readDir', async (event, ...args) => { return await readDir(...args) })
  ipcMain.handle('pathParse', (event, ...args) => { return pathParse(...args) })
  ipcMain.handle('pathJoin', (event, ...args) => { return pathJoin(...args) })
  ipcMain.handle('outputFile', (event, ...args) => { return outputFile(...args) })
})

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon: path.join(process.cwd(), 'KanjiFun.ico'),
    fullscreen: true,
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && !input.control && !input.alt && !input.meta && !input.shift) {
      mainWindow.webContents.openDevTools()
      event.preventDefault()
    }
  })
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && !input.control && !input.alt && !input.meta && !input.shift) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
      event.preventDefault()
    }
  })
  // eslint-disable-next-line no-undef
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// -----------------------------------------------------------------------------
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
async function settingsFromRenderer (settings) {
  dbg('settingsFromRenderer', settings)
  kvgDir = settings.kvgDir
}

async function pickDir () {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result.canceled ? '' : result.filePaths.length ? result.filePaths[0] : ''
}

async function pickFile () {
  const result = await dialog.showOpenDialog(mainWindow, {
  })
  return result
}

async function readDir (path) {
  return await fs.readdir(path)
}

function pathParse (...args) {
  return path.parse(...args)
}

function pathJoin (...args) {
  return path.join(...args)
}

async function slurp (fp, options) {
  options ??= {
    json: false,
    text: true,
    split: '',
  }
  if (options.json) {
    return await fs.readJSON(fp)
  }
  const opts = {
    encoding: options.text ? 'utf8' : null
  }
  const data = await fs.readFile(fp, opts)
  if (options.text && options.split) {
    const lines = data.split(options.split)
    return lines
  }
  return data
}

async function outputFile (...args) {
  return await fs.outputFile(...args)
}

async function shellOpenPath (path) {
  return await shell.openPath(path)
}
