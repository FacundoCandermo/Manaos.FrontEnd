<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar stock' : 'Nuevo stock' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <q-select
          v-model="form.idProducto"
          label="Producto"
          outlined
          class="q-mb-sm"
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          :options="productoStore.productos"
          lazy-rules
          :rules="[(v: number) => !!v || 'Selecciona un producto']"
        />
        <q-select
          v-model="form.idBodega"
          label="Bodega"
          outlined
          class="q-mb-sm"
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          :options="bodegaStore.bodegas"
          lazy-rules
          :rules="[(v: number) => !!v || 'Selecciona una bodega']"
        />
        <q-input
          v-model.number="form.cantidad"
          label="Cantidad"
          type="number"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: number) => (v !== null && v >= 0) || 'Ingresa una cantidad valida']"
        />
        <q-input
          v-model.number="form.stockMinimo"
          label="Stock mínimo"
          type="number"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: number) => (v !== null && v >= 0) || 'Ingresa un stock minimo valido']"
        />
        <q-input
          v-model.number="form.stockMaximo"
          label="Stock máximo"
          type="number"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: number) => (v !== null && v >= 0) || 'Ingresa un stock maximo valido']"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="stockBodegaStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useStockBodegaStore } from 'stores/stockBodega';
import { useProductoStore } from 'stores/producto';
import { useBodegaStore } from 'stores/bodega';
import type { StockBodegaRequestDto } from 'src/models/StockBodega/StockBodegaRequestDto';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const stockBodegaStore = useStockBodegaStore();
const productoStore = useProductoStore();
const bodegaStore = useBodegaStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<StockBodegaRequestDto>({
  idProducto: 0,
  idBodega: 0,
  cantidad: 0,
  stockMinimo: 0,
  stockMaximo: 0,
});

// Si es modificacion, se traen los datos actuales del stock
onMounted(async () => {
  await Promise.all([productoStore.fetchAll(), bodegaStore.fetchAll()]);
  if (props.editId) {
    const stock = await stockBodegaStore.fetchById(props.editId);
    if (stock) {
      form.value = {
        idProducto: stock.idProducto,
        idBodega: stock.idBodega,
        cantidad: stock.cantidad,
        stockMinimo: stock.stockMinimo,
        stockMaximo: stock.stockMaximo,
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
      await stockBodegaStore.update(props.editId, form.value);
    } else {
      await stockBodegaStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el stock');
  }
}
</script>
