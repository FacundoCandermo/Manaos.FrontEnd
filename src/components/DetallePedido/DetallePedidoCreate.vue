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
          :rules="[(v: number) => !!v || 'Selecciona el producto']"
          @update:model-value="autocompletarPrecio"
        />
        <q-input
          v-model.number="form.cantidad"
          label="Cantidad"
          type="number"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: number) => (v !== null && v > 0) || 'Ingresa una cantidad valida']"
        />
        <q-input
          v-model.number="form.precioUnitario"
          label="Precio unitario"
          type="number"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: number) => v !== null && v >= 0 || 'Ingresa un precio valido']"
        />
        <q-input
          :model-value="subtotal.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })"
          label="Subtotal"
          outlined
          class="q-mb-sm"
          readonly
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="detallePedidoStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useDetallePedidoStore } from 'stores/detallePedido';
import { useProductoStore } from 'stores/producto';
import type { DetallePedidoRequestDto } from 'src/models/DetallePedido/DetallePedidoRequestDto';
import { notificarError } from 'src/utils/notificar';

// idPedido es fijo (viene de la pagina de detalle); editId null = alta, con numero = modificacion
const props = defineProps<{ idPedido: number; editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const detallePedidoStore = useDetallePedidoStore();
const productoStore = useProductoStore();
const formRef = ref<QForm | null>(null);

const form = ref<DetallePedidoRequestDto>({
  idPedido: props.idPedido,
  idProducto: 0,
  cantidad: 1,
  precioUnitario: 0,
  subtotal: 0,
});

// El subtotal nunca se edita a mano, se recalcula en vivo a partir de cantidad y precio
const subtotal = computed(() => form.value.cantidad * form.value.precioUnitario);

function autocompletarPrecio() {
  form.value.precioUnitario = productoStore.productos.find((p) => p.id === form.value.idProducto)?.precio ?? 0;
}

onMounted(async () => {
  await productoStore.fetchAll();
  // Si es modificacion, se traen los datos actuales del renglon
  if (props.editId) {
    const detalle = await detallePedidoStore.fetchById(props.editId);
    if (detalle) {
      form.value = {
        idPedido: detalle.idPedido,
        idProducto: detalle.idProducto,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal,
      };
    }
  }
});

async function onSubmit() {
  const valido = await formRef.value?.validate();
  if (!valido) {
    return;
  }
  const datos: DetallePedidoRequestDto = { ...form.value, subtotal: subtotal.value };
  try {
    if (props.editId) {
      await detallePedidoStore.update(props.editId, datos);
    } else {
      await detallePedidoStore.create(datos);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el renglón');
  }
}
</script>
