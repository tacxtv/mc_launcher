import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
import { createUpdateWindow } from './windows/updateWindow'
import log from 'electron-log/main'
import { WindowEvent } from './events/window.event'
import { UpdateEvent } from './events/update.event'
import { AuthService } from './services/auth.service'
import { MinecraftService } from './services/minecraft.service'
import path from 'path'
import colors from 'colors'
import { SettingsEvent } from './events/settings.event'

process.env.ROOT = path.join(__dirname, '..')
process.env.DIST = path.join(process.env.ROOT, 'dist-electron')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.ROOT, 'public')
  : path.join(process.env.ROOT, '.output/public')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')({ showDevTools: true })
}
log.initialize({ preload: true, spyRendererConsole: true })
colors.enable()

const services: any[] = [WindowEvent, UpdateEvent, SettingsEvent, AuthService, MinecraftService]

app.whenReady().then(async () => {
  ;(<any>global).share = {
    auth: {
      access_token: '',
      uuid: '',
      xuid: '',
      name: '',
    },
  }
  if (!app.requestSingleInstanceLock()) {
    app.quit()
    return
  }
  for (const service of services) {
    const instance = new service()
    log.info(`Registering ${instance.name || instance.constructor.name}...`)
    if (typeof instance.registerEvents !== 'function') {
      log.warn(`No registerEvents function found for ${instance.name || instance.constructor.name}`)
      continue
    }
    await instance.registerEvents()
  }
  await createUpdateWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createUpdateWindow()
  })
  const tray = new Tray(path.join(__dirname, '/../public/logo.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Afficher/Masquer',
      click: () => ipcMain.emit('showHideWindow'),
    }
  ])
  tray.setToolTip(process.env.npm_package_description || '')
  tray.setContextMenu(contextMenu)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
