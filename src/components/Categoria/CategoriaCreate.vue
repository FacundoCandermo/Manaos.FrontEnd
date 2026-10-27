<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar categoría' : 'Nueva categoría' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-input
          v-model="form.nombre"
          label="Nombre"
          outlined
          class="q-mb-sm"
          :maxlength="50"
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
          :maxlength="200"
          counter
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="categoriaStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useCategoriaStore } from 'stores/categoria';
import type { CategoriaRequestDto } from 'src/models/Categoria/CategoriaRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const categoriaStore = useCategoriaStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<CategoriaRequestDto>({
  nombre: '',
  descripcion: '',
});

// Si es modificacion, se traen los datos actuales de la categoría
onMounted(async () => {
  if (props.editId) {
    const categoria = await categoriaStore.fetchById(props.editId);
    if (categoria) {
      form.value = {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion ?? '',
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
      await categoriaStore.update(props.editId, form.value);
    } else {
      await categoriaStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar la categoría');
  }
}
</script>
