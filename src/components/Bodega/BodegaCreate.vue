<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar bodega' : 'Nueva bodega' }}</div>
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
          v-model="form.direccion"
          label="Dirección"
          outlined
          class="q-mb-sm"
          :maxlength="200"
          counter
        />
        <q-toggle v-model="form.esPrincipal" label="Galpón principal" />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="bodegaStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useBodegaStore } from 'stores/bodega';
import type { BodegaRequestDto } from 'src/models/Bodega/BodegaRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const bodegaStore = useBodegaStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<BodegaRequestDto>({
  nombre: '',
  direccion: '',
  esPrincipal: false,
});

// Si es modificacion, se traen los datos actuales de la bodega
onMounted(async () => {
  if (props.editId) {
    const bodega = await bodegaStore.fetchById(props.editId);
    if (bodega) {
      form.value = {
        nombre: bodega.nombre,
        direccion: bodega.direccion ?? '',
        esPrincipal: bodega.esPrincipal,
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
      await bodegaStore.update(props.editId, form.value);
    } else {
      await bodegaStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar la bodega');
  }
}
</script>
