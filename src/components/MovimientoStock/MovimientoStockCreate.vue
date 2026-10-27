<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar movimiento' : 'Nuevo movimiento' }}</div>
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
        <q-select
          v-model="form.tipo"
          label="Tipo"
          outlined
          class="q-mb-sm"
          emit-value
          map-options
          option-value="value"
          option-label="label"
          :options="TipoMovimientoStockOptions"
          lazy-rules
          :rules="[(v: number) => v !== null || 'Selecciona un tipo']"
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
          v-model="form.fecha"
          label="Fecha"
          mask="####-##-##"
          hint="aaaa-mm-dd"
          outlined
          class="q-mb-sm"
          lazy-rules
          :rules="[(v: string) => !!v || 'Ingresa la fecha']"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.fecha" mask="YYYY-MM-DD">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          v-model="form.observaciones"
          label="Observaciones"
          type="textarea"
          outlined
          class="q-mb-sm"
          :maxlength="300"
          counter
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="movimientoStockStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { date } from 'quasar';
import type { QForm } from 'quasar';
import { useMovimientoStockStore } from 'stores/movimientoStock';
import { useProductoStore } from 'stores/producto';
import { useBodegaStore } from 'stores/bodega';
import type { MovimientoStockRequestDto } from 'src/models/MovimientoStock/MovimientoStockRequestDto';
import { TipoMovimientoStockOptions } from 'src/models/Enums';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const movimientoStockStore = useMovimientoStockStore();
const productoStore = useProductoStore();
const bodegaStore = useBodegaStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<MovimientoStockRequestDto>({
  idProducto: 0,
  idBodega: 0,
  tipo: 0,
  cantidad: 0,
  fecha: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  observaciones: '',
});

// Si es modificacion, se traen los datos actuales del movimiento
onMounted(async () => {
  await Promise.all([productoStore.fetchAll(), bodegaStore.fetchAll()]);
  if (props.editId) {
    const movimiento = await movimientoStockStore.fetchById(props.editId);
    if (movimiento) {
      form.value = {
        idProducto: movimiento.idProducto,
        idBodega: movimiento.idBodega,
        // el Response devuelve el texto del enum; el Request espera el numero
        tipo: TipoMovimientoStockOptions.find((o) => o.label === movimiento.tipo)?.value ?? 0,
        cantidad: movimiento.cantidad,
        fecha: movimiento.fecha,
        observaciones: movimiento.observaciones ?? '',
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
      await movimientoStockStore.update(props.editId, form.value);
    } else {
      await movimientoStockStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el movimiento');
  }
}
</script>
