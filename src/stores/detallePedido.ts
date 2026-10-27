import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { DetallePedidoResponseDto } from 'src/models/DetallePedido/DetallePedidoResponseDto';
import type { DetallePedidoRequestDto } from 'src/models/DetallePedido/DetallePedidoRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useDetallePedidoStore = defineStore('detallePedido', () => {
  const detallesPedido = ref<DetallePedidoResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/DetallesPedidos/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<DetallePedidoResponseDto[]>('/DetallesPedidos/All');
      detallesPedido.value = data;
    } catch (e) {
      detallesPedido.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los renglones de pedido`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los renglones de pedido';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/DetallesPedidos/ById?Id=... Devuelve el renglon o null si no existe. */
  async function fetchById(id: number): Promise<DetallePedidoResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<DetallePedidoResponseDto>(`/DetallesPedidos/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/DetallesPedidos */
  async function create(detalle: DetallePedidoRequestDto) {
    loading.value = true;
    try {
      await api.post('/DetallesPedidos', detalle);
      notificarExito('Renglón creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/DetallesPedidos?Id=... */
  async function update(id: number, detalle: DetallePedidoRequestDto) {
    loading.value = true;
    try {
      await api.put(`/DetallesPedidos?Id=${id}`, detalle);
      notificarExito('Renglón modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/DetallesPedidos?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/DetallesPedidos?Id=${id}`);
      notificarExito('Renglón eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { detallesPedido, loading, error, fetchAll, fetchById, create, update, borrar };
});
