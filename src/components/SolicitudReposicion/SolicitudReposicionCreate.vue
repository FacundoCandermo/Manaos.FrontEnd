<template>
  <q-card style="min-width: 420px">
    <q-card-section>
      <div class="text-h6">{{ editId ? 'Editar solicitud de reposición' : 'Nueva solicitud de reposición' }}</div>
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
          :options="EstadoSolicitudReposicionOptions"
          emit-value
          map-options
          option-value="value"
          option-label="label"
          lazy-rules
          :rules="[(v: number | null) => v !== null || 'Selecciona el estado']"
        />
        <q-input
          v-model="form.observaciones"
          label="Observaciones"
          type="textarea"
          outlined
          class="q-mb-sm"
          :maxlength="500"
          counter
        />
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Cancelar" flat @click="$emit('close')" />
      <q-btn
        :label="editId ? 'Guardar' : 'Crear'"
        color="primary"
        :loading="solicitudReposicionStore.loading"
        @click="onSubmit"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { QForm } from 'quasar';
import { useSolicitudReposicionStore } from 'stores/solicitudReposicion';
import type { SolicitudReposicionRequestDto } from 'src/models/SolicitudReposicion/SolicitudReposicionRequestDto';
import { EstadoSolicitudReposicionOptions } from 'src/models/Enums';
import { notificarError } from 'src/utils/notificar';

// editId null = alta; con numero = modificacion
const props = defineProps<{ editId: number | null }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const solicitudReposicionStore = useSolicitudReposicionStore();
const formRef = ref<QForm | null>(null);

// El formulario completa el mismo DTO que viaja a la API
const form = ref<SolicitudReposicionRequestDto>({
  fecha: '',
  estado: 0,
  observaciones: '',
});

// Si es modificacion, se traen los datos actuales de la solicitud
onMounted(async () => {
  if (props.editId) {
    const solicitud = await solicitudReposicionStore.fetchById(props.editId);
    if (solicitud) {
      form.value = {
        fecha: solicitud.fecha,
        // El Response trae el texto del enum; se convierte al numero que espera la API
        estado: EstadoSolicitudReposicionOptions.find((o) => o.label === solicitud.estado)?.value ?? 0,
        observaciones: solicitud.observaciones ?? '',
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
      await solicitudReposicionStore.update(props.editId, form.value);
    } else {
      await solicitudReposicionStore.create(form.value);
    }
    emit('close');
  } catch {
    notificarError('No se pudo guardar la solicitud de reposición');
  }
}
</script>
