import { BrowserWindow, Menu } from 'electron'
import log from 'electron-log/main'
import os from 'os'
import path from 'path'

let updateWindow: BrowserWindow | null = null

export function getUpdateWindow(): BrowserWindow | null {
  return updateWindow
}

export function destroyUpdateWindow(): void {
  if (!updateWindow) return
  log.info('destroyUpdateWindow')
  updateWindow.close()
  updateWindow = null
}

export async function createUpdateWindow(): Promise<void> {
  destroyUpdateWindow()
  log.info('createUpdateWindow')
  updateWindow = new BrowserWindow({
    icon: path.join(__dirname, '/../public/logo.png'),
    width: 616,
    height: 840,
    resizable: false,
    show: false,
    title: 'Update',
    transparent: os.platform() === 'win32',
    frame: os.platform() !== 'win32',
    titleBarStyle: os.platform() === 'win32' ? 'hidden' : 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  Menu.setApplicationMenu(null)
  updateWindow?.setMenuBarVisibility(false)
  if (process.env.VITE_DEV_SERVER_URL) {
    // noinspection ES6MissingAwait
    updateWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#splash`)
    updateWindow?.webContents.openDevTools()
  } else {
    // noinspection ES6MissingAwait
    updateWindow.loadFile(path.join(__dirname, '../.output/public/index.html'), { hash: 'splash' })
    // updateWindow.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'), { hash: 'splash' })
  }
  updateWindow.once('ready-to-show', () => {
    if (updateWindow) {
      updateWindow.show()
    }
  })
}
