import { defineStore } from 'pinia';
import { ref } from 'vue';
import { isAxiosError } from 'axios';
import { api } from 'boot/axios';
import type { ProductoResponseDto } from 'src/models/Producto/ProductoResponseDto';
import type { ProductoRequestDto } from 'src/models/Producto/ProductoRequestDto';
import { notificarExito } from 'src/utils/notificar';

export const useProductoStore = defineStore('producto', () => {
  const productos = ref<ProductoResponseDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** GET api/Productos/All */
  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ProductoResponseDto[]>('/Productos/All');
      productos.value = data;
    } catch (e) {
      productos.value = [];
      if (isAxiosError(e)) {
        error.value = e.response
          ? `Error ${e.response.status} al obtener los productos`
          : 'No se pudo conectar con la API';
      } else {
        error.value = 'Error inesperado al obtener los productos';
      }
    } finally {
      loading.value = false;
    }
  }

  /** GET api/Productos/ById?Id=... Devuelve el producto o null si no existe. */
  async function fetchById(id: number): Promise<ProductoResponseDto | null> {
    loading.value = true;
    try {
      const { data } = await api.get<ProductoResponseDto>(`/Productos/ById?Id=${id}`);
      return data;
    } catch {
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** POST api/Productos */
  async function create(producto: ProductoRequestDto) {
    loading.value = true;
    try {
      await api.post('/Productos', producto);
      notificarExito('Producto creado');
    } finally {
      loading.value = false;
    }
  }

  /** PUT api/Productos?Id=... */
  async function update(id: number, producto: ProductoRequestDto) {
    loading.value = true;
    try {
      await api.put(`/Productos?Id=${id}`, producto);
      notificarExito('Producto modificado');
    } finally {
      loading.value = false;
    }
  }

  /** DELETE api/Productos?Id=... (se llama borrar porque delete es palabra reservada) */
  async function borrar(id: number) {
    loading.value = true;
    try {
      await api.delete(`/Productos?Id=${id}`);
      notificarExito('Producto eliminado');
    } finally {
      loading.value = false;
    }
  }

  return { productos, loading, error, fetchAll, fetchById, create, update, borrar };
});
