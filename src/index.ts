/**
 * Main entry point for the library
 *
 * Export all the functions from the library
 */

export * from './calculator.js';

/**
 * Export `add` modules with module name `add`
 */
export * as calculator from './calculator.js';

export function getResourceName() {
  return 'calculator';
}

export * from './Terrakit.js';
export * from './TerrakitStack.js';
export * from './TerrakitController.js';
export * from './types.js';