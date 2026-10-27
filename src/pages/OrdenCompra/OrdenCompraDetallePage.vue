<template>
  <q-page padding>
    <q-card class="q-pa-md q-mb-md">
      <div class="text-h6">Orden de compra #{{ idOrden }}</div>
      <q-separator class="q-my-sm" />
      <div class="row q-col-gutter-md" v-if="cabecera">
        <div class="col-6 col-md-3">
          <div class="text-caption text-grey">Fecha</div>
          <div>{{ cabecera.fecha.split('-').reverse().join('/') }}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-caption text-grey">Proveedor</div>
          <div>{{ proveedorStore.proveedores.find((p) => p.id === cabecera?.idProveedor)?.nombre ?? '' }}</div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-caption text-grey">Bodega destino</div>
          <div>{{ bodegaStore.bodegas.find((b) => b.id === cabecera?.idBodegaDestino)?.nombre ?? '' }}</div>
        </div>
        <div class="col-6 col-md-1">
          <div class="text-caption text-grey">Estado</div>
          <q-badge :color="colorEstado(cabecera.estado)">{{ cabecera.estado }}</q-badge>
        </div>
        <div class="col-6 col-md-2">
          <div class="text-caption text-grey">Total</div>
          <div>{{ cabecera.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) }}</div>
        </div>
      </div>
    </q-card>

    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Renglones</div>
        <q-space />
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nuevo renglón</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="detalleOrdenCompraStore.loading" @click="recargarDetalle">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="renglones"
          :columns="columns"
          row-key="id"
          :loading="detalleOrdenCompraStore.loading"
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

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <DetalleOrdenCompraCreate :edit-id="editId" :id-orden-compra="idOrden" @close="cerrarFormulario" />
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
import { useRoute } from 'vue-router';
import type { QTableColumn } from 'quasar';
import { useOrdenCompraStore } from 'stores/ordenCompra';
import { useDetalleOrdenCompraStore } from 'stores/detalleOrdenCompra';
import { useProductoStore } from 'stores/producto';
import { useProveedorStore } from 'stores/proveedor';
import { useBodegaStore } from 'stores/bodega';
import type { OrdenCompraResponseDto } from 'src/models/OrdenCompra/OrdenCompraResponseDto';
import type { DetalleOrdenCompraResponseDto } from 'src/models/DetalleOrdenCompra/DetalleOrdenCompraResponseDto';
import { EstadoOrdenCompraOptions } from 'src/models/Enums';
import DetalleOrdenCompraCreate from 'src/components/DetalleOrdenCompra/DetalleOrdenCompraCreate.vue';
import { notificarError } from 'src/utils/notificar';

const route = useRoute();
const idOrden = Number(route.params.id);

const ordenCompraStore = useOrdenCompraStore();
const detalleOrdenCompraStore = useDetalleOrdenCompraStore();
const productoStore = useProductoStore();
const proveedorStore = useProveedorStore();
const bodegaStore = useBodegaStore();

const cabecera = ref<OrdenCompraResponseDto | null>(null);
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const renglones = computed(() =>
  detalleOrdenCompraStore.detallesOrdenCompra.filter((d) => d.idOrdenCompra === idOrden),
);

const columns: QTableColumn<DetalleOrdenCompraResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'idProducto',
    label: 'Producto',
    field: 'idProducto',
    align: 'left',
    sortable: false,
    format: (val: number) => productoStore.productos.find((p) => p.id === val)?.nombre ?? '',
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
    case 'Enviada':
      return 'info';
    case 'Recibida':
      return 'positive';
    case 'Cancelada':
      return 'negative';
    default:
      return 'grey';
  }
}

async function cargarCabecera() {
  cabecera.value = await ordenCompraStore.fetchById(idOrden);
}

function recargarDetalle() {
  void detalleOrdenCompraStore.fetchAll();
}

function abrirAlta() {
  editId.value = null;
  mostrarFormulario.value = true;
}

function abrirEdicion(id: number) {
  editId.value = id;
  mostrarFormulario.value = true;
}

// El PUT espera el DTO completo, por eso se reenvian los datos de cabecera ya cargados
async function recalcularTotal() {
  if (!cabecera.value) {
    return;
  }
  const nuevoTotal = renglones.value.reduce((acc, r) => acc + r.cantidad * r.precioUnitario, 0);
  const estadoNumerico = EstadoOrdenCompraOptions.find((o) => o.label === cabecera.value?.estado)?.value ?? 0;
  await ordenCompraStore.update(idOrden, {
    fecha: cabecera.value.fecha,
    estado: estadoNumerico,
    total: nuevoTotal,
    idProveedor: cabecera.value.idProveedor,
    idBodegaDestino: cabecera.value.idBodegaDestino,
  });
  await cargarCabecera();
}

async function cerrarFormulario() {
  mostrarFormulario.value = false;
  await detalleOrdenCompraStore.fetchAll();
  await recalcularTotal();
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      await detalleOrdenCompraStore.borrar(idABorrar.value);
      await recalcularTotal();
    }
  } catch {
    notificarError('No se pudo eliminar el renglón');
  } finally {
    confirmandoBaja.value = false;
  }
}

onMounted(async () => {
  await productoStore.fetchAll();
  await proveedorStore.fetchAll();
  await bodegaStore.fetchAll();
  await detalleOrdenCompraStore.fetchAll();
  await cargarCabecera();
});
</script>
