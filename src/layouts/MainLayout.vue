<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Intranet Alumnos
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          UNPRG
        </q-item-label>
        <q-separator />
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';

const essentialLinks = [
  {
    title: 'Inicio',
    icon: 'mdi-home-outline',
    link: '/default'
  },
  {
    title: 'Personal',
    icon: 'mdi-account-circle-outline',
    link: '/personal'
  },
  {
    title: 'Equipos',
    icon: 'mdi-laptop',
    link: '/equipos'
  },
  {
    title: 'Matricula',
    icon: 'mdi-school-outline',
    link: '/default'
  },
  {
    title: 'Academica',
    icon: 'mdi-school-outline',
    link: '/default'
  },
  {
    title: 'Tramites y Folder',
    icon: 'mdi-school-outline',
    link: '/default'
  },
  {
    title: 'Cerrar Sesion',
    icon: 'mdi-logout',
    link: '/default'
  }
];

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
