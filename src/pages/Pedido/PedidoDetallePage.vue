<template>
  <q-page padding>
    <q-card class="q-pa-md q-mb-md">
      <div class="text-h6 q-mb-sm">Pedido #{{ pedidoId }}</div>
      <div v-if="cabecera" class="row q-gutter-md">
        <div><span class="text-grey-7">Fecha:</span> {{ fechaFormateada }}</div>
        <div><span class="text-grey-7">Cliente:</span> {{ nombreCliente }}</div>
        <div><span class="text-grey-7">Bodega origen:</span> {{ nombreBodega }}</div>
        <div>
          <span class="text-grey-7">Estado:</span>
          <q-badge :color="colorEstado(cabecera.estado)" class="q-ml-xs">{{ cabecera.estado }}</q-badge>
        </div>
        <div><span class="text-grey-7">Total:</span> {{ totalFormateado }}</div>
      </div>
    </q-card>

    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Renglones</div>
        <q-space />
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nuevo renglón</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="detallePedidoStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
        <q-btn flat round icon="arrow_back" @click="router.push('/pedidos')">
          <q-tooltip>Volver a pedidos</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="renglones"
          :columns="columns"
          row-key="id"
          :loading="detallePedidoStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay renglones para mostrar"
          loading-label="Cargando renglones..."
        >
          <template #body-cell-acciones="props">
            <q-td class="text-right">
              <q-btn dense flat color="primary" icon="edit" @click="abrirEdicion(props.row.id)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn dense flat color="negative" icon="delete" @click="confirmarBaja(props.row.id)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Alta y modificacion del renglon comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <DetallePedidoCreate :id-pedido="pedidoId" :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section>Se va a eliminar el renglón. Esta accion no se puede deshacer.</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" color="negative" @click="eliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { QTableColumn } from 'quasar';
import { usePedidoStore } from 'stores/pedido';
import { useDetallePedidoStore } from 'stores/detallePedido';
import { useClienteStore } from 'stores/cliente';
import { useBodegaStore } from 'stores/bodega';
import { useProductoStore } from 'stores/producto';
import type { PedidoResponseDto } from 'src/models/Pedido/PedidoResponseDto';
import type { DetallePedidoResponseDto } from 'src/models/DetallePedido/DetallePedidoResponseDto';
import { EstadoPedidoOptions } from 'src/models/Enums';
import DetallePedidoCreate from 'src/components/DetallePedido/DetallePedidoCreate.vue';
import { notificarError } from 'src/utils/notificar';

const route = useRoute();
const router = useRouter();
const pedidoId = Number(route.params.id);

const pedidoStore = usePedidoStore();
const detallePedidoStore = useDetallePedidoStore();
const clienteStore = useClienteStore();
const bodegaStore = useBodegaStore();
const productoStore = useProductoStore();

const cabecera = ref<PedidoResponseDto | null>(null);

const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const renglones = computed(() =>
  detallePedidoStore.detallesPedido.filter((d) => d.idPedido === pedidoId),
);

const fechaFormateada = computed(() =>
  cabecera.value ? cabecera.value.fecha.split('-').reverse().join('/') : '',
);
const nombreCliente = computed(
  () => clienteStore.clientes.find((c) => c.id === cabecera.value?.idCliente)?.nombre ?? '',
);
const nombreBodega = computed(
  () => bodegaStore.bodegas.find((b) => b.id === cabecera.value?.idBodegaOrigen)?.nombre ?? '',
);
const totalFormateado = computed(() =>
  (cabecera.value?.total ?? 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
);

const columns: QTableColumn<DetallePedidoResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'producto',
    label: 'Producto',
    field: 'idProducto',
    align: 'left',
    sortable: false,
    format: (val, row) => productoStore.productos.find((p) => p.id === row.idProducto)?.nombre ?? '',
  },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
  {
    name: 'precioUnitario',
    label: 'Precio unitario',
    field: 'precioUnitario',
    align: 'right',
    sortable: false,
    format: (val: number) => val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
  },
  {
    name: 'subtotal',
    label: 'Subtotal',
    field: 'subtotal',
    align: 'right',
    sortable: false,
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
  void detallePedidoStore.fetchAll();
}

function abrirAlta() {
  editId.value = null;
  mostrarFormulario.value = true;
}

function abrirEdicion(id: number) {
  editId.value = id;
  mostrarFormulario.value = true;
}

async function cerrarFormulario() {
  mostrarFormulario.value = false;
  await recalcularTotal();
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      await detallePedidoStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el renglón.');
  } finally {
    confirmandoBaja.value = false;
    await recalcularTotal();
  }
}

// El total del pedido se recalcula en base a los renglones vigentes y se persiste con el resto de la cabecera
async function recalcularTotal() {
  await detallePedidoStore.fetchAll();
  if (!cabecera.value) {
    return;
  }
  const nuevoTotal = renglones.value.reduce((acc, r) => acc + r.cantidad * r.precioUnitario, 0);
  await pedidoStore.update(pedidoId, {
    fecha: cabecera.value.fecha,
    estado: EstadoPedidoOptions.find((o) => o.label === cabecera.value?.estado)?.value ?? 0,
    idCliente: cabecera.value.idCliente,
    idBodegaOrigen: cabecera.value.idBodegaOrigen,
    total: nuevoTotal,
  });
  const actualizado = await pedidoStore.fetchById(pedidoId);
  if (actualizado) {
    cabecera.value = actualizado;
  }
}

onMounted(async () => {
  await Promise.all([clienteStore.fetchAll(), bodegaStore.fetchAll(), productoStore.fetchAll()]);
  await detallePedidoStore.fetchAll();
  cabecera.value = await pedidoStore.fetchById(pedidoId);
});
</script>
