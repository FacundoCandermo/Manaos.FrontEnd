import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { StockBodegaResponseDto } from 'src/models/StockBodega/StockBodegaResponseDto';
import type { StockBodegaRequestDto } from 'src/models/StockBodega/StockBodegaRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useStockBodegaStore = defineStore('stockBodega', () => {
  const stocksBodega = ref<StockBodegaResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/StocksBodegas/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<StockBodegaResponseDto[]>('/StocksBodegas/All');
      stocksBodega.value = data;
    } catch (e) {
      stocksBodega.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener el stock`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener el stock';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/StocksBodegas/ById?Id=... Devuelve el stock o null si no existe. */
  async function fetchById(id: number): Promise<StockBodegaResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<StockBodegaResponseDto>(`/StocksBodegas/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/StocksBodegas */
  async function create(stockBodega: StockBodegaRequestDto) {
    loading.value = true;
    try {
      await api.post('/StocksBodegas', stockBodega);
      notificarExito('Stock creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/StocksBodegas?Id=... */
  async function update(id: number, stockBodega: StockBodegaRequestDto) {
    loading.value = true;
    try {
      await api.put(`/StocksBodegas?Id=${id}`, stockBodega);
      notificarExito('Stock modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/StocksBodegas?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/StocksBodegas?Id=${id}`);
      notificarExito('Stock eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { stocksBodega, loading, error, fetchAll, fetchById, create, update, borrar };
});
