import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { BodegaResponseDto } from 'src/models/Bodega/BodegaResponseDto';
import type { BodegaRequestDto } from 'src/models/Bodega/BodegaRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useBodegaStore = defineStore('bodega', () => {
  const bodegas = ref<BodegaResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Bodegas/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<BodegaResponseDto[]>('/Bodegas/All');
      bodegas.value = data;
    } catch (e) {
      bodegas.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las bodegas`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las bodegas';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Bodegas/ById?Id=... Devuelve la bodega o null si no existe. */
  async function fetchById(id: number): Promise<BodegaResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<BodegaResponseDto>(`/Bodegas/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Bodegas */
  async function create(bodega: BodegaRequestDto) {
    loading.value = true;
    try {
      await api.post('/Bodegas', bodega);
      notificarExito('Bodega creada');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Bodegas?Id=... */
  async function update(id: number, bodega: BodegaRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Bodegas?Id=${id}`, bodega);
      notificarExito('Bodega modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Bodegas?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Bodegas?Id=${id}`);
      notificarExito('Bodega eliminada');
    } finally {
      loading.value = false;
    }
  }

  return { bodegas, loading, error, fetchAll, fetchById, create, update, borrar };
});
