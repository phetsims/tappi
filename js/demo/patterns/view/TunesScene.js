// Copyright 2019, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const tappi = require( 'TAPPI/tappi' );
  const PatternsDemoScene = require( 'TAPPI/demo/patterns/view/PatternsDemoScene' );

  class TunesScene extends PatternsDemoScene {
    constructor( activePatternProperty, options ) {
      super( activePatternProperty, options );

      // creates the buttons and adds them to the scene
      this.createPatternButtons( [
        {
          pattern: [ 125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600, 200, 600 ],
          label: 'Mario'
        },
        {
          pattern: [ 200, 100, 200, 275, 425, 100, 200, 100, 200, 275, 425, 100, 75, 25, 75, 125, 75, 25, 75, 125, 100, 100] ,
          label: 'James Bond'
        },
        {
          pattern: [ 500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500 ],
          label: 'Star Wars'
        },
        {
          pattern: [ 200, 100, 200, 100, 400, 200, 200, 100, 200, 100, 400, 200, 400, 200, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100, 200, 100 ],
          label: 'Song of Storms'
        }
      ] );

      // mutate after buttons have been added for proper bounds
      this.mutate( options );
    }
  }

  return tappi.register( 'TunesScene', TunesScene );
} );
