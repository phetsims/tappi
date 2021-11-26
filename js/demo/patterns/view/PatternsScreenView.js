// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import Property from '../../../../../axon/js/Property.js';
import ScreenView from '../../../../../joist/js/ScreenView.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../../scenery/js/imports.js';
import BooleanRectangularStickyToggleButton from '../../../../../sun/js/buttons/BooleanRectangularStickyToggleButton.js';
import ComboBox from '../../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../../sun/js/ComboBoxItem.js';
import tappi from '../../../tappi.js';
import vibrationManager from '../../../vibrationManager.js';
import VibrationChart from '../../../view/VibrationChart.js';
import PatternsModel from '../model/PatternsModel.js';
import EffectsScene from './EffectsScene.js';
import PulseScene from './PulseScene.js';
import TunesScene from './TunesScene.js';

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

    const limitPatternsButton = new BooleanRectangularStickyToggleButton( model.limitPatternsProperty, {
      content: new Text( 'Limit Time', { font: LIST_ITEM_FONT } ),
      minWidth: comboBox.width,
      leftBottom: comboBox.leftTop.minusXY( 0, 5 )
    } );

    // @private {VibrationChart}
    this.vibrationChart = new VibrationChart( vibrationManager.vibratingProperty, this.layoutBounds.width * 0.85, this.layoutBounds.height / 3, {
      centerTop: this.layoutBounds.centerTop
    } );

    this.addChild( this.vibrationChart );
    this.addChild( pulseScene );
    this.addChild( effectsScene );
    this.addChild( tunesScene );
    this.addChild( limitPatternsButton );
    this.addChild( comboBox );

    // scene visibility changes with model Property
    model.activePatternSetProperty.link( activePattern => {
      pulseScene.visible = activePattern === PatternsModel.PatternSet.PULSES;
      effectsScene.visible = activePattern === PatternsModel.PatternSet.EFFECTS;
      tunesScene.visible = activePattern === PatternsModel.PatternSet.TUNES;
    } );

    Property.multilink( [ model.activePatternProperty, model.limitPatternsProperty ], ( activePattern, limit ) => {
      if ( activePattern === null ) {
        vibrationManager.stopVibrate();
      }
      else if ( limit ) {
        vibrationManager.startTimedVibrate( 2000, activePattern );
      }
      else {
        vibrationManager.startVibrate( activePattern );
      }
    } );
  }

  // @public
  step( dt ) {
    this.vibrationChart.step( dt );
  }
}

tappi.register( 'PatternsScreenView', PatternsScreenView );
export default PatternsScreenView;