<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar orden de compra' : 'Nueva orden de compra' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
        <!-- La fecha se guarda como texto ISO (yyyy-MM-dd), que es lo que espera la API -->
        <q-input
          v-model="form.fecha"
          label="Fecha"
          outlined
          class="q-mb-sm"
          mask="####-##-##"
          hint="aaaa-mm-dd"
          lazy-rules
          :rules="[(v: string) => (!!v && v.length === 10) || 'Ingresa la fecha']"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="form.fecha" mask="YYYY-MM-DD" minimal />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-select
          v-model="form.estado"
          label="Estado"
          outlined
          class="q-mb-sm"
          :options="EstadoOrdenCompraOptions"
          emit-value
          map-options
          option-value="value"
          option-label="label"
          lazy-rules
          :rules="[(v: number) => v !== null || 'Selecciona el estado']"
        />
        <q-select
          v-model="form.idProveedor"
          label="Proveedor"
          outlined
          class="q-mb-sm"
          :options="proveedorStore.proveedores"
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          lazy-rules
          :rules="[(v: number) => !!v || 'Selecciona el proveedor']"
        />
        <q-select
          v-model="form.idBodegaDestino"
          label="Bodega destino"
          outlined
          class="q-mb-sm"
          :options="bodegaStore.bodegas"
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          lazy-rules
          :rules="[(v: number) => !!v || 'Selecciona la bodega']"
        />
        <!-- El total se calcula y persiste solo desde la pagina de detalle -->
        <q-input
          :model-value="form.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })"
          label="Total"
          outlined
          readonly
          class="q-mb-sm"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="ordenCompraStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useOrdenCompraStore } from 'stores/ordenCompra';
import { useProveedorStore } from 'stores/proveedor';
import { useBodegaStore } from 'stores/bodega';
import type { OrdenCompraRequestDto } from 'src/models/OrdenCompra/OrdenCompraRequestDto';
import { EstadoOrdenCompraOptions } from 'src/models/Enums';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const ordenCompraStore = useOrdenCompraStore();
const proveedorStore = useProveedorStore();
const bodegaStore = useBodegaStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<OrdenCompraRequestDto>({
  fecha: '',
  estado: 0,
  total: 0,
  idProveedor: 0,
  idBodegaDestino: 0,
});

// Si es modificacion, se traen los datos actuales de la orden
onMounted(async () => {
  await proveedorStore.fetchAll();
  await bodegaStore.fetchAll();
  if (props.editId) {
    const orden = await ordenCompraStore.fetchById(props.editId);
    if (orden) {
      form.value = {
        fecha: orden.fecha,
        // la respuesta trae el texto del estado, hay que convertirlo al numero del enum
        estado: EstadoOrdenCompraOptions.find((o) => o.label === orden.estado)?.value ?? 0,
        total: orden.total,
        idProveedor: orden.idProveedor,
        idBodegaDestino: orden.idBodegaDestino,
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
      await ordenCompraStore.update(props.editId, form.value);
    } else {
      await ordenCompraStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar la orden de compra');
  }
}
</script>
