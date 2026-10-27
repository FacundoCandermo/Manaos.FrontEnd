<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="row items-center q-gutter-sm">
        <div class="text-h6">Solicitudes de reposición</div>
        <q-space />
        <q-input v-model="filtro" dense outlined placeholder="Buscar" debounce="300" style="width: 220px">
          <template #append>
            <q-icon v-if="filtro === ''" name="search" />
            <q-icon v-else name="close" class="cursor-pointer" @click="filtro = ''" />
          </template>
        </q-input>
        <q-btn round unelevated color="primary" icon="add" @click="abrirAlta">
          <q-tooltip>Nueva solicitud de reposición</q-tooltip>
        </q-btn>
        <q-btn flat round icon="refresh" :loading="solicitudReposicionStore.loading" @click="recargar">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <q-card-section>
        <q-table
          :rows="solicitudReposicionStore.solicitudesReposicion"
          :columns="columns"
          row-key="id"
          :filter="filtro"
          :loading="solicitudReposicionStore.loading"
          :rows-per-page-options="[10, 20, 50, 0]"
          no-data-label="No hay solicitudes de reposición para mostrar"
          loading-label="Cargando solicitudes de reposición..."
        >
          <!-- Estado como badge de color segun el valor -->
          <template #body-cell-estado="props">
            <q-td class="text-left">
              <q-badge :color="colorEstado(props.row.estado)">{{ props.row.estado }}</q-badge>
            </q-td>
          </template>

          <!-- Columna de acciones: un boton por cada operacion del ABM mas el detalle -->
          <template #body-cell-acciones="props">
            <q-td class="text-right">
              <q-btn dense flat color="secondary" icon="list" @click="irADetalle(props.row.id)">
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

      <q-banner v-if="solicitudReposicionStore.error" class="bg-negative text-white" rounded>
        {{ solicitudReposicionStore.error }}
      </q-banner>
    </q-card>

    <!-- Alta y modificacion comparten el mismo formulario -->
    <q-dialog v-model="mostrarFormulario">
      <SolicitudReposicionCreate :edit-id="editId" @close="cerrarFormulario" />
    </q-dialog>

    <!-- La baja siempre se confirma antes de ejecutarse -->
    <q-dialog v-model="confirmandoBaja">
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="warning" size="sm" class="q-mr-sm" />
          <span class="text-h6">Confirmar</span>
        </q-card-section>
        <q-card-section>
          Se va a eliminar la solicitud de reposición. Se eliminarán también sus renglones. Esta accion no se puede
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
import { useSolicitudReposicionStore } from 'stores/solicitudReposicion';
import { useDetalleSolicitudReposicionStore } from 'stores/detalleSolicitudReposicion';
import type { SolicitudReposicionResponseDto } from 'src/models/SolicitudReposicion/SolicitudReposicionResponseDto';
import SolicitudReposicionCreate from 'src/components/SolicitudReposicion/SolicitudReposicionCreate.vue';
import { notificarError } from 'src/utils/notificar';

const router = useRouter();
const solicitudReposicionStore = useSolicitudReposicionStore();
const detalleSolicitudReposicionStore = useDetalleSolicitudReposicionStore();

const filtro = ref('');
const mostrarFormulario = ref(false);
const editId = ref<number | null>(null);
const confirmandoBaja = ref(false);
const idABorrar = ref<number | null>(null);

const columns: QTableColumn<SolicitudReposicionResponseDto>[] = [
  { name: 'id', label: 'Id', field: 'id', align: 'left', sortable: true },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'center',
    sortable: true,
    // La API devuelve ISO (yyyy-MM-dd); se muestra en formato local
    format: (val: string) => (val ? val.split('-').reverse().join('/') : ''),
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true },
  { name: 'observaciones', label: 'Observaciones', field: 'observaciones', align: 'left', sortable: false },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'right', sortable: false },
];

function colorEstado(estado: string) {
  switch (estado) {
    case 'Pendiente':
      return 'warning';
    case 'Aprobada':
      return 'positive';
    case 'Rechazada':
      return 'negative';
    case 'Convertida':
      return 'info';
    default:
      return 'grey';
  }
}

function recargar() {
  void solicitudReposicionStore.fetchAll();
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
  void router.push(`/solicitudes-reposicion/${id}/detalle`);
}

function confirmarBaja(id: number) {
  idABorrar.value = id;
  confirmandoBaja.value = true;
}

async function eliminar() {
  try {
    if (idABorrar.value !== null) {
      // Primero se borran los renglones de la solicitud para no violar la FK
      await detalleSolicitudReposicionStore.fetchAll();
      const renglones = detalleSolicitudReposicionStore.detallesSolicitudReposicion.filter(
        (d) => d.idSolicitudReposicion === idABorrar.value,
      );
      for (const renglon of renglones) {
        await detalleSolicitudReposicionStore.borrar(renglon.id);
      }
      await solicitudReposicionStore.borrar(idABorrar.value);
    }
  } catch {
    notificarError('No se pudo eliminar la solicitud de reposición');
  } finally {
    confirmandoBaja.value = false;
    recargar();
  }
}

onMounted(() => {
  recargar();
});
</script>
