// Copyright 2020, University of Colorado Boulder

/**
 * A slider with support for custom gesture control with SwipeListener. This is a slider
 * that just mixes ValueGestureControl. Unclear if we will persue gesture controls
 * in the long run, but if we do, this could move directly to slider.
 *
 * @author Jesse Greenberg
 */

import merge from '../../../phet-core/js/merge.js';
import Slider from '../../../sun/js/Slider.js';
import tappi from '../tappi.js';
import ValueGestureControl from './ValueGestureControl.js';

class GestureControlledSlider extends Slider {
  constructor( valueProperty, range, options ) {
    options = merge( {

      // called on an increment gesture, increment by 1/10th of the range by default
      onIncrement: () => {
        valueProperty.set( range.constrainValue( valueProperty.get() + range.getLength() / 10 ) );
      },

      // called on a decrement gesture, decrement by 1/10th of the range by default
      onDecrement: () => {
        valueProperty.set( range.constrainValue( valueProperty.get() - range.getLength() / 10 ) );
      }
    }, options );

    super( valueProperty, range, options );

    this.initializeValueGestureControl( this, {
      onIncrement: options.onIncrement,
      onDecrement: options.onDecrement
    } );
  }
}

// mix gesture control into the slider
ValueGestureControl.mixInto( GestureControlledSlider );

tappi.register( 'GestureControlledSlider', GestureControlledSlider );
export default GestureControlledSlider;