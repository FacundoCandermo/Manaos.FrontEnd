import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { DetalleSolicitudReposicionResponseDto } from 'src/models/DetalleSolicitudReposicion/DetalleSolicitudReposicionResponseDto';
import type { DetalleSolicitudReposicionRequestDto } from 'src/models/DetalleSolicitudReposicion/DetalleSolicitudReposicionRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useDetalleSolicitudReposicionStore = defineStore('detalleSolicitudReposicion', () => {
  const detallesSolicitudReposicion = ref<DetalleSolicitudReposicionResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/DetallesSolicitudesReposicion/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<DetalleSolicitudReposicionResponseDto[]>('/DetallesSolicitudesReposicion/All');
      detallesSolicitudReposicion.value = data;
    } catch (e) {
      detallesSolicitudReposicion.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los renglones de la solicitud`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los renglones de la solicitud';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/DetallesSolicitudesReposicion/ById?Id=... Devuelve el renglon o null si no existe. */
  async function fetchById(id: number): Promise<DetalleSolicitudReposicionResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<DetalleSolicitudReposicionResponseDto>(
        `/DetallesSolicitudesReposicion/ById?Id=${id}`,
      );
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/DetallesSolicitudesReposicion */
  async function create(detalle: DetalleSolicitudReposicionRequestDto) {
    loading.value = true;
    try {
      await api.post('/DetallesSolicitudesReposicion', detalle);
      notificarExito('Renglón creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/DetallesSolicitudesReposicion?Id=... */
  async function update(id: number, detalle: DetalleSolicitudReposicionRequestDto) {
    loading.value = true;
    try {
      await api.put(`/DetallesSolicitudesReposicion?Id=${id}`, detalle);
      notificarExito('Renglón modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/DetallesSolicitudesReposicion?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/DetallesSolicitudesReposicion?Id=${id}`);
      notificarExito('Renglón eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { detallesSolicitudReposicion, loading, error, fetchAll, fetchById, create, update, borrar };
});
