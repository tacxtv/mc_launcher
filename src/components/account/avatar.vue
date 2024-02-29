<template lang="pug">
div.flex.justify-center.items-center.q-py-md.q-px-lg.column.cursor-pointer(@click="openSettings")
  q-avatar(rounded size='100px')
    q-img(v-if='this.head' :src="this.head" ratio="1")
    q-img(v-else :src="'https://mineskin.eu/avatar/' + account?.username + '/100.png'" ratio="1")
  q-bar.rounded-borders.bg-dark.q-mt-sm
    q-toolbar-title(v-text='account?.username')
</template>

<script lang="ts">
import { ref } from 'vue'

// @ts-ignore
export default defineNuxtComponent({
  inject: ['global-launcher', 'settings-dialog', 'settings-tab'],
  data: () => ({
    account: ref<any>(null),
    head: ref<string | null>(null),
  }),
  async setup() {
    const currentAccount = await window.electron.currentAccount()
    return {
      currentAccount,
    }
  },
  methods: {
    openSettings() {
      ;(this['settings-dialog'] as { data: boolean }).data = true
      ;(this['settings-tab'] as { data: string }).data = 'accounts'
    },
    async getAccount(currentAccount: any) {
      const accounts = await window.electron.getAccounts()
      if (!accounts) return
      return accounts.find((account: any) => {
        return account.username === currentAccount
      })
    },
    async createHeadTexture(data: any): Promise<string> {
      let image = await this.getData(data)
      return await new Promise((resolve) => {
        image.addEventListener('load', (e: any) => {
          const size = 128
          let cvs = document.createElement('canvas')
          cvs.width = size
          cvs.height = size
          let ctx = cvs.getContext('2d') as CanvasRenderingContext2D
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(image, 8, 8, 8, 8, 0, 0, size, size)
          ctx.drawImage(image, 40, 8, 8, 8, 0, 0, size, size)
          return resolve(cvs.toDataURL())
        })
      })
    },
    async getData(data: any) {
      if (data.startsWith('http')) {
        let response = await fetch(data)
        let buffer = await response.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        data = `data:image/png;base64,${base64}`
      }
      let img = new Image()
      img.src = data
      return img
    }
    // async getAccounts() {
    //   return (await window.electron.getAccounts()).map((account: any) => {
    //     return {
    //       ...account,
    //       // avatar: `https://crafatar.com/avatars/${account.uuid}?size=100`,
    //       selected: account.username === this.currentAccount.value,
    //     }
    //   })
    // },
  },
  async mounted() {
    this.account = await this.getAccount(this.currentAccount)
    this.head = await this.createHeadTexture(this.account?.skinUrl)
  },
})
</script>
