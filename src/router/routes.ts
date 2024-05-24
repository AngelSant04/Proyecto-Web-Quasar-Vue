import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login', // Redirige desde la ruta raíz a /login
  },
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: '/personal',
        component: () => import('pages/personal/Personal.vue'),
      },
      {
        path: '/equipos',
        component: () => import('pages/equipos/Equipos.vue'),
      },
      {
        path: '/default',
        component: () => import('pages/default/Default.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('pages/login/login.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
