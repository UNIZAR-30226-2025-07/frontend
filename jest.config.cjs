// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    // Eliminar la línea que hace referencia a astro-jest-transformer
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    // Opcionalmente, puedes ignorar los archivos .astro
    '\\.astro$': '<rootDir>/tests/__mocks__/astroMock.js'
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'], // Quitar 'astro'
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
};