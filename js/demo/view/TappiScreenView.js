// Copyright 2019, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  const BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const vibrationManager = require( 'TAPPI/vibrationManager' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const tappi = require( 'TAPPI/tappi' );

  // constants
  const TEXT_FONT = new PhetFont( { size: 120 } );

  class TappiScreenView extends ScreenView {

    /**
     * @param {TappiModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      this.elapsedTime = 0;

      // button that initiates a vibration
      const trueNode = new Text( 'Stop Vibrate', { font: TEXT_FONT } );
      const falseNode = new Text( 'Start Vibrate', { font: TEXT_FONT } );

      const adapterProperty = new BooleanProperty( vibrationManager.vibratingProperty.get() );

      const vibrationToggleButton = new BooleanRectangularToggleButton( trueNode, falseNode, adapterProperty );
      this.addChild( vibrationToggleButton );

      adapterProperty.lazyLink( ( vibrating ) => {
        if ( vibrating ) {
          vibrationManager.startVibrate();
        }
        else {
          vibrationManager.stopVibrate();
        }
      } );

      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
        },
        right: this.layoutBounds.maxX - 10,
        bottom: this.layoutBounds.maxY - 10,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );

      // layout
      vibrationToggleButton.center = this.layoutBounds.center;
    }

    // @public
    step( dt ) {
      this.elapsedTime += dt;
      // vibrationManager.setVibrationIntensity( Math.abs( Math.sin( this.elapsedTime ) ) );
    }
  }

  return tappi.register( 'TappiScreenView', TappiScreenView );
} );