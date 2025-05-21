/*
* Este test evalúa la accesibilidad de un componente ReadyButton utilizando la biblioteca Axe, que es una herramienta estándar de la industria para comprobar problemas de accesibilidad web.
* Es una prueba importante porque garantiza que el componente ReadyButton pueda ser utilizado por personas con discapacidades visuales, motoras o cognitivas, cumpliendo con los estándares WCAG (Web Content Accessibility Guidelines).
*/
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ReadyButton from '../../src/components/ReadyButton.jsx';

expect.extend(toHaveNoViolations);

test('ReadyButton no debe tener violaciones de accesibilidad', async () => {
  const { container } = render(<ReadyButton />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});