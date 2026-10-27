<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Movimientos de stock</div>
        <q-space />
        <q-input v-model="filtro" dense outlined placeholder="Buscar" debounce="300" style="width: 220px">
          <template #append>
            <q-icon v-if="filtro === ''" name="search" />
            <q-icon v-else name="close" class="cursor-pointer" @click="filtro = ''" />
          </template>
        </q-input>
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nuevo movimiento</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="movimientoStockStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="movimientoStockStore.movimientosStock"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="movimientoStockStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay movimientos para mostrar"
          loading-label="Cargando movimientos..."
        >
          <template #body-cell-tipo="props">
            <q-td>
              <q-badge :color="colorTipo(props.row.tipo)" :label="props.row.tipo" />
            </q-td>
          </template>

          <!-- Columna de acciones: un boton por cada operacion del ABM -->
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

      <q-banner v-if="movimientoStockStore.error" class="bg-negative text-white" rounded>
        {{ movimientoStockStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <MovimientoStockCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section>Se va a eliminar el movimiento. Esta accion no se puede deshacer.</q-card-section>
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
import type { QTableColumn } from 'quasar';
import { useMovimientoStockStore } from 'stores/movimientoStock';
import { useProductoStore } from 'stores/producto';
import { useBodegaStore } from 'stores/bodega';
import type { MovimientoStockResponseDto } from 'src/models/MovimientoStock/MovimientoStockResponseDto';
import MovimientoStockCreate from 'src/components/MovimientoStock/MovimientoStockCreate.vue';
import { notificarError } from 'src/utils/notificar';

const movimientoStockStore = useMovimientoStockStore();
const productoStore = useProductoStore();
const bodegaStore = useBodegaStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<MovimientoStockResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'producto',
    label: 'Producto',
    field: 'idProducto',
    align: 'left',
    sortable: false,
    format: (val: number) => productoStore.productos.find((p) => p.id === val)?.nombre ?? '',
  },
  {
    name: 'bodega',
    label: 'Bodega',
    field: 'idBodega',
    align: 'left',
    sortable: false,
    format: (val: number) => bodegaStore.bodegas.find((b) => b.id === val)?.nombre ?? '',
  },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true,
    format: (val: string) => (val ? val.split('-').reverse().join('/') : ''),
  },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', align: 'left', sortable: false },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

// Colores de badge por tipo de movimiento
function colorTipo(tipo: string) {
  const colores: Record<string, string> = {
    Ingreso: 'positive',
    Venta: 'info',
    Ajuste: 'warning',
    Devolucion: 'secondary',
    Transferencia: 'primary',
  };
  return colores[tipo] ?? 'grey';
}

function recargar() {
  void movimientoStockStore.fetchAll();
  void productoStore.fetchAll();
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

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      await movimientoStockStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el movimiento.');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
