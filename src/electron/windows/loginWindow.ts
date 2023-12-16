import { BrowserWindow, Menu } from 'electron'
import log from 'electron-log/main'
import os from 'os'
import path from 'path'

let loginWindow: BrowserWindow | null = null

export function getLoginWindow(): BrowserWindow | null {
  return loginWindow
}

export function destroyLoginWindow(): void {
  if (!loginWindow) return
  log.info('destroyLoginWindow')
  loginWindow.close()
  loginWindow = null
}

export async function createLoginWindow(): Promise<void> {
  destroyLoginWindow()
  log.info('createLoginWindow')
  loginWindow = new BrowserWindow({
    icon: path.join(__dirname, '/../public/logo.png'),
    width: 616,
    height: 840,
    resizable: false,
    show: false,
    title: 'Login',
    transparent: os.platform() === 'win32',
    frame: os.platform() !== 'win32',
    titleBarStyle: os.platform() === 'win32' ? 'hidden' : 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  Menu.setApplicationMenu(null)
  loginWindow.setMenuBarVisibility(false)
  if (process.env.VITE_DEV_SERVER_URL) {
    // noinspection ES6MissingAwait
    loginWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#login`)
    loginWindow.webContents.openDevTools()
  } else {
    // noinspection ES6MissingAwait
    loginWindow.loadFile(path.join(__dirname, '../.output/public/index.html'), { hash: 'login' })
  }
  loginWindow.once('ready-to-show', () => {
    if (loginWindow) {
      loginWindow.show()
    }
  })
}

export function sendLoginWindowWebContent(channel: string, args: any): void {
  if (!loginWindow) return
  return loginWindow.webContents.send(channel, args)
}
