import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/login', component: () => import('pages/Auth/LoginPage.vue') },
      // requiresAuth: el guard del router (router/index.ts) exige sesion iniciada
      { path: '/categorias', component: () => import('pages/Categoria/CategoriasPage.vue'), meta: { requiresAuth: true } },
      // Las rutas del resto de las entidades se agregan a medida que se completan sus CRUD (Fases 5 y 6)
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
