import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { ClienteResponseDto } from 'src/models/Cliente/ClienteResponseDto';
import type { ClienteRequestDto } from 'src/models/Cliente/ClienteRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useClienteStore = defineStore('cliente', () => {
  const clientes = ref<ClienteResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Clientes/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ClienteResponseDto[]>('/Clientes/All');
      clientes.value = data;
    } catch (e) {
      clientes.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los clientes`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los clientes';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Clientes/ById?Id=... Devuelve el cliente o null si no existe. */
  async function fetchById(id: number): Promise<ClienteResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<ClienteResponseDto>(`/Clientes/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Clientes */
  async function create(cliente: ClienteRequestDto) {
    loading.value = true;
    try {
      await api.post('/Clientes', cliente);
      notificarExito('Cliente creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Clientes?Id=... */
  async function update(id: number, cliente: ClienteRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Clientes?Id=${id}`, cliente);
      notificarExito('Cliente modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Clientes?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Clientes?Id=${id}`);
      notificarExito('Cliente eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { clientes, loading, error, fetchAll, fetchById, create, update, borrar };
});
