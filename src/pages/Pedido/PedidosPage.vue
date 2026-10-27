<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Pedidos</div>
        <q-space />
        <q-input v-model="filtro" dense outlined placeholder="Buscar" debounce="300" style="width: 220px">
          <template #append>
            <q-icon v-if="filtro === ''" name="search" />
            <q-icon v-else name="close" class="cursor-pointer" @click="filtro = ''" />
          </template>
        </q-input>
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nuevo pedido</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="pedidoStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="pedidoStore.pedidos"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="pedidoStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay pedidos para mostrar"
          loading-label="Cargando pedidos..."
        >
          <template #body-cell-estado="props">
            <q-td>
              <q-badge :color="colorEstado(props.row.estado)">{{ props.row.estado }}</q-badge>
            </q-td>
          </template>

          <!-- Columna de acciones: edicion, detalle de renglones y baja -->
          <template #body-cell-acciones="props">
            <q-td class="text-right">
              <q-btn dense flat color="primary" icon="edit" @click="abrirEdicion(props.row.id)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn dense flat color="secondary" icon="list" @click="irADetalle(props.row.id)">
                <q-tooltip>Detalle</q-tooltip>
              </q-btn>
              <q-btn dense flat color="negative" icon="delete" @click="confirmarBaja(props.row.id)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-banner v-if="pedidoStore.error" class="bg-negative text-white" rounded>
        {{ pedidoStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <PedidoCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section>
          Se va a eliminar el pedido. Se eliminarán también sus renglones. Esta accion no se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="eliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { QTableColumn } from 'quasar';
import { usePedidoStore } from 'stores/pedido';
import { useClienteStore } from 'stores/cliente';
import { useBodegaStore } from 'stores/bodega';
import { useDetallePedidoStore } from 'stores/detallePedido';
import type { PedidoResponseDto } from 'src/models/Pedido/PedidoResponseDto';
import PedidoCreate from 'src/components/Pedido/PedidoCreate.vue';
import { notificarError } from 'src/utils/notificar';

const router = useRouter();
const pedidoStore = usePedidoStore();
const clienteStore = useClienteStore();
const bodegaStore = useBodegaStore();
const detallePedidoStore = useDetallePedidoStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<PedidoResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true,
    format: (val: string) => (val ? val.split('-').reverse().join('/') : ''),
  },
  {
    name: 'cliente',
    label: 'Cliente',
    field: 'idCliente',
    align: 'left',
    sortable: false,
    format: (val, row) => clienteStore.clientes.find((c) => c.id === row.idCliente)?.nombre ?? '',
  },
  {
    name: 'bodega',
    label: 'Bodega origen',
    field: 'idBodegaOrigen',
    align: 'left',
    sortable: false,
    format: (val, row) => bodegaStore.bodegas.find((b) => b.id === row.idBodegaOrigen)?.nombre ?? '',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'right',
    sortable: true,
    format: (val: number) => val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
  },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function colorEstado(estado: string) {
  switch (estado) {
    case 'Pendiente':
      return 'warning';
    case 'Confirmado':
      return 'info';
    case 'Entregado':
      return 'positive';
    case 'Cancelado':
      return 'negative';
    default:
      return 'grey';
  }
}

function recargar() {
  void pedidoStore.fetchAll();
  void clienteStore.fetchAll();
  void bodegaStore.fetchAll();
}

function abrirAlta() {
  editId.value = null;
  mostrarFormulario.value = true;
}

function abrirEdicion(id: number) {
  editId.value = id;
  mostrarFormulario.value = true;
}

function cerrarFormulario() {
  mostrarFormulario.value = false;
  recargar();
}

function irADetalle(id: number) {
  void router.push(`/pedidos/${id}/detalle`);
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      // Primero hay que borrar los renglones del pedido, sino la API rechaza la baja por la relacion
      await detallePedidoStore.fetchAll();
      const renglones = detallePedidoStore.detallesPedido.filter((d) => d.idPedido === idABorrar.value);
      for (const renglon of renglones) {
        await detallePedidoStore.borrar(renglon.id);
      }
      await pedidoStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el pedido.');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
