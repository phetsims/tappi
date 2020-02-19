// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const ABSwitch = require( 'SUN/ABSwitch' );
  const BooleanRectangularToggleButton = require( 'SUN/buttons/BooleanRectangularToggleButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const vibrationManager = require( 'TAPPI/vibrationManager' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const tappi = require( 'TAPPI/tappi' );

  // constants
  const LABEL_FONT = new PhetFont( { size: 100 } );
  const SWITCH_TEXT_FONT = new PhetFont( { size: 80 } );

  class BasicsScreenView extends ScreenView {

    /**
     * @param {BasicsModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      super();

      // button that initiates vibration - adapterProperty required because the button shouldn't set the
      // vibration property directly
      const adapterProperty = new BooleanProperty( vibrationManager.vibratingProperty.get() );
      const trueNode = new Text( 'Stop Vibrate', { font: LABEL_FONT } );
      const falseNode = new Text( 'Start Vibrate', { font: LABEL_FONT } );
      const vibrationToggleButton = new BooleanRectangularToggleButton( trueNode, falseNode, adapterProperty );

      // switch that changes between high and low vibration
      const intensityAdapterProperty = new EnumerationProperty( vibrationManager.Intensity, vibrationManager.Intensity.HIGH );
      const intensitySwitch = new ABSwitch(
        intensityAdapterProperty,
        vibrationManager.Intensity.HIGH, new Text( 'High', { font: SWITCH_TEXT_FONT } ),
        vibrationManager.Intensity.LOW, new Text( 'Low', { font: SWITCH_TEXT_FONT } ),
        {
          toggleSwitchOptions: { size: new Dimension2( 180, 90 ) },
          xSpacing: 20
        }
      );
      const intensityLabel = new Text( 'Intensity', { font: LABEL_FONT } );

      adapterProperty.lazyLink( vibrating => {
        if ( vibrating ) {
          vibrationManager.startVibrate();
        }
        else {
          vibrationManager.stopVibrate();
        }
      } );

      // NOTE: It would be cool if this wasn't necessary, but it feels weird that all of the API goes through the
      // Property
      intensityAdapterProperty.lazyLink( intensity => {
        vibrationManager.setVibrationIntensity( intensity );
      } );

      // layout
      const switchContainer = new Node( { children: [ intensitySwitch, intensityLabel ] } );
      intensityLabel.centerTop = intensitySwitch.centerBottom;
      switchContainer.centerBottom = this.layoutBounds.centerBottom;

      vibrationToggleButton.centerTop = this.layoutBounds.centerTop;

      // add to view
      this.addChild( vibrationToggleButton );
      this.addChild( switchContainer );
    }

    // @public
    step( dt ) {
    }
  }

  return tappi.register( 'BasicsScreenView', BasicsScreenView );
} );