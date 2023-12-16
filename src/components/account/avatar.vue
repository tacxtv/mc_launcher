<template lang="pug">
div.flex.justify-center.items-center.q-py-md.q-px-lg.column.cursor-pointer(@click="openSettings")
  q-avatar(rounded size='100px')
    q-img(:src="account?.crafatar?.avatars" ratio="1")
  q-bar.rounded-borders.bg-dark.q-mt-sm
    q-toolbar-title(v-text='account?.username')
</template>

<script lang="ts">
import { ref } from 'vue'

// @ts-ignore
export default defineNuxtComponent({
  inject: ['global-launcher', 'settings-dialog', 'settings-tab'],
  data: () => ({
    account: ref(null),
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
  },
})
</script>
