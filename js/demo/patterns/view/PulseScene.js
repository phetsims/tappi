// Copyright 2019, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const tappi = require( 'TAPPI/tappi' );
  const VibrationPatterns = require( 'TAPPI/VibrationPatterns' );
  const PatternsDemoScene = require( 'TAPPI/demo/patterns/view/PatternsDemoScene' );

  class PulseScene extends PatternsDemoScene {
    constructor( activePatternProperty, options ) {
      super( activePatternProperty );

      // creates the buttons and adds them to the scene
      this.createPatternButtons( [
        { pattern: VibrationPatterns.HZ_2_5, label: '2.5 Hz'},
        { pattern: VibrationPatterns.HZ_5, label: '5 Hz'},
        { pattern: VibrationPatterns.HZ_10, label: '10 Hz'},
        { pattern: VibrationPatterns.HZ_25, label: '25 Hz'},
        { pattern: VibrationPatterns.HZ_50, label: '50 Hz'},
        { pattern: VibrationPatterns.HZ_100, label: '100 Hz' }
      ] );

      // mutate after buttons have been added for proper bounds
      this.mutate( options );
    }
  }

  return tappi.register( 'PulseScene', PulseScene );
} );
