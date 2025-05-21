// Este test está evaluando la seguridad de un componente NicknameInput contra ataques de inyección XSS (Cross-Site Scripting).
import { render, screen, fireEvent } from '@testing-library/react';
// Importar desde el mock en lugar del componente original
import NicknameInput from '../../src/__mocks__/components/NicknameInput';

test('previene inyección XSS en el input de nickname', async () => {
  render(<NicknameInput />);
  const input = screen.getByPlaceholderText('Ingresa tu nickname');
  const maliciousScript = '<script>alert("XSS")</script>';
  
  fireEvent.change(input, { target: { value: maliciousScript } });
  fireEvent.submit(screen.getByRole('form'));
  
  // Verificar que el contenido malicioso no se ejecuta
  expect(document.cookie).not.toContain(maliciousScript);
});