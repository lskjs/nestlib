module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      _statements: 100,
      statements: 50,
    },
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  setupFilesAfterEnv: [`${__dirname}/jest.setup.js`],
};
