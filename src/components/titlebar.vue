<!--<template>-->
<!--  <div id="titlebar">-->
<!--&lt;!&ndash;    <h1 id="titletext">MCSL</h1>&ndash;&gt;-->
<!--    <div id="window-controls">-->
<!--      <div id="window-control-minimize" @click="electronWindowMinimize" class="button"></div>-->
<!--      <div id="window-control-unmaximize" v-if="!isMaximized" @click="maximizeOrUnmaximize()" class="button"></div>-->
<!--      <div id="window-control-maximize" v-else @click="maximizeOrUnmaximize()" class="button"></div>-->
<!--      <div id="window-control-close" @click="electronWindowClose" class="button"></div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->
<template lang='pug'>
q-bar#titlebar
  q-btn(icon='mdi-menu' dense flat)
  q-space
  q-btn(@click="electronWindowMinimize" icon='mdi-window-minimize' dense flat)
  q-btn(@click="maximizeOrUnmaximize" :icon="isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize'" dense flat)
  q-btn(@click="electronWindowClose" icon='mdi-window-close' dense flat)
</template>

<script lang="ts" setup>
let isMaximized = ref<boolean>(await window.electron?.getLauncherMaximizedAtStartup())

async function maximizeOrUnmaximize(): Promise<void> {
  isMaximized.value ? electronWindowUnmaximize() : electronWindowMaximize()
  isMaximized.value = !isMaximized.value
}

function electronWindowClose(): void {
  window.electron?.closeWindow()
}

function electronWindowMinimize(): void {
  window.electron?.minimizeWindow()
}

function electronWindowMaximize(): void {
  window.electron?.maximizeWindow()
}

function electronWindowUnmaximize(): void {
  window.electron?.unmaximizeWindow()
}
</script>

<style lang='sass'>
@import 'quasar/src/css/variables.sass'

#titlebar
  background: $dark
  height: 32px
  -webkit-app-region: drag

  .q-btn
    -webkit-app-region: no-drag

//#titletext {
//  flex: 1;
//  margin: 0;
//  font-size: 22px;
//  font-weight: 400;
//  color: white;
//  padding: 0 10px;
//  line-height: 32px;
//  -webkit-app-region: drag;
//}
//
//#window-controls {
//  display: flex;
//  top: 0;
//  right: 0;
//  height: 100%;
//  overflow: hidden;
//}
//
//#window-controls .button {
//  grid-row: 1/span 1;
//  display: flex;
//  justify-content: center;
//  align-items: center;
//  width: 48px;
//  height: 100%;
//  cursor: pointer;
//  color: white;
//  user-select: none;
//  -webkit-app-region: no-drag;
//  font-family: Segoe Fluent Icons, Segoe MDL2 Assets, serif;
//  font-size: 10px;
//}
</style>
