# ManaosApp (manaos-frontend)

Gestión de stock y operaciones - Manaos

## Cómo ejecutar

### Instalar las dependencias
```bash
npm install
```

### Iniciar la app en modo desarrollo (hot-reload, reporte de errores, etc.)
```bash
quasar dev
```

La app espera la API de Manaos corriendo en `https://localhost:5001` (ver `src/boot/axios.ts`).

### Lint de los archivos
```bash
npm run lint
```

### Formatear los archivos
```bash
npm run format
```

### Compilar la app para producción
```bash
quasar build
```

### Personalizar la configuración
Ver [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
