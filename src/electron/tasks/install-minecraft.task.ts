import type { Task } from '@xmcl/task'
import { Agent } from 'undici'
import { BaseTask } from '@xmcl/task'
import { getVersionList, installTask } from '@xmcl/installer'
import log from 'electron-log/main'
import type { ResolvedVersion } from '@xmcl/core'

export function installMinecraftTask(minecraft: { version: string }, root: string): Task<ResolvedVersion> {
  return new InstallMinecraftTask(minecraft, root)
}

class InstallMinecraftTask extends BaseTask<any> {
  public constructor(
    protected minecraft: { version: string },
    protected root: string,
  ) {
    super()
  }

  protected runTask(attempts = 0): Promise<ResolvedVersion> {
    return new Promise(async (resolve, reject) => {
      log.info(`Installing Minecraft(${attempts}/3): `.bgBlue)
      let errors = 0
      try {
        const versionList = await getVersionList()
        const version = versionList.versions.find((v) => v.id === this.minecraft.version)
        if (!version) return

        const agent = new Agent({
          connections: 16,
        })
        const resolved = await installTask(version, this.root, {
          side: 'client',
          librariesDownloadConcurrency: 1,
          assetsDownloadConcurrency: 1,
        })
          .setName('installMinecraft')
          .startAndWait({
            onSucceed(task: Task<any>, result: any) {
              process.stdout.write('.'.green)
              // console.log('succeed', result)
            },
            onFailed(task: Task<any>, error: any) {
              process.stdout.write('!'.red)
              errors++
            },
          })
        return resolve(resolved)
      } catch (e) {
        console.log('errinstall', e)
      }
      if (attempts > 3) return reject(new Error('Failed to install Minecraft'))
      if (errors > 0) {
        attempts++
        return await this.runTask(attempts)
      }
      return reject(new Error('Install timed out !'))
    })
  }

  protected cancelTask(): Promise<void> {
    return Promise.resolve()
  }

  protected pauseTask(): Promise<void> {
    return Promise.resolve()
  }

  protected resumeTask(): Promise<void> {
    return Promise.resolve()
  }
}
