// Copyright 2019, University of Colorado Boulder

/**
 * Screen for that demonstrates various vibration patterns supported by Tappi.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const tappi = require( 'TAPPI/tappi' );
  const PatternsModel = require( 'TAPPI/demo/patterns/model/PatternsModel' );
  const PatternsScreenView = require( 'TAPPI/demo/patterns/view/PatternsScreenView' );

  class PatternsScreen extends Screen {

    /**
     * @param {Tandem} tandem
     */
    constructor() {

      const options = {
        backgroundColorProperty: new Property( 'white' ),
        name: 'Patterns'
      };

      super(
        () => new PatternsModel(),
        ( model ) => new PatternsScreenView( model ),
        options
      );
    }
  }

  return tappi.register( 'PatternsScreen', PatternsScreen );
} );