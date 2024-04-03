module.exports = {
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },
  moduleDirectories: ['node_modules'],
  modulePathIgnorePatterns: ['npm-cache', '.npm'],
  testEnvironment: 'node',
};
