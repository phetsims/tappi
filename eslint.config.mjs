// Copyright 2024, University of Colorado Boulder

/**
 * ESlint configuration for tappi.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import simEslintConfig from '../chipper/eslint/sim.eslint.config.mjs';

export default [
  ...simEslintConfig,
  {
    rules: {
      'phet/todo-should-have-issue': 'off'
    }
  }
];