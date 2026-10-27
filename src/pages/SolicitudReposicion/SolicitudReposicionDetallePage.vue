<template>
  <q-page padding>
    <q-card class="q-pa-md q-mb-md">
      <div class="text-h6">Solicitud de reposición #{{ idSolicitud }}</div>
      <q-separator class="q-my-sm" />
      <div v-if="solicitud" class="row q-col-gutter-md">
        <div class="col-12 col-sm-4">
          <div class="text-caption text-grey">Fecha</div>
          <div>{{ fechaFormateada }}</div>
        </div>
        <div class="col-12 col-sm-4">
          <div class="text-caption text-grey">Estado</div>
          <div>{{ solicitud.estado }}</div>
        </div>
        <div class="col-12 col-sm-4">
          <div class="text-caption text-grey">Observaciones</div>
          <div>{{ solicitud.observaciones || '-' }}</div>
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
        <q-btn flat round icon="refresh" :loading="detalleSolicitudReposicionStore.loading" @click="recargarRenglones">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
        <q-btn flat round icon="arrow_back" @click="router.push('/solicitudes-reposicion')">
          <q-tooltip>Volver</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="renglones"
          :columns="columns"
          row-key="id"
          :loading="detalleSolicitudReposicionStore.loading"
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

    <!-- Alta y modificacion de renglones comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <DetalleSolicitudReposicionCreate
        :id-solicitud-reposicion="idSolicitud"
        :edit-id="editId"
        @close="cerrarFormulario"
      />
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
import { useSolicitudReposicionStore } from 'stores/solicitudReposicion';
import { useDetalleSolicitudReposicionStore } from 'stores/detalleSolicitudReposicion';
import { useProductoStore } from 'stores/producto';
import type { SolicitudReposicionResponseDto } from 'src/models/SolicitudReposicion/SolicitudReposicionResponseDto';
import type { DetalleSolicitudReposicionResponseDto } from 'src/models/DetalleSolicitudReposicion/DetalleSolicitudReposicionResponseDto';
import DetalleSolicitudReposicionCreate from 'src/components/DetalleSolicitudReposicion/DetalleSolicitudReposicionCreate.vue';
import { notificarError } from 'src/utils/notificar';

const route = useRoute();
const router = useRouter();
const solicitudReposicionStore = useSolicitudReposicionStore();
const detalleSolicitudReposicionStore = useDetalleSolicitudReposicionStore();
const productoStore = useProductoStore();

const idSolicitud = Number(route.params.id);
const solicitud = ref<SolicitudReposicionResponseDto | null>(null);

const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

// Solo los renglones de esta solicitud
const renglones = computed(() =>
  detalleSolicitudReposicionStore.detallesSolicitudReposicion.filter((d) => d.idSolicitudReposicion === idSolicitud),
);

const fechaFormateada = computed(() =>
  solicitud.value?.fecha ? solicitud.value.fecha.split('-').reverse().join('/') : '',
);

const columns: QTableColumn<DetalleSolicitudReposicionResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'producto',
    label: 'Producto',
    field: 'idProducto',
    align: 'left',
    sortable: false,
    format: (val: number) => productoStore.productos.find((p) => p.id === val)?.nombre ?? '',
  },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'left', sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function recargarRenglones() {
  void detalleSolicitudReposicionStore.fetchAll();
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
  recargarRenglones();
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      await detalleSolicitudReposicionStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar el renglón');
  } finally {
    confirmandoBaja.value = false;
    recargarRenglones();
  }
}

onMounted(async () => {
  solicitud.value = await solicitudReposicionStore.fetchById(idSolicitud);
  await productoStore.fetchAll();
  recargarRenglones();
});
</script>
