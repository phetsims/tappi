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
  const TappiModel = require( 'TAPPI/demo/common/model/TappiModel' );
  const BasicsScreenView = require( 'TAPPI/demo/basics/view/BasicsScreenView' );

  class BasicsScreen extends Screen {

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
        ( model ) => new BasicsScreenView( model, tandem.createTandem( 'view' ) ),
        options
      );
    }
  }

  return tappi.register( 'BasicsScreen', BasicsScreen );
} );