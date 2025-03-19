import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:4321', // Asegúrate de que coincida con el puerto de tu app Astro
    headless: true, // Ejecutar pruebas sin interfaz gráfica
    viewport: { width: 1280, height: 720 },
    trace: 'on', // Guarda trazas para depuración
  },
  webServer: {
    command: 'npm run dev', // Iniciar Astro antes de correr pruebas
    port: 4321, // Cambia si usas otro puerto
    timeout: 120000,
  }
});
