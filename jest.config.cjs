module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  verbose: true,
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
