<template lang="pug">
div.fit.flex(:style='{flexFlow: "column"}')
  div.fit.q-px-md
    h1.text-h4.text-center.q-mb-md(v-text='modpack.name')
    small.text-center.q-mb-md(v-text='modpack.description')
  q-toolbar.q-mb-lg
    q-space
    q-btn.q-mx-sm(icon='mdi-cog' flat dense @click='openSettings')
    q-btn(
      @click='launchMinecraft'
      label='Jouer !'
      icon='mdi-play'
      :color='loading ? "negative" : "positive"'
      :loading='loading'
      :percentage='downloadProgress'
    )
    q-space
  q-expansion-item.q-pa-none(v-model='logsDisplay' label='Console' icon='mdi-console' dense)
    q-scroll-area.bg-blue-grey-10.q-pa-xs(ref="chatScroll" :style='{maxHeight: "100px", height: "100px"}')
      pre.flex.column.q-ma-none(:style='{textWrap: "pretty"}')
        span(v-for='(log, index) in logsItems' :key='index' v-text='log')
</template>

<script lang="ts">
import type { PropType } from 'vue'
import type { Modpack } from '~~/types/modpack.type'
import { QScrollArea } from 'quasar'

// @ts-ignore
export default defineNuxtComponent({
  props: {
    modpack: {
      type: Object as PropType<Modpack>,
      required: true,
    },
  },
  inject: ['global-launcher', 'settings-dialog', 'settings-tab'],
  data: () => ({
    loading: false,
    downloadProgress: 0,
    logsDisplay: false,
    logsItems: [] as string[],
  }),
  methods: {
    openSettings() {
      ;(this['settings-dialog'] as { data: boolean }).data = true
      ;(this['settings-tab'] as { data: string }).data = this.modpack.name
    },
    launchMinecraft() {
      this.logsDisplay = true
      //TODO: fix this
      window.electron.launchMinecraft(JSON.parse(JSON.stringify(this.modpack)))
    },
  },
  mounted() {
    // console.log('this.$refs?.logEvents?.$el', this.$refs?.logEvents)
    this.logsItems = ['Initialisation du launcher...']

    window.electron.onWindowLogEvent((payload: { message?: string }) => {
      if (payload.message) this.logsItems.push(payload.message)
      this.$nextTick(() => {
        const target = (this.$refs.chatScroll as InstanceType<typeof QScrollArea>)?.getScrollTarget()
        if (!target) return
        ;(this.$refs.chatScroll as InstanceType<typeof QScrollArea>)?.setScrollPosition('vertical', target.scrollHeight, 0)
      })
    })
    window.electron.onMinecraftStartup(() => {
      this.loading = true
      console.log('onGameStartup', arguments)
    })
    window.electron.onMinecraftDownloadProgress((download: { id: string; value: number }) => {
      this.downloadProgress = download.value
    })
    window.electron.onMinecraftDownloadFinish(() => {
      this.downloadProgress = 0
      this.loading = false
    })
  },
})
</script>
