// Copyright 2019, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  const ScreenView = require( 'JOIST/ScreenView' );
  const PulseScene = require( 'TAPPI/demo/patterns/view/PulseScene' );
  const EffectsScene = require( 'TAPPI/demo/patterns/view/EffectsScene' );
  const TunesScene = require( 'TAPPI/demo/patterns/view/TunesScene' );
  const PatternsModel = require( 'TAPPI/demo/patterns/model/PatternsModel' );
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const tappi = require( 'TAPPI/tappi' );
  const vibrationManager = require( 'TAPPI/vibrationManager' );

  // constants
  const LIST_ITEM_FONT = new PhetFont( 30 );

  class PatternsScreenView extends ScreenView {

    /**
     * @param {TappiModel} model
     */
    constructor( model ) {
      super();

      // different scenes demonstrate different applications
      const sceneCenterBottom = this.layoutBounds.centerBottom.minusXY( 0, 15 );
      const pulseScene = new PulseScene( model.activePatternProperty, {
        centerBottom: sceneCenterBottom
      } );
      const effectsScene = new EffectsScene( model.activePatternProperty, {
        centerBottom: sceneCenterBottom
      } );
      const tunesScene = new TunesScene( model.activePatternProperty, {
        centerBottom: sceneCenterBottom
      } );


      const comboBoxItems = [
        new ComboBoxItem( new Text( 'Pulses', { font: LIST_ITEM_FONT } ), PatternsModel.PatternSet.PULSES ),
        new ComboBoxItem( new Text( 'Effects', { font: LIST_ITEM_FONT } ), PatternsModel.PatternSet.EFFECTS ),
        new ComboBoxItem( new Text( 'Tunes', { font: LIST_ITEM_FONT } ), PatternsModel.PatternSet.TUNES )
      ];
      const comboBox = new ComboBox( comboBoxItems, model.activePatternSetProperty, this, {
        listPosition: 'above',
        highlightFill: 'rgb( 200, 200, 200 )',
        leftBottom: this.layoutBounds.leftBottom.plusXY( 15, -15 )
      } );

      this.addChild( pulseScene );
      this.addChild( effectsScene );
      this.addChild( tunesScene );
      this.addChild( comboBox );

      // scene visibility changes with model Property
      model.activePatternSetProperty.link( ( activePattern ) => {
        pulseScene.visible = activePattern === PatternsModel.PatternSet.PULSES;
        effectsScene.visible = activePattern === PatternsModel.PatternSet.EFFECTS;
        tunesScene.visible = activePattern === PatternsModel.PatternSet.TUNES;
      } );

      // begin to vibrate when we set a new active pattern
      model.activePatternProperty.link( ( activePattern ) => {
        if ( activePattern === null ) {
          vibrationManager.stopVibrate();
        }
        else {
          vibrationManager.startVibrate( activePattern );
        }
      } );
    }

    // @public
    step( dt ) {
    }
  }

  return tappi.register( 'PatternsScreenView', PatternsScreenView );
} );