<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar renglón' : 'Nuevo renglón' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-select
          v-model="form.idProducto"
          label="Producto"
          outlined
          class="q-mb-sm"
          :options="productoStore.productos"
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          lazy-rules
          :rules="[(v: number | null) => v !== null || 'Selecciona el producto']"
        />
        <q-input
          v-model.number="form.cantidad"
          label="Cantidad"
          type="number"
          outlined
          class="q-mb-sm"
          :min="1"
          lazy-rules
          :rules="[(v: number) => (!!v && v >= 1) || 'Ingresa una cantidad valida']"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="detalleSolicitudReposicionStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useDetalleSolicitudReposicionStore } from 'stores/detalleSolicitudReposicion';
import { useProductoStore } from 'stores/producto';
import type { DetalleSolicitudReposicionRequestDto } from 'src/models/DetalleSolicitudReposicion/DetalleSolicitudReposicionRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion. idSolicitudReposicion es fijo: no se muestra en el form
const props = defineProps<{ idSolicitudReposicion: number; editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const detalleSolicitudReposicionStore = useDetalleSolicitudReposicionStore();
const productoStore = useProductoStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<DetalleSolicitudReposicionRequestDto>({
  idSolicitudReposicion: props.idSolicitudReposicion,
  idProducto: 0,
  cantidad: 1,
});

onMounted(async () => {
  await productoStore.fetchAll();
  if (props.editId) {
    const detalle = await detalleSolicitudReposicionStore.fetchById(props.editId);
    if (detalle) {
      form.value = {
        idSolicitudReposicion: props.idSolicitudReposicion,
        idProducto: detalle.idProducto,
        cantidad: detalle.cantidad,
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
      await detalleSolicitudReposicionStore.update(props.editId, form.value);
    } else {
      await detalleSolicitudReposicionStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el renglón');
  }
}
</script>
