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

  class EffectsScene extends PatternsDemoScene {
    constructor( activePatternProperty, options ) {
      super( activePatternProperty, options );

      // creates the buttons and adds them to the scene
      this.createPatternButtons( [
        { pattern: VibrationPatterns.QUICK_BALL_ROLL, label: 'Quick Ball Roll'},
        { pattern: VibrationPatterns.SLOW_BALL_ROLL, label: 'Slow Ball Roll'},
        { pattern: VibrationPatterns.FLUTTER, label: 'Flutter'},
        { pattern: VibrationPatterns.SLOW_DOWN, label: 'Slow Down'},
        { pattern: VibrationPatterns.HEARTBEAT, label: 'Heartbeat'},
        { pattern: VibrationPatterns.QUICK_HEARTBEAT, label: 'Quick Heartbeat' }
      ] );

      // mutate after buttons have been added for proper bounds
      this.mutate( options );
    }
  }

  return tappi.register( 'EffectsScene', EffectsScene );
} );
