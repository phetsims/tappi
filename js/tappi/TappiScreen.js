// Copyright 2019, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const tappi = require( 'TAPPI/tappi' );
  const TappiModel = require( 'TAPPI/tappi/model/TappiModel' );
  const TappiScreenView = require( 'TAPPI/tappi/view/TappiScreenView' );

  class TappiScreen extends Screen {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      const options = {
        backgroundColorProperty: new Property( 'white' ),
        tandem: tandem
      };

      super(
        () => new TappiModel( tandem.createTandem( 'model' ) ),
        ( model ) => new TappiScreenView( model, tandem.createTandem( 'view' ) ),
        options
      );
    }
  }

  return tappi.register( 'TappiScreen', TappiScreen );
} );