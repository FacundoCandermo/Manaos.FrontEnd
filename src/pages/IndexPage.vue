<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md text-center" style="width: 420px; max-width: 90vw">
      <q-card-section>
        <q-icon name="warehouse" size="64px" color="primary" />
        <div class="text-h5 q-mt-sm">Manaos</div>
      </q-card-section>

      <!-- Con sesion: saludo y accesos rapidos. Sin sesion: invitacion a ingresar -->
      <q-card-section v-if="auth.isAuthenticated">
        <div class="text-subtitle1 q-mb-md">Hola, {{ auth.userName }}</div>
        <div class="text-caption text-grey q-mb-sm">Usá el menú para navegar por las secciones</div>
      </q-card-section>

      <q-card-section v-else>
        <div class="text-subtitle1">Inicia sesion para gestionar el stock</div>
        <q-btn label="Ingresar" icon="login" color="primary" class="q-mt-md" to="/login" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useAuthStore } from 'stores/auth';

const auth = useAuthStore();
</script>
