<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar cliente' : 'Nuevo cliente' }}</div>
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
        :loading="clienteStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useClienteStore } from 'stores/cliente';
import type { ClienteRequestDto } from 'src/models/Cliente/ClienteRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const clienteStore = useClienteStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<ClienteRequestDto>({
  nombre: '',
  cuit: '',
  telefono: '',
  email: '',
  direccion: '',
});

// Si es modificacion, se traen los datos actuales del cliente
onMounted(async () => {
  if (props.editId) {
    const cliente = await clienteStore.fetchById(props.editId);
    if (cliente) {
      form.value = {
        nombre: cliente.nombre,
        cuit: cliente.cuit ?? '',
        telefono: cliente.telefono ?? '',
        email: cliente.email ?? '',
        direccion: cliente.direccion ?? '',
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
      await clienteStore.update(props.editId, form.value);
    } else {
      await clienteStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el cliente');
  }
}
</script>
