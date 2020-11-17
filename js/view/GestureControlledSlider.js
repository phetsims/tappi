// Copyright 2020, University of Colorado Boulder

/**
 * A slider with support for custom gesture control with SwipeListener. This is a slider
 * that just mixes ValueGestureControl. Unclear if we will persue gesture controls
 * in the long run, but if we do, this could move directly to slider.
 *
 * @author Jesse Greenberg
 */

import merge from '../../../phet-core/js/merge.js';
import levelSpeakerModel from '../../../scenery-phet/js/accessibility/speaker/levelSpeakerModel.js';
import SelfVoicingInputListener from '../../../scenery-phet/js/accessibility/speaker/SelfVoicingInputListener.js';
import sceneryPhetStrings from '../../../scenery-phet/js/sceneryPhetStrings.js';
import Slider from '../../../sun/js/Slider.js';
import SelfVoicingUtterance from '../../../utterance-queue/js/SelfVoicingUtterance.js';
import tappi from '../tappi.js';
import ValueGestureControl from './ValueGestureControl.js';

const grabbedAlertString = sceneryPhetStrings.a11y.selfVoicing.grabbedAlert;
const releasedString = sceneryPhetStrings.a11y.grabDrag.released;

class GestureControlledSlider extends Slider {

  /**
   * @param {Property.<number>} valueProperty
   * @param {Range} range
   * @param {Object} [options]
   */
  constructor( valueProperty, range, options ) {
    options = merge( {

      // the label to be read by webSpeaker when this component receives focus
      selfVoicingLabel: null,

      // called on an increment gesture, increment by 1/10th of the range by default
      onIncrement: () => {
        valueProperty.set( range.constrainValue( valueProperty.get() + range.getLength() / 10 ) );
      },

      // called on a decrement gesture, decrement by 1/10th of the range by default
      onDecrement: () => {
        valueProperty.set( range.constrainValue( valueProperty.get() - range.getLength() / 10 ) );
      },

      // called on the beginning of a swipe gesture, by SwipeListeners
      onSwipeStart: () => {
        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( grabbedAlertString );
      },

      // called at the end of a swipe gesture, by SwipeListener
      onSwipeEnd: () => {

        // the released utterance shouldn't cancel other utterances describing the changing
        // value of the slider
        const releasedUtterance = new SelfVoicingUtterance( {
          alert: releasedString,
          cancelOther: false
        } );
        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( releasedUtterance );
      }
    }, options );

    super( valueProperty, range, options );
    this.initializeValueGestureControl( this, options );

    // on focus, speak the label of this component
    this.addInputListener( new SelfVoicingInputListener( {
      onFocusIn: () => {
        const objectContent = options.selfVoicingLabel;

        const response = levelSpeakerModel.collectResponses( objectContent );
        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( response );
      }
    } ) );
  }
}

// mix gesture control into the slider
ValueGestureControl.mixInto( GestureControlledSlider );

tappi.register( 'GestureControlledSlider', GestureControlledSlider );
export default GestureControlledSlider;