// jest.config.js
module.exports = {
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '.',
      outputName: 'junit.xml',
      includeConsoleOutput: true
    }]
  ],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['lcov', 'text']
};
