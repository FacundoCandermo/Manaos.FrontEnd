import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { SolicitudReposicionResponseDto } from 'src/models/SolicitudReposicion/SolicitudReposicionResponseDto';
import type { SolicitudReposicionRequestDto } from 'src/models/SolicitudReposicion/SolicitudReposicionRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useSolicitudReposicionStore = defineStore('solicitudReposicion', () => {
  const solicitudesReposicion = ref<SolicitudReposicionResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/SolicitudesReposicion/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<SolicitudReposicionResponseDto[]>('/SolicitudesReposicion/All');
      solicitudesReposicion.value = data;
    } catch (e) {
      solicitudesReposicion.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las solicitudes de reposición`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las solicitudes de reposición';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/SolicitudesReposicion/ById?Id=... Devuelve la solicitud o null si no existe. */
  async function fetchById(id: number): Promise<SolicitudReposicionResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<SolicitudReposicionResponseDto>(`/SolicitudesReposicion/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/SolicitudesReposicion */
  async function create(solicitud: SolicitudReposicionRequestDto) {
    loading.value = true;
    try {
      await api.post('/SolicitudesReposicion', solicitud);
      notificarExito('Solicitud de reposición creada');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/SolicitudesReposicion?Id=... */
  async function update(id: number, solicitud: SolicitudReposicionRequestDto) {
    loading.value = true;
    try {
      await api.put(`/SolicitudesReposicion?Id=${id}`, solicitud);
      notificarExito('Solicitud de reposición modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/SolicitudesReposicion?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/SolicitudesReposicion?Id=${id}`);
      notificarExito('Solicitud de reposición eliminada');
    } finally {
      loading.value = false;
    }
  }

  return { solicitudesReposicion, loading, error, fetchAll, fetchById, create, update, borrar };
});
