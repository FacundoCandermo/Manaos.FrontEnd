<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar producto' : 'Nuevo producto' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-input
          v-model="form.nombre"
          label="Nombre"
          outlined
          class="q-mb-sm"
          :maxlength="100"
          counter
          lazy-rules
          :rules="[(v: string) => (!!v && v.trim().length > 0) || 'Ingresa el nombre']"
        />
        <q-input
          v-model="form.descripcion"
          label="Descripción"
          type="textarea"
          outlined
          class="q-mb-sm"
          :maxlength="300"
          counter
        />
        <q-input
          v-model.number="form.precio"
          label="Precio"
          type="number"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: number) => (v !== null && v >= 0) || 'Ingresa un precio valido']"
        />
        <q-select
          v-model="form.idCategoriaProducto"
          label="Categoría"
          outlined
          class="q-mb-sm"
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          :options="categoriaStore.categorias"
          lazy-rules
          :rules="[(v: number) => !!v || 'Selecciona una categoría']"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="productoStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useProductoStore } from 'stores/producto';
import { useCategoriaStore } from 'stores/categoria';
import type { ProductoRequestDto } from 'src/models/Producto/ProductoRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const productoStore = useProductoStore();
const categoriaStore = useCategoriaStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<ProductoRequestDto>({
  nombre: '',
  descripcion: '',
  precio: 0,
  idCategoriaProducto: 0,
});

// Si es modificacion, se traen los datos actuales del producto
onMounted(async () => {
  await categoriaStore.fetchAll();
  if (props.editId) {
    const producto = await productoStore.fetchById(props.editId);
    if (producto) {
      form.value = {
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        precio: producto.precio,
        idCategoriaProducto: producto.idCategoriaProducto,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  try {
    if (props.editId) {
      await productoStore.update(props.editId, form.value);
    } else {
      await productoStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el producto');
  }
}
</script>
