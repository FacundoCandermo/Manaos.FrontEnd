<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Órdenes de compra</div>
        <q-space />
        <q-input v-model="filtro" dense outlined placeholder="Buscar" debounce="300" style="width: 220px">
          <template #append>
            <q-icon v-if="filtro === ''" name="search" />
            <q-icon v-else name="close" class="cursor-pointer" @click="filtro = ''" />
          </template>
        </q-input>
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nueva orden de compra</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="ordenCompraStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="ordenCompraStore.ordenesCompra"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="ordenCompraStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay órdenes de compra para mostrar"
          loading-label="Cargando órdenes de compra..."
        >
          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-badge :color="colorEstado(props.row.estado)">{{ props.row.estado }}</q-badge>
            </q-td>
          </template>

          <!-- Columna de acciones: un boton por cada operacion del ABM mas el detalle -->
          <template #body-cell-acciones="props">
            <q-td class="text-right">
              <q-btn dense flat color="info" icon="list" @click="irADetalle(props.row.id)">
                <q-tooltip>Detalle</q-tooltip>
              </q-btn>
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

      <q-banner v-if="ordenCompraStore.error" class="bg-negative text-white" rounded>
        {{ ordenCompraStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <OrdenCompraCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section>
          Se va a eliminar la orden de compra. Se eliminarán también sus renglones. Esta accion no se puede
          deshacer.
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
import { useOrdenCompraStore } from 'stores/ordenCompra';
import { useDetalleOrdenCompraStore } from 'stores/detalleOrdenCompra';
import { useProveedorStore } from 'stores/proveedor';
import { useBodegaStore } from 'stores/bodega';
import type { OrdenCompraResponseDto } from 'src/models/OrdenCompra/OrdenCompraResponseDto';
import OrdenCompraCreate from 'src/components/OrdenCompra/OrdenCompraCreate.vue';
import { notificarError } from 'src/utils/notificar';

const router = useRouter();
const ordenCompraStore = useOrdenCompraStore();
const detalleOrdenCompraStore = useDetalleOrdenCompraStore();
const proveedorStore = useProveedorStore();
const bodegaStore = useBodegaStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<OrdenCompraResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'center',
    sortable: true,
    format: (val: string) => (val ? val.split('-').reverse().join('/') : ''),
  },
  {
    name: 'idProveedor',
    label: 'Proveedor',
    field: 'idProveedor',
    align: 'left',
    sortable: false,
    format: (val: number) => proveedorStore.proveedores.find((p) => p.id === val)?.nombre ?? '',
  },
  {
    name: 'idBodegaDestino',
    label: 'Bodega destino',
    field: 'idBodegaDestino',
    align: 'left',
    sortable: false,
    format: (val: number) => bodegaStore.bodegas.find((b) => b.id === val)?.nombre ?? '',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
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

function recargar() {
  void ordenCompraStore.fetchAll();
  void proveedorStore.fetchAll();
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
  void router.push(`/ordenes-compra/${id}/detalle`);
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      // primero hay que borrar los renglones, la API no permite borrar la cabecera si tiene detalle
      await detalleOrdenCompraStore.fetchAll();
      const renglones = detalleOrdenCompraStore.detallesOrdenCompra.filter(
        (d) => d.idOrdenCompra === idABorrar.value,
      );
      for (const renglon of renglones) {
        await detalleOrdenCompraStore.borrar(renglon.id);
      }
      await ordenCompraStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar la orden de compra');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
