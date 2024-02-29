import { BrowserWindow, Menu } from 'electron'
import log from 'electron-log/main'
import os from 'os'
import path from 'path'
import Store from 'electron-store'
import * as remoteMain from '@electron/remote/main'

remoteMain.initialize()
const store = new Store()
let mainWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function destroyMainWindow(): void {
  if (!mainWindow) return
  log.info('destroyMainWindow')
  mainWindow.close()
  mainWindow = null
}

export async function createMainWindow(): Promise<void> {
  destroyMainWindow()
  log.info('createMainWindow')
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '/../public/logo.png'),
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    resizable: true,
    show: false,
    title: 'MCSL main',
    transparent: os.platform() === 'win32',
    frame: os.platform() !== 'win32',
    titleBarStyle: os.platform() === 'win32' ? 'hidden' : 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  remoteMain.enable(mainWindow.webContents)
  Menu.setApplicationMenu(null)
  mainWindow.setMenuBarVisibility(false)
  if (process.env.VITE_DEV_SERVER_URL) {
    // noinspection ES6MissingAwait
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // noinspection ES6MissingAwait
    mainWindow.loadFile(path.join(__dirname, '../.output/public/index.html'))
  }
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      store.get('MCSL-Maximized-At-Startup') && mainWindow.maximize()
      mainWindow.show()
    }
  })
}

export function sendMainWindowWebContent(channel: string, args: any): void {
  if (!mainWindow) return
  return mainWindow.webContents.send(channel, args)
}
