import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';

/*
 * Quasar detecta este archivo y registra Pinia en la app.
 * Los stores concretos (ej: autor.ts) se definen con `defineStore` de pinia.
 */
export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();
  return pinia;
});
