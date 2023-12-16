import { app, ipcMain } from 'electron'
import log from 'electron-log/main'
import Store from 'electron-store'
import { join } from 'path'
import { sendMainWindowWebContent } from '../windows/mainWindow'
import { getVersionList, installForgeTask } from '@xmcl/installer'
import type { Task } from '@xmcl/task'
import { createMinecraftProcessWatcher, launch } from '@xmcl/core'
// noinspection ES6PreferShortImport
import type { Modpack } from '../../../types/modpack.type'
import { safedeleteTask } from '../tasks/safedelete.task'
// noinspection ES6PreferShortImport
import { FABRIC_LOADER, FORGE_LOADER } from '../../../types/loader.type'
import { installFabricTask } from '../tasks/install-fabric.task'
import { installMinecraftTask } from '../tasks/install-minecraft.task'
import { installDependenciesLoaderTask } from '../tasks/install-dependencies-loader.task'
import { downloadTask } from '../tasks/download.task'

const store = new Store()
const javaHome = 'C:\\Program Files\\Java\\jdk-20\\bin\\java'
//TODO: check if JAVA_HOME is set
// const javaHome = join(process.env.JAVA_HOME!, 'bin', 'java')
const root = join(app.getPath('appData'), '.mcsl')

export class MinecraftService {
  public static name = 'MinecraftService'

  public async taskRoutine(modpack: Modpack): Promise<void> {
    const versionList = await getVersionList()
    const version = versionList.versions.find((v) => v.id === modpack.minecraft.version)
    if (!version) return

    sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
    const resolved = await installMinecraftTask(modpack.minecraft, root).setName('installMinecraft').startAndWait({
      onSucceed(task: Task<any>, result: any) {
        // console.log('onSucceed', task, result)
      }
    })
    for (const loader of modpack?.loaders || []) {
      switch (loader.type) {
        case FORGE_LOADER: {
          await installForgeTask({ version: loader.version, mcversion: modpack.minecraft.version }, root, { java: javaHome })
            .setName('installForge')
            .startAndWait({
              onSucceed(task: Task<any>, result: any) {
                // console.log('onSucceed', task, result)
              }
            })
          break
        }
        case FABRIC_LOADER:
          const installFabric = await installFabricTask({ version: loader.version, mcversion: modpack.minecraft.version }, root)
            .setName('installFabric')
            .startAndWait({
              onSucceed(task: Task<any>, result: any) {
                // console.log('onSucceed', task, result)
              }
            })
          // const value = Math.round((installFabric.progress / installFabric.total) * 100)
          // log.info('Download installFabric progress', value)
          // sendMainWindowWebContent('minecraftDownloadProgress', { value })
          console.log('installFabric', installFabric)
          console.log('installDependencies')
          await installDependenciesLoaderTask({
            ...loader,
            mcversion: modpack.minecraft.version,
          }, root).setName('installDependenciesLoader').startAndWait({})
          break
      }
    }

    // const taskRoutine = task('installAndStart', async function () {
    //   try {
    //     await this.yield(installTask(version, root).setName('install'))
    //   } catch (e) {
    //     log.error('e install', e)
    //   }
    //   for (const loader of modpack.loaders) {
    //     switch (loader.type) {
    //       case FORGE_LOADER: {
    //         await this.yield(
    //           installForgeTask(
    //             {
    //               version: loader.version,
    //               mcversion: modpack.minecraft.version,
    //             },
    //             root,
    //             {
    //               java: javaHome,
    //             },
    //           ).setName('installForge'),
    //         )
    //         break
    //       }
    //       case FABRIC_LOADER:
    //         try {
    //           await this.yield(
    //             installFabricTask(
    //               {
    //                 version: loader.version,
    //                 mcversion: modpack.minecraft.version,
    //               },
    //               root,
    //             ).setName('installFabric'),
    //           )
    //         } catch (e) {
    //           log.error('e installFabric', e)
    //         }
    //         break
    //     }
    //   }
    //   await this.yield(downloadTask(root, modpack.files).setName('downloadFiles'))
    // })

    // try {
    //   await taskRoutine.startAndWait({
    //     onUpdate() {
    //       const value = Math.round((taskRoutine.progress / taskRoutine.total) * 100)
    //       log.info('Download progress', value)
    //       sendMainWindowWebContent('minecraftDownloadProgress', { value })
    //     },
    //   })
    // } catch (e) {
    //   log.error('e', e)
    // }
    sendMainWindowWebContent('minecraftDownloadFinish', { value: true })
  }

