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
      { path: '/productos', component: () => import('pages/Producto/ProductosPage.vue'), meta: { requiresAuth: true } },
      { path: '/bodegas', component: () => import('pages/Bodega/BodegasPage.vue'), meta: { requiresAuth: true } },
      { path: '/stock', component: () => import('pages/StockBodega/StockPage.vue'), meta: { requiresAuth: true } },
      { path: '/movimientos-stock', component: () => import('pages/MovimientoStock/MovimientosStockPage.vue'), meta: { requiresAuth: true } },
      { path: '/proveedores', component: () => import('pages/Proveedor/ProveedoresPage.vue'), meta: { requiresAuth: true } },
      { path: '/ordenes-compra', component: () => import('pages/OrdenCompra/OrdenesCompraPage.vue'), meta: { requiresAuth: true } },
      { path: '/ordenes-compra/:id/detalle', component: () => import('pages/OrdenCompra/OrdenCompraDetallePage.vue'), meta: { requiresAuth: true } },
      { path: '/clientes', component: () => import('pages/Cliente/ClientesPage.vue'), meta: { requiresAuth: true } },
      { path: '/pedidos', component: () => import('pages/Pedido/PedidosPage.vue'), meta: { requiresAuth: true } },
      { path: '/pedidos/:id/detalle', component: () => import('pages/Pedido/PedidoDetallePage.vue'), meta: { requiresAuth: true } },
      { path: '/solicitudes-reposicion', component: () => import('pages/SolicitudReposicion/SolicitudesReposicionPage.vue'), meta: { requiresAuth: true } },
      { path: '/solicitudes-reposicion/:id/detalle', component: () => import('pages/SolicitudReposicion/SolicitudReposicionDetallePage.vue'), meta: { requiresAuth: true } },
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
