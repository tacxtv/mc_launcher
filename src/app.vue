<template lang="pug">
nuxt-layout
  nuxt-page
</template>

<script lang="ts">
import { ref, reactive } from 'vue'
import { useFirestore } from 'vuefire'
import {
  and,
  collection,
  doc, DocumentSnapshot,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QuerySnapshot,
  where,
} from 'firebase/firestore'
import type { Launcher } from '../types/launcher.type'
import type { Modpack } from '../types/modpack.type'

// // function add() {
// //   addDoc(todosRef, {
// //     title: "ezrezrzerze",
// //     finished: false,
// //   })
// // }
//
// // function removeTodo(id: string) {
// //   deleteDoc(doc(db, 'test', id))
// // }

// @ts-ignore
export default defineNuxtComponent({
  data: () => ({
    info: reactive({info: ref(0)}),
  }),
  async setup() {
    const db = useFirestore()
    const launcherRef = doc(db, '/launchers/stLKMO3WsQcVwpBWgbxd')
    const launcherData = (await getDoc(launcherRef)).data() as Launcher
    const modpacksRef = collection(db, 'modpacks')
    const launcherModpacksQuery = query(modpacksRef, and(
      where('launcher', '==', launcherRef),
      where('hidden', '==', false),
    ))
    const launcherModpacksSnapshot = await getDocs(launcherModpacksQuery)
    let launcherModpacksData = launcherModpacksSnapshot.docs.map((doc) => doc.data()) as Modpack[]

    return {
      launcherRef,
      launcherModpacksQuery,
      launcherData: reactive({
        data: launcherData,
      }),
      launcherModpacksData: reactive({
        data: launcherModpacksData,
      }),
    }
  },
  provide() {
    return {
      'global-launcher': this.launcherData,
      'global-modpacks': ref(this.launcherModpacksData),
    }
  },
  mounted() {
    onSnapshot(this.launcherModpacksQuery, (snapshot: QuerySnapshot<any, any>) => {
      this.launcherModpacksData.data = snapshot.docs.map((doc) => doc.data()) as Modpack[]
    })
    onSnapshot(this.launcherRef, async (snapshot: DocumentSnapshot<any, any>) => {
      this.launcherData.data = snapshot.data() as Launcher
    })
  }
})
</script>
