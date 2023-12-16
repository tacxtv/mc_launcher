import type { Task } from '@xmcl/task'
import { BaseTask } from '@xmcl/task'
import { getFabricLoaderArtifact, installDependenciesTask, installFabric } from '@xmcl/installer'
import type { FabricInstallOptions } from '@xmcl/installer'
import { Version } from '@xmcl/core'

export function installFabricTask(loader: { version: string; mcversion: string }, root: string, options: FabricInstallOptions = {}): Task<any> {
  return new InstallFabricTask(loader, root, options)
}

class InstallFabricTask extends BaseTask<any> {
  public constructor(
    protected loader: { version: string; mcversion: string },
    protected root: string,
    protected options: FabricInstallOptions = {},
  ) {
    super()
  }

  protected runTask(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const artifact = await getFabricLoaderArtifact(this.loader.mcversion, this.loader.version)
      // console.log('artifact', artifact, this.loader.mcversion, this.loader.version)
      try {
        const resolved = await installFabric(artifact, this.root, {
          side: 'client',
          ...this.options,
        })
      } catch (e) {
        console.log('err', e)
        reject(e)
      }
      console.log('after installFabric')
      resolve(true)
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
