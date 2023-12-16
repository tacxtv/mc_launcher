<template lang='pug'>
q-dialog(
  v-model="settingsDialog"
  transition-show="slide-up"
  transition-hide="slide-down"
  maximized
)
  //q-layout.full-height.full-width(view="hHh lpR fFf")
  q-card.flex.overflow-hidden(:style='{flexFlow: "column", width: "80vw", height: "80vh"}')
    q-bar
      q-toolbar-title
        q-icon(name='mdi-cog' left)
        span Paramètres&nbsp;
        small(v-text='"(" + (tabs[settingsTab]?.title || settingsTab) + ")"' )
      q-space
      q-btn(
        @click="settingsDialog = false"
        icon="mdi-close"
        dense
        flat
      )
    q-card.overflow-auto.fit
      q-card-section.q-pa-none.fit
        q-splitter.fit(v-model='splitter' disable)
          template(#before)
            div.fit.flex(:style='{flexFlow: "column"}')
              q-tabs(v-model="settingsTab" vertical :style='{height: "initial"}')
                q-tab(
                  v-for='setting in settingsTypeTop'
                  :name='setting.key'
                  :label='setting.title'
                  :icon='setting.icon'
                )
              q-separator
              div.fit.flex
                q-tabs.full-width(v-model="settingsTab" vertical :style='{height: "initial"}')
                  q-tab(
                    v-for='setting in settingsTypeUser'
                    :name='setting.key'
                    :label='setting.title'
                    :icon='setting.icon'
                  )
              q-separator
              q-tabs(v-model="settingsTab" vertical :style='{height: "initial"}')
                q-tab(
                  v-for='setting in settingsTypeBottom'
                  :name='setting.key'
                  :label='setting.title'
                  :icon='setting.icon'
                )
          template(#after)
            q-tab-panels(v-model='settingsTab')
              q-tab-panel.q-pa-none(name='launcher')
                settings-launcher
              q-tab-panel.q-pa-none(v-for='setting in settingsTypeUser' :name='setting.key')
                modpack-settings(:modpack='modpacks.find(modpack => modpack.name === setting.key)')
              q-tab-panel.q-pa-none(name='accounts')
                settings-accounts
</template>

<script lang='ts'>
import { ref } from 'vue'
import type { UnwrapNestedRefs } from '@vue/reactivity'
import type { Launcher } from '~~/types/launcher.type'
import type { Modpack } from '~~/types/modpack.type'

type Tab = {
  title: string
  icon: string
  component: string
  type: 'top' | 'user' | 'bottom'
  order: number
}
type Tabs = {
  [key: string | number]: Tab
}

export default defineNuxtComponent({
  inject: ['global-launcher', 'global-modpacks', 'settings-dialog', 'settings-tab'],
  data: () => ({
    splitter: ref(20),
    tabs: ref(<Tabs>{
      launcher: {
        title: 'Launcher',
        icon: 'mdi-rocket-launch',
        component: 'settings-launcher',
        type: 'top',
        order: 1,
      },
      accounts: {
        title: 'Comptes',
        icon: 'mdi-account',
        component: 'settings-accounts',
        type: 'bottom',
        order: 99,
      },
    }),
  }),
  computed: {
    settingsDialog: {
      get(): boolean {
        return (this['settings-dialog'] as UnwrapNestedRefs<{ data: boolean }>).data
      },
      set(value: boolean) {
        (this['settings-dialog'] as UnwrapNestedRefs<{ data: boolean }>).data = value
      },
    },
    settingsTab: {
      get(): string {
        return (this['settings-tab'] as UnwrapNestedRefs<{ data: string }>).data
      },
      set(value: string) {
        (this['settings-tab'] as UnwrapNestedRefs<{ data: string }>).data = value
      },
    },
    launcher(): Launcher {
      return (this['global-launcher'] as UnwrapNestedRefs<{ data: Launcher }>).data
    },
    modpacks(): Modpack[] {
      return (this['global-modpacks'] as UnwrapNestedRefs<{ data: Modpack[] }>).data
    },
    settingsTypeUser() {
      return Object.entries(this.tabs).filter(
        ([_, setting]) => setting.type === 'user'
      ).map(([key, setting]) => {
        return {
          ...setting,
          key,
        }
      })
    },
    settingsTypeTop() {
      return Object.entries(this.tabs).filter(
        ([_, setting]) => setting.type === 'top'
      ).map(([key, setting]) => {
        return {
          ...setting,
          key,
        }
      })
    },
    settingsTypeBottom() {
      return Object.entries(this.tabs).filter(
        ([_, setting]) => setting.type === 'bottom'
      ).map(([key, setting]) => {
        return {
          ...setting,
          key,
        }
      })
    },
  },
  mounted() {
    for (const modpack of this.modpacks) {
      this.tabs[modpack.name] = {
        title: modpack.name,
        icon: 'mdi-cog',
        component: 'settings-minecraft',
        type: 'user',
        order: 50,
      }
    }
  }
})

// const splitter = ref(20)
// const settings = ref({
//   launcher: {
//     title: 'Launcher',
//     icon: 'mdi-rocket-launch',
//     component: 'settings-launcher',
//     type: 'top',
//   },
//   minecraft: {
//     title: 'Minecraft',
//     icon: 'mdi-cog',
//     component: 'settings-minecraft',
//     type: 'user',
//   },
//   minecraft2: {
//     title: 'Minecraft',
//     icon: 'mdi-cog',
//     component: 'settings-minecraft',
//     type: 'user',
//   },
//   minecraft3: {
//     title: 'Minecraft',
//     icon: 'mdi-cog',
//     component: 'settings-minecraft',
//     type: 'user',
//   },
//   accounts: {
//     title: 'Comptes',
//     icon: 'mdi-account',
//     component: 'settings-accounts',
//     type: 'bottom',
//   },
// })
</script>
