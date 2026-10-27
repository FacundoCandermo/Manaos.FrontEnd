import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { DetalleOrdenCompraResponseDto } from 'src/models/DetalleOrdenCompra/DetalleOrdenCompraResponseDto';
import type { DetalleOrdenCompraRequestDto } from 'src/models/DetalleOrdenCompra/DetalleOrdenCompraRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useDetalleOrdenCompraStore = defineStore('detalleOrdenCompra', () => {
  const detallesOrdenCompra = ref<DetalleOrdenCompraResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/DetallesOrdenesCompra/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<DetalleOrdenCompraResponseDto[]>('/DetallesOrdenesCompra/All');
      detallesOrdenCompra.value = data;
    } catch (e) {
      detallesOrdenCompra.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los renglones de las órdenes de compra`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los renglones de las órdenes de compra';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/DetallesOrdenesCompra/ById?Id=... Devuelve el renglon o null si no existe. */
  async function fetchById(id: number): Promise<DetalleOrdenCompraResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<DetalleOrdenCompraResponseDto>(`/DetallesOrdenesCompra/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/DetallesOrdenesCompra */
  async function create(detalle: DetalleOrdenCompraRequestDto) {
    loading.value = true;
    try {
      await api.post('/DetallesOrdenesCompra', detalle);
      notificarExito('Renglón creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/DetallesOrdenesCompra?Id=... */
  async function update(id: number, detalle: DetalleOrdenCompraRequestDto) {
    loading.value = true;
    try {
      await api.put(`/DetallesOrdenesCompra?Id=${id}`, detalle);
      notificarExito('Renglón modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/DetallesOrdenesCompra?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/DetallesOrdenesCompra?Id=${id}`);
      notificarExito('Renglón eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { detallesOrdenCompra, loading, error, fetchAll, fetchById, create, update, borrar };
});
