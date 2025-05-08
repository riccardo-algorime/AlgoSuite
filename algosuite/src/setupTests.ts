// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add structuredClone polyfill for Node.js environments
if (typeof structuredClone !== 'function') {
  global.structuredClone = (obj: any) => {
    if (obj === undefined || obj === null) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  };
}

// Add TextEncoder and TextDecoder polyfills for Node.js environments
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
