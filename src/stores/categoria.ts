import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { CategoriaResponseDto } from 'src/models/Categoria/CategoriaResponseDto';
import type { CategoriaRequestDto } from 'src/models/Categoria/CategoriaRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useCategoriaStore = defineStore('categoria', () => {
  const categorias = ref<CategoriaResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Categorias/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<CategoriaResponseDto[]>('/Categorias/All');
      categorias.value = data;
    } catch (e) {
      categorias.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener las categorías`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener las categorías';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Categorias/ById?Id=... Devuelve la categoría o null si no existe. */
  async function fetchById(id: number): Promise<CategoriaResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<CategoriaResponseDto>(`/Categorias/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Categorias */
  async function create(categoria: CategoriaRequestDto) {
    loading.value = true;
    try {
      await api.post('/Categorias', categoria);
      notificarExito('Categoría creada');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Categorias?Id=... */
  async function update(id: number, categoria: CategoriaRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Categorias?Id=${id}`, categoria);
      notificarExito('Categoría modificada');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Categorias?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Categorias?Id=${id}`);
      notificarExito('Categoría eliminada');
    } finally {
      loading.value = false;
    }
  }

  return { categorias, loading, error, fetchAll, fetchById, create, update, borrar };
});
