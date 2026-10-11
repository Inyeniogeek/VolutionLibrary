module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      diagnostics: false,
      tsconfig: {
        jsx: 'react-jsx',
        moduleResolution: 'bundler',
        target: 'ES2022',
        verbatimModuleSyntax: false,
        esModuleInterop: true,
        ignoreDeprecations: '6.0',
        types: ['node', 'jest', '@testing-library/jest-dom'],
      },
    }],
  },
};
