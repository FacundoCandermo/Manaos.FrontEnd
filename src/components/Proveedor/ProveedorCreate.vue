<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar proveedor' : 'Nuevo proveedor' }}</div>
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
          v-model="form.cuit"
          label="CUIT"
          outlined
          class="q-mb-sm"
          :maxlength="13"
          counter
        />
        <q-input
          v-model="form.telefono"
          label="Teléfono"
          outlined
          class="q-mb-sm"
          :maxlength="30"
          counter
        />
        <q-input
          v-model="form.email"
          label="Email"
          type="email"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[
            (v: string) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || 'Ingresa un email valido',
          ]"
        />
        <q-input
          v-model="form.direccion"
          label="Dirección"
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
        :loading="proveedorStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useProveedorStore } from 'stores/proveedor';
import type { ProveedorRequestDto } from 'src/models/Proveedor/ProveedorRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const proveedorStore = useProveedorStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<ProveedorRequestDto>({
  nombre: '',
  cuit: '',
  telefono: '',
  email: '',
  direccion: '',
});

// Si es modificacion, se traen los datos actuales del proveedor
onMounted(async () => {
  if (props.editId) {
    const proveedor = await proveedorStore.fetchById(props.editId);
    if (proveedor) {
      form.value = {
        nombre: proveedor.nombre,
        cuit: proveedor.cuit ?? '',
        telefono: proveedor.telefono ?? '',
        email: proveedor.email ?? '',
        direccion: proveedor.direccion ?? '',
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
      await proveedorStore.update(props.editId, form.value);
    } else {
      await proveedorStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el proveedor');
  }
}
</script>
