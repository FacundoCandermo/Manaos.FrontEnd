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
          Manaos
        </q-toolbar-title>

        <!-- Con sesion: nombre de usuario y boton para salir. Sin sesion: boton para ingresar -->
        <template v-if="auth.isAuthenticated">
          <q-icon name="person" class="q-mr-xs" />
          <span class="q-mr-md">{{ auth.userName }}</span>
          <q-btn flat dense label="Salir" icon="logout" @click="onLogout" />
        </template>
        <q-btn v-else flat dense label="Ingresar" icon="login" to="/login" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <template v-for="grupo in gruposMenu" :key="grupo.header">
          <q-item-label header>
            {{ grupo.header }}
          </q-item-label>

          <EssentialLink
            v-for="link in grupo.links"
            :key="link.title"
            v-bind="link"
          />
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { useAuthStore } from 'stores/auth';

const auth = useAuthStore();
const router = useRouter();

async function onLogout() {
  auth.logout();
  await router.push('/login');
}

const gruposMenu: { header: string; links: EssentialLinkProps[] }[] = [
  {
    header: 'Catálogo',
    links: [
      { title: 'Categorías', caption: 'Categorías de producto', icon: 'category', link: '/categorias' },
      { title: 'Productos', caption: 'Listado de productos', icon: 'inventory_2', link: '/productos' },
    ],
  },
  {
    header: 'Inventario',
    links: [
      { title: 'Bodegas', caption: 'Depósitos y galpones', icon: 'warehouse', link: '/bodegas' },
      { title: 'Stock por bodega', caption: 'Cantidad por producto y bodega', icon: 'inventory', link: '/stock' },
      { title: 'Movimientos de stock', caption: 'Ingresos, ventas y ajustes', icon: 'swap_horiz', link: '/movimientos-stock' },
      { title: 'Solicitudes de reposición', caption: 'Pedidos de reposición', icon: 'assignment', link: '/solicitudes-reposicion' },
    ],
  },
  {
    header: 'Compras',
    links: [
      { title: 'Proveedores', caption: 'Listado de proveedores', icon: 'local_shipping', link: '/proveedores' },
      { title: 'Órdenes de compra', caption: 'Compras a proveedores', icon: 'shopping_cart', link: '/ordenes-compra' },
    ],
  },
  {
    header: 'Ventas',
    links: [
      { title: 'Clientes', caption: 'Listado de clientes', icon: 'people', link: '/clientes' },
      { title: 'Pedidos', caption: 'Pedidos de clientes', icon: 'receipt_long', link: '/pedidos' },
    ],
  },
  {
    header: 'Reposición',
    links: [
      { title: 'Alertas', caption: 'Faltantes del galpón principal', icon: 'notifications', link: '/reposicion/alertas' },
      { title: 'Parámetros', caption: 'Galpón principal y stock mínimo/máximo', icon: 'tune', link: '/reposicion/parametros' },
    ],
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
