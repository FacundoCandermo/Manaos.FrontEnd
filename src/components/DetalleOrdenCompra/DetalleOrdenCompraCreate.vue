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
          :rules="[(v: number) => (v !== null && v >= 0) || 'Ingresa un precio valido']"
        />
        <!-- El subtotal se recalcula en vivo, no es editable -->
        <q-input :model-value="subtotalFormateado" label="Subtotal" outlined readonly class="q-mb-sm" />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="detalleOrdenCompraStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useDetalleOrdenCompraStore } from 'stores/detalleOrdenCompra';
import { useProductoStore } from 'stores/producto';
import type { DetalleOrdenCompraRequestDto } from 'src/models/DetalleOrdenCompra/DetalleOrdenCompraRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion. idOrdenCompra es fijo, no se muestra en el form
const props = defineProps<{ editId: number | null; idOrdenCompra: number }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const detalleOrdenCompraStore = useDetalleOrdenCompraStore();
const productoStore = useProductoStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<DetalleOrdenCompraRequestDto>({
  idOrdenCompra: props.idOrdenCompra,
  idProducto: 0,
  cantidad: 1,
  precioUnitario: 0,
  subtotal: 0,
});

const subtotal = computed(() => form.value.cantidad * form.value.precioUnitario);
const subtotalFormateado = computed(() => subtotal.value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }));

function autocompletarPrecio(idProducto: number) {
  form.value.precioUnitario = productoStore.productos.find((p) => p.id === idProducto)?.precio ?? 0;
}

// Si es modificacion, se traen los datos actuales del renglon
onMounted(async () => {
  await productoStore.fetchAll();
  if (props.editId) {
    const detalle = await detalleOrdenCompraStore.fetchById(props.editId);
    if (detalle) {
      form.value = {
        idOrdenCompra: detalle.idOrdenCompra,
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
  form.value.subtotal = subtotal.value;
  try {
    if (props.editId) {
      await detalleOrdenCompraStore.update(props.editId, form.value);
    } else {
      await detalleOrdenCompraStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el renglón');
  }
}
</script>
