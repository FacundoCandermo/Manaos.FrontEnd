import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { MovimientoStockResponseDto } from 'src/models/MovimientoStock/MovimientoStockResponseDto';
import type { MovimientoStockRequestDto } from 'src/models/MovimientoStock/MovimientoStockRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useMovimientoStockStore = defineStore('movimientoStock', () => {
  const movimientosStock = ref<MovimientoStockResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/MovimientosStock/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<MovimientoStockResponseDto[]>('/MovimientosStock/All');
      movimientosStock.value = data;
    } catch (e) {
      movimientosStock.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los movimientos de stock`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los movimientos de stock';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/MovimientosStock/ById?Id=... Devuelve el movimiento o null si no existe. */
  async function fetchById(id: number): Promise<MovimientoStockResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<MovimientoStockResponseDto>(`/MovimientosStock/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/MovimientosStock */
  async function create(movimientoStock: MovimientoStockRequestDto) {
    loading.value = true;
    try {
      await api.post('/MovimientosStock', movimientoStock);
      notificarExito('Movimiento registrado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/MovimientosStock?Id=... */
  async function update(id: number, movimientoStock: MovimientoStockRequestDto) {
    loading.value = true;
    try {
      await api.put(`/MovimientosStock?Id=${id}`, movimientoStock);
      notificarExito('Movimiento modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/MovimientosStock?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/MovimientosStock?Id=${id}`);
      notificarExito('Movimiento eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { movimientosStock, loading, error, fetchAll, fetchById, create, update, borrar };
});
