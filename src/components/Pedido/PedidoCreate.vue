<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar pedido' : 'Nuevo pedido' }}</div>
    </q-card-section>
    <q-separator />

    <q-card-section>
      <q-form ref="formRef" greedy @submit.prevent="onSubmit">
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
                <q-date v-model="form.fecha" mask="YYYY-MM-DD">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-select
          v-model="form.estado"
          label="Estado"
          outlined
          class="q-mb-sm"
          :options="EstadoPedidoOptions"
          emit-value
          map-options
          option-value="value"
          option-label="label"
          lazy-rules
          :rules="[(v: number) => v !== null || 'Selecciona el estado']"
        />
        <q-select
          v-model="form.idCliente"
          label="Cliente"
          outlined
          class="q-mb-sm"
          :options="clienteStore.clientes"
          emit-value
          map-options
          option-value="id"
          option-label="nombre"
          lazy-rules
          :rules="[(v: number) => !!v || 'Selecciona el cliente']"
        />
        <q-select
          v-model="form.idBodegaOrigen"
          label="Bodega origen"
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
        <q-input
          :model-value="form.total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })"
          label="Total"
          outlined
          class="q-mb-sm"
          readonly
          hint="El total se calcula desde el detalle del pedido"
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="pedidoStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { usePedidoStore } from 'stores/pedido';
import { useClienteStore } from 'stores/cliente';
import { useBodegaStore } from 'stores/bodega';
import type { PedidoRequestDto } from 'src/models/Pedido/PedidoRequestDto';
import { EstadoPedidoOptions } from 'src/models/Enums';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const pedidoStore = usePedidoStore();
const clienteStore = useClienteStore();
const bodegaStore = useBodegaStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API. El total se arranca en 0 y se recalcula desde el detalle
const form = ref<PedidoRequestDto>({
  fecha: '',
  estado: EstadoPedidoOptions[0]?.value ?? 0,
  total: 0,
  idCliente: 0,
  idBodegaOrigen: 0,
});

onMounted(async () => {
  await Promise.all([clienteStore.fetchAll(), bodegaStore.fetchAll()]);
  // Si es modificacion, se traen los datos actuales del pedido
  if (props.editId) {
    const pedido = await pedidoStore.fetchById(props.editId);
    if (pedido) {
      form.value = {
        fecha: pedido.fecha,
        // El Response trae el texto del enum, hay que convertirlo al numero que espera el Request
        estado: EstadoPedidoOptions.find((o) => o.label === pedido.estado)?.value ?? 0,
        total: pedido.total,
        idCliente: pedido.idCliente,
        idBodegaOrigen: pedido.idBodegaOrigen,
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
      await pedidoStore.update(props.editId, form.value);
    } else {
      await pedidoStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar el pedido');
  }
}
</script>
