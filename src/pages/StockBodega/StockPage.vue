<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Stock por bodega</div>
        <q-space />
        <q-select
          v-model="bodegaFiltro"
          dense
          outlined
          clearable
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          label="Bodega"
          :options="bodegaStore.bodegas"
          style="width: 220px"
        />
        <q-input v-model="filtro" dense outlined placeholder="Buscar" debounce="300" style="width: 220px">
          <template #append>
            <q-icon v-if="filtro === ''" name="search" />
            <q-icon v-else name="close" class="cursor-pointer" @click="filtro = ''" />
          </template>
        </q-input>
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nuevo stock</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="stockBodegaStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="filasFiltradas"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="stockBodegaStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay stock para mostrar"
          loading-label="Cargando stock..."
        >
          <!-- La cantidad se edita al vuelo desde la propia celda -->
          <template #body-cell-cantidad="props">
            <q-td>
              {{ props.row.cantidad }}
              <q-popup-edit
                v-model="props.row.cantidad"
                v-slot="scope"
                @save="(valor: number) => guardarCantidad(props.row, valor)"
              >
                <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td>
              <q-badge v-if="props.row.cantidad < props.row.stockMinimo" color="negative" label="Bajo mínimo" />
              <q-badge v-else color="positive" label="OK" />
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

      <q-banner v-if="stockBodegaStore.error" class="bg-negative text-white" rounded>
        {{ stockBodegaStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <StockBodegaCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section>Se va a eliminar el stock. Esta accion no se puede deshacer.</q-card-section>
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
import type { QTableColumn } from 'quasar';
import { useStockBodegaStore } from 'stores/stockBodega';
import { useProductoStore } from 'stores/producto';
import { useBodegaStore } from 'stores/bodega';
import type { StockBodegaResponseDto } from 'src/models/StockBodega/StockBodegaResponseDto';
import StockBodegaCreate from 'src/components/StockBodega/StockBodegaCreate.vue';
import { notificarError } from 'src/utils/notificar';

const stockBodegaStore = useStockBodegaStore();
const productoStore = useProductoStore();
const bodegaStore = useBodegaStore();

const filtro = ref('');
const bodegaFiltro = ref<number | null>(null);
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<StockBodegaResponseDto>[] = [
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
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
  { name: 'stockMinimo', label: 'Mínimo', field: 'stockMinimo', align: 'right', sortable: true },
  { name: 'stockMaximo', label: 'Máximo', field: 'stockMaximo', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'id', align: 'left', sortable: false },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

// Filtro por bodega: por defecto la principal, si hay alguna
const filasFiltradas = computed(() => {
  if (bodegaFiltro.value === null) {
    return stockBodegaStore.stocksBodega;
  }
  return stockBodegaStore.stocksBodega.filter((s) => s.idBodega === bodegaFiltro.value);
});

function recargar() {
  void stockBodegaStore.fetchAll();
  void productoStore.fetchAll();
  void bodegaStore.fetchAll();
}

async function guardarCantidad(row: StockBodegaResponseDto, cantidad: number) {
  await stockBodegaStore.update(row.id, {
    idProducto: row.idProducto,
    idBodega: row.idBodega,
    cantidad,
    stockMinimo: row.stockMinimo,
    stockMaximo: row.stockMaximo,
  });
  recargar();
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
      await stockBodegaStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el stock. Verificá que no tenga movimientos asociados.');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(async () => {
  await bodegaStore.fetchAll();
  const principal = bodegaStore.bodegas.find((b) => b.esPrincipal);
  if (principal) {
    bodegaFiltro.value = principal.id;
  }
  recargar();
});
</script>
