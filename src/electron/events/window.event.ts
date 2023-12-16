import { BrowserWindow, app, ipcMain } from 'electron'
import Store from 'electron-store'
import log from 'electron-log/main'

const store = new Store()

export class WindowEvent {
  public static name = 'WindowEvent'
  public async registerEvents(): Promise<void> {
    ipcMain.handle('getLauncherMaximizedAtStartup', () => {
      return store.get('launcherMaximizedAtStartup')
    })
    ipcMain.on('setLauncherMaximizedAtStartup', (_, val) => {
      store.set('launcherMaximizedAtStartup', val)
    })
    ipcMain.on('minimizeWindow', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        focusedWindow.minimize()
      }
    })
    ipcMain.on('showHideWindow', () => {
      for (const window of BrowserWindow.getAllWindows()) {
        window.isVisible() ? window.hide() : window.show()
      }
    })
    ipcMain.on('unmaximizeWindow', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        focusedWindow.unmaximize()
      }
    })
    ipcMain.on('maximizeWindow', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        focusedWindow.maximize()
      }
    })
    ipcMain.on('closeWindow', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (focusedWindow) {
        focusedWindow.close()
      }
      app.quit()
    })

    log.info('WindowEvent registered')
  }
}
