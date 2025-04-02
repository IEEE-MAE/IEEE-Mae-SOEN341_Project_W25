// Global test setup for Jest

// Import necessary testing libraries
import '@testing-library/jest-dom';

// Mock window.alert
window.alert = jest.fn();

// Mock window.confirm
window.confirm = jest.fn().mockImplementation(() => true);

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock console methods to prevent noise during tests
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

// Optional: Comment these out if you want to see the logs during tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Restore original console methods after all tests
afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
});