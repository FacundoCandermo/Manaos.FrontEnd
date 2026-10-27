import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { OrdenCompraResponseDto } from 'src/models/OrdenCompra/OrdenCompraResponseDto';
import type { OrdenCompraRequestDto } from 'src/models/OrdenCompra/OrdenCompraRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useOrdenCompraStore = defineStore('ordenCompra', () => {
  const ordenesCompra = ref<OrdenCompraResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/OrdenesCompra/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<OrdenCompraResponseDto[]>('/OrdenesCompra/All');
      ordenesCompra.value = data;
    } catch (e) {
      ordenesCompra.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las órdenes de compra`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las órdenes de compra';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/OrdenesCompra/ById?Id=... Devuelve la orden de compra o null si no existe. */
  async function fetchById(id: number): Promise<OrdenCompraResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<OrdenCompraResponseDto>(`/OrdenesCompra/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/OrdenesCompra */
  async function create(ordenCompra: OrdenCompraRequestDto) {
    loading.value = true;
    try {
      await api.post('/OrdenesCompra', ordenCompra);
      notificarExito('Orden de compra creada');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/OrdenesCompra?Id=... */
  async function update(id: number, ordenCompra: OrdenCompraRequestDto) {
    loading.value = true;
    try {
      await api.put(`/OrdenesCompra?Id=${id}`, ordenCompra);
      notificarExito('Orden de compra modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/OrdenesCompra?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/OrdenesCompra?Id=${id}`);
      notificarExito('Orden de compra eliminada');
    } finally {
      loading.value = false;
    }
  }

  return { ordenesCompra, loading, error, fetchAll, fetchById, create, update, borrar };
});
