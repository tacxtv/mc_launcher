import { app, ipcMain } from 'electron'
import log from 'electron-log/main'
import Store from 'electron-store'
import { join } from 'path'
import { sendMainWindowWebContent } from '../windows/mainWindow'
import { getVersionList, installForgeTask, installNeoForgedTask } from '@xmcl/installer'
import type { Task } from '@xmcl/task'
import { createMinecraftProcessWatcher, launch } from '@xmcl/core'
// noinspection ES6PreferShortImport
import type { Modpack } from '../../../types/modpack.type'
import { safedeleteTask } from '../tasks/safedelete.task'
// noinspection ES6PreferShortImport
import { FABRIC_LOADER, FORGE_LOADER, NEOFORGE_LOADER } from '../../../types/loader.type'
import { installFabricTask } from '../tasks/install-fabric.task'
import { installMinecraftTask } from '../tasks/install-minecraft.task'
import { installDependenciesLoaderTask } from '../tasks/install-dependencies-loader.task'
import { downloadTask } from '../tasks/download.task'

const store = new Store()
const root = join(app.getAppPath(), 'instances')

export class MinecraftService2 {
  public static name = 'MinecraftService'

  public async taskRoutine(modpack: Modpack): Promise<void> {
    const javaHome = store.get(modpack.name + '_javaPath', join(process.env.JAVA_HOME!, 'bin', 'java')) as string

    const versionList = await getVersionList()
    const version = versionList.versions.find((v) => v.id === modpack.minecraft.version)
    if (!version) return

    sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
    if (!store.get(`installed_task_${modpack.name}_minecraft`, false)) {
      sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
      const resolved = await installMinecraftTask(modpack.minecraft, join(root, modpack.id)).setName('installMinecraft').startAndWait({
        onSucceed(task: Task<any>, result: any) {
          console.log('onSucceed', task, result)
          store.set(`installed_task_${modpack.name}_minecraft`, true)
        }
      })
    }
    for (const loader of modpack?.loaders || []) {
      switch (loader.type) {
        case FORGE_LOADER: {
          if (store.get(`installed_task_${modpack.name}_forge_${loader.version}`, false)) break
          sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
          await installForgeTask({ version: loader.version, mcversion: modpack.minecraft.version }, join(root, modpack.id), { java: javaHome })
            .setName('installForge')
            .startAndWait({
              onSucceed(task: Task<any>, result: any) {
                // console.log('onSucceed', task, result)
                store.set(`installed_task_${modpack.name}_forge_${loader.version}`, true)
              }
            })
          break
        }
        case NEOFORGE_LOADER: {
          if (store.get(`installed_task_${modpack.name}_neoforge_${loader.version}`, false)) break
          sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
          await installNeoForgedTask(`${modpack.minecraft.version}-${loader.version}`, join(root, modpack.id), { java: javaHome })
            .setName('installNeoForge')
            .startAndWait({
              async onSucceed(task: Task<any>, result: any) {
                // console.log('onSucceed', task, result)
                // store.set(`installed_task_${modpack.name}_neoforge_${loader.version}`, true)
                console.log('installDependencies')
                sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
                await installDependenciesLoaderTask({
                  ...loader,
                  mcversion: modpack.minecraft.version,
                }, join(root, modpack.id)).setName('installDependenciesLoader').startAndWait({
                  onSucceed(task: Task<any>, result: any) {
                    // console.log('onSucceed', task, result)
                    store.set(`installed_task_${modpack.name}_neoforge_${loader.version}`, true)
                  }
                })
              }
            })
          break
        }
        case FABRIC_LOADER:
          if (store.get(`installed_task_${modpack.name}_fabric_${loader.version}`, false)) break
          sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
          const installFabric = await installFabricTask({ version: loader.version, mcversion: modpack.minecraft.version }, join(root, modpack.id))
            .setName('installFabric')
            .startAndWait({
              async onSucceed(task: Task<any>, result: any) {
                // console.log('onSucceed', task, result)
                console.log('installDependencies')
                sendMainWindowWebContent('minecraftDownloadProgress', { value: 0 })
                await installDependenciesLoaderTask({
                  ...loader,
                  mcversion: modpack.minecraft.version,
                }, join(root, modpack.id)).setName('installDependenciesLoader').startAndWait({
                  onSucceed(task: Task<any>, result: any) {
                    // console.log('onSucceed', task, result)
                    store.set(`installed_task_${modpack.name}_fabric_${loader.version}`, true)
                  }
                })
              }
            })
          // const value = Math.round((installFabric.progress / installFabric.total) * 100)
          // log.info('Download installFabric progress', value)
          // sendMainWindowWebContent('minecraftDownloadProgress', { value })
          console.log('installFabric', installFabric)
          break
      }
    }

    sendMainWindowWebContent('minecraftDownloadFinish', { value: true })
  }

  public async safedeleteTask(modpack: Modpack): Promise<void> {
    const safeDeleteTask = safedeleteTask(join(root, modpack.id), modpack.files, modpack.whitelist || [])
    await safeDeleteTask.startAndWait({
      onUpdate() {
        const value = Math.round((safeDeleteTask.progress / safeDeleteTask.total) * 100)
        log.info('Safedelete progress', value)
        // sendMainWindowWebContent('minecraftDownloadProgress', { value })
      },
    })
  }

  public async downloadTask(modpack: Modpack): Promise<void> {
    await downloadTask(join(root, modpack.id), modpack.files)
      .setName('downloadFiles')
      .startAndWait({})
  }

  public async tryToStartMinecraft(modpack: Modpack): Promise<void> {
    console.log('tryToStartMinecraft on modpack', modpack.name)
    console.log(root, modpack.id)
    console.log(join(root, modpack.id))
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
          case NEOFORGE_LOADER: {
            if (hasPrimaryLoaded) break
            // version.push(loader.type)
            // version.push(loader.version)
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

      const javaHome = store.get(modpack.name + '_javaPath', join(process.env.JAVA_HOME!, 'bin', 'java')) as string
      const childProcess = await launch({
        gameProfile: {
          id: (<any>global).share.auth.uuid,
          name: (<any>global).share.auth.name,
        },
        accessToken: (<any>global).share.auth.access_token,
        gamePath: join(root, modpack.id),
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

      // const promise = new Promise<void>(async (resolve, reject) => {
      //
      //   resolve()
      // })
      //
      // promise.finally(() => {
      //   log.info('launchMinecraft finished')
      // })
    })

    log.info('MinecraftService registered')
  }
}