  public async safedeleteTask(modpack: Modpack): Promise<void> {
    const safeDeleteTask = safedeleteTask(root, modpack.files)
    await safeDeleteTask.startAndWait({
      onUpdate() {
        const value = Math.round((safeDeleteTask.progress / safeDeleteTask.total) * 100)
        log.info('Safedelete progress', value)
        // sendMainWindowWebContent('minecraftDownloadProgress', { value })
      },
    })
  }

  public async downloadTask(modpack: Modpack): Promise<void> {
    await downloadTask(root, modpack.files)
      .setName('downloadFiles')
      .startAndWait({})
  }

  public async tryToStartMinecraft(modpack: Modpack): Promise<void> {
    console.log('tryToStartMinecraft')
    try {
      const version = [modpack.minecraft.version]
      let hasPrimaryLoaded = false
      for (const loader of modpack.loaders) {
        switch (loader.type) {
          case FORGE_LOADER: {
            if (hasPrimaryLoaded) break
            version.push(loader.type)
            version.push(loader.version)
            hasPrimaryLoaded = true
            break
          }
          case FABRIC_LOADER: {
            if (hasPrimaryLoaded) break
            version.push(loader.type + loader.version)
            hasPrimaryLoaded = true
            break
          }
        }
      }

      const childProcess = await launch({
        gameProfile: {
          id: (<any>global).share.auth.uuid,
          name: (<any>global).share.auth.name,
        },
        accessToken: (<any>global).share.auth.access_token,
        gamePath: root,
        version: version.join('-'),
        javaPath: store.get('launcher_javaPath', javaHome) as string,
        gameName: modpack.name,
        minMemory: store.get(modpack.name + '_minMemory', 1024) as number,
        maxMemory: store.get(modpack.name + '_maxMemory', modpack.minecraft.recommendedMemory || 2048) as number,
        extraExecOption: {
          // detached: true,
          // shell: true,
        },
        resolution: {
          width: store.get('launcher_resolution_width', 854) as number,
          height: store.get('launcher_resolution_height', 480) as number,
          fullscreen: store.get('launcher_resolution_fullscreen', false) ? true : undefined,
        },
      })
      const watcher = createMinecraftProcessWatcher(childProcess)
      watcher.on('error', (e) => log.debug(e))
      watcher.on('minecraft-exit', (e) => {
        log.debug(e)
        log.info('onFinish')
        sendMainWindowWebContent('windowLogEvent', {
          type: 'error',
          message: `Minecraft s'est arrêté avec le code ${e.code} et le signal ${e.signal}`,
        })
        sendMainWindowWebContent('minecraftProcessFinish', { value: true })
      })
      watcher.on('minecraft-window-ready', () => {
        log.debug('minecraft-window-ready')
        log.info('onFinish')
        sendMainWindowWebContent('minecraftProcessReady', { value: true })
      })
    } catch (e) {
      log.error('er launch', e)
    }
  }

  public async registerEvents(): Promise<void> {
    ipcMain.handle('launchMinecraft', async (_, modpack: Modpack) => {
      log.info('launchMinecraft', modpack.name)
      sendMainWindowWebContent('minecraftStartup', { value: true })
      sendMainWindowWebContent('windowLogEvent', { message: `Démarrage de Minecraft avec le modpack ${modpack.name}` })
      try {
        sendMainWindowWebContent('windowLogEvent', { message: `Suppression des fichiers inutiles...` })
        await this.safedeleteTask(modpack)
        sendMainWindowWebContent('windowLogEvent', { message: `Installation des dépendances...` })
        await this.taskRoutine(modpack)
        sendMainWindowWebContent('windowLogEvent', { message: `Téléchargement des fichiers...` })
        await this.downloadTask(modpack)
      } catch (e: any) {
        log.error('e', e, e.stack)
      }
      sendMainWindowWebContent('minecraftDownloadFinish', { value: true })
      sendMainWindowWebContent('windowLogEvent', { message: `Lancement de Minecraft...` })
      try {
        await this.tryToStartMinecraft(modpack)
      } catch (e: any) {
        log.error('e', e, e.stack)
      }
    })

    log.info('MinecraftService registered')
  }
}
