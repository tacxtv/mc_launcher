import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { getUpdateWindow } from '../windows/updateWindow'
import { AuthService } from '../services/auth.service'
import { autoUpdater } from 'electron-updater'
import { createMainWindow } from '../windows/mainWindow'

// autoUpdater.logger = log
// autoUpdater.logger.transports.file.level = 'info'

export class UpdateEvent {
  public static name = 'UpdateEvent'
  public async registerEvents(): Promise<void> {
    ipcMain.on('checkForUpdates', async () => {
      log.info('checkForUpdates ipcMain')
      if (process.env.NODE_ENV === 'development' && getUpdateWindow() !== null) {
        log.verbose('checkForUpdates ipcMain development')
        await AuthService.login()
        // await createMainWindow()
      } else {
        await autoUpdater.checkForUpdates()
      }
    })
    ipcMain.on('quitAndInstallUpdate', () => {
      log.info('quitAndInstallUpdate')
      autoUpdater.quitAndInstall()
    })

    autoUpdater.on('update-available', () => {
      log.info('update-available')
      const updateWindow = getUpdateWindow()
      if (updateWindow !== null) {
        updateWindow.webContents.send('updateAvailable')
      }
    })
    autoUpdater.on('update-not-available', async () => {
      log.info('update-not-available')
      await AuthService.login()
    })
    autoUpdater.on('update-downloaded', () => {
      log.info('update-downloaded')
      autoUpdater.quitAndInstall()
    })
    autoUpdater.on('error', (err: any) => {
      if (process.env.NODE_ENV === 'development' && err.name === 'ENOENT') return
      log.error('autoUpdater error ', err)
    })

    log.info('UpdateEvent registered')
  }
}
