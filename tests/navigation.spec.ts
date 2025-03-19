import { test, expect } from '@playwright/test';

test('Los botones de la barra de navegación llevan a la URL correcta', async ({ page }) => {
  await page.goto('/');

  const enlaces = [
    { selector: 'a[href="/store"]', url: '/store' },
    { selector: 'a[href="/achievements"]', url: '/achievements' },
    { selector: 'a[href="/friends"]', url: '/friends' },
    { selector: 'a[href="/configuration"]', url: '/configuration' },
  ];

  for (const enlace of enlaces) {
    await page.click(enlace.selector);
    await expect(page).toHaveURL(enlace.url);
    await page.goto('/'); // Volver a la página principal
  }
});
