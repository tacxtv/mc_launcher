<template lang="pug">
div.fit(:style='{background: `url(${backgroundUrl}) no-repeat center center fixed`}')
  q-splitter.full-height.gradient(v-model='splitter' :horizontal='!launcher.config.menu.vertical' disable)
    template(v-slot:before)
      div.flex.fit(:style='{flexFlow: menuFlow}')
        div.fit.flex.items-center.overflow-hidden
          q-tabs.full-width.q-my-md.overflow-hidden(
            v-model='tab'
            :vertical='launcher.config.menu.vertical'
            :style='{height: "initial", maxHeight: "60vh"}'
            outside-arrows
          )
            q-tab(
              v-for='modpack in modpacks' :key='modpack.id'
              :label='modpack.name' :name='modpack.name' icon='mdi-package-variant-closed'
            )
        q-separator.q-my-sm.q-mx-md
        account-avatar

    template(v-slot:after)
      div.flex.fit(:style='{flexFlow: "column"}')
        q-tab-panels.fit.transparent(v-model='tab' transition-prev="jump-up" transition-next="jump-up" animated swipeable)
          q-tab-panel.fit.q-pa-none.overflow-hidden(v-for='modpack in modpacks' :key='modpack.id' :name='modpack.name')
            modpack-display(:modpack='modpack')
        q-bar
          q-space
          small v1.0.0
  settings-dialog
</template>
<script lang="ts">
import { reactive, ref } from 'vue'
import type { UnwrapNestedRefs } from '@vue/reactivity'
import type { Launcher } from '~~/types/launcher.type'
import type { Modpack } from '~~/types/modpack.type'

export default defineNuxtComponent({
  inject: ['global-launcher', 'global-modpacks'],
  data: () => ({
    tab: ref(''),
    settingsDialog: reactive({
      data: false,
    }),
    settingsTab: reactive({
      data: 'launcher',
    }),
  }),
  computed: {
    launcher(): Launcher {
      return (this['global-launcher'] as UnwrapNestedRefs<{ data: Launcher }>).data
    },
    modpacks(): Modpack[] {
      return (this['global-modpacks'] as UnwrapNestedRefs<{ data: Modpack[] }>).data
    },
    menuFlow(): string {
      let flow = this.launcher.config.menu.vertical ? 'column' : 'row'
      if (this.launcher.config.menu.reverse) flow += '-reverse'
      return flow
    },
    defaultModpack(): Modpack {
      return this.modpacks.find((modpack) => modpack.default) as Modpack
    },
  },
  setup() {
    const backgroundUrl = ref('https://www.oxygenserv.com/wp-content/uploads/2023/03/171177.jpg')
    const splitter = ref(25)

    return {
      backgroundUrl,
      splitter,
    }
  },
  provide() {
    return {
      'settings-dialog': ref(this.settingsDialog),
      'settings-tab': ref(this.settingsTab),
    }
  },
  mounted() {
    this.tab = this.defaultModpack.name
  },
})
</script>
