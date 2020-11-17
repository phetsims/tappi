// Copyright 2020, University of Colorado Boulder

/**
 * A dialog with a few basic UI components with self-voicing and gesture control to give
 * the user a chance to play with components before interacting with them in the simulation.
 * This is intended for use only in prototypes for user interviews. The hope is that providing
 * user with a chance to play with components before jumping into the sim will separate
 * learning of the controls versus learning of the content.
 *
 * @author Jesse Greenberg
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import SelfVoicingInputListener from '../../../scenery-phet/js/accessibility/speaker/SelfVoicingInputListener.js';
import SelfVoicingWrapperNode from '../../../scenery-phet/js/accessibility/speaker/SelfVoicingWrapperNode.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import sceneryPhet from '../../../scenery-phet/js/sceneryPhet.js';
import sceneryPhetStrings from '../../../scenery-phet/js/sceneryPhetStrings.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import RichText from '../../../scenery/js/nodes/RichText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import TextPushButton from '../../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../../sun/js/Dialog.js';
import HSlider from '../../../sun/js/HSlider.js';
import SelfVoicingUtterance from '../../../utterance-queue/js/SelfVoicingUtterance.js';

// constants
const contentFont = new PhetFont( 16 );
const titleFont = new PhetFont( 32 );

const titleString = 'Gestures';
const dialogDescriptionString = 'Welcome! This simulation uses web speech and some custom gestures, here are a couple ' +
                                'to test out to get things going. When ready, continue to simulation.';
const continueButtonContent = 'Continue to simulation';
const testButtonContent = 'Activate Me!';
const pressedString = 'Thanks for activating me! You rock!';
const sliderLabelString = 'Move Me';
const sliderInteractionHintString = 'move me';
const grabDragHintPatternString = sceneryPhetStrings.a11y.selfVoicing.grabDragHintPattern;
const grabbedAlertString = sceneryPhetStrings.a11y.selfVoicing.grabbedAlert;
const releasedString = sceneryPhetStrings.a11y.grabDrag.released;

class CustomGestureIntroDialog extends Dialog {
  constructor( options ) {
    if ( options ) {
      assert && assert( options.title === undefined, 'CustomGestureIntroDialog sets title' );
    }

    options = merge( {
      title: new Text( titleString, {
        font: titleFont,
        tagName: 'h1',
        innerContent: titleString
      } )
    }, options );

    const descriptionParagraph = new RichText( dialogDescriptionString, {
      lineWrap: 500,
      boundsMethod: 'accurate',

      tagName: 'p',
      innerContent: dialogDescriptionString
    } );

    const speakDescriptionParagraph = () => {
      const utterance = new SelfVoicingUtterance( {
        alert: dialogDescriptionString,
        cancelOther: false
      } );
      phet.joist.sim.selfVoicingUtteranceQueue.addToBack( utterance );
    };

    // a wrapper that surrounds the descriptionParagraph with a Node that is focusable
    // and has input listeners that make it possible to click the text to hear information
    // about it
    const selfVoicingWrapper = new SelfVoicingWrapperNode( descriptionParagraph, {
      listenerOptions: {
        onFocusIn: speakDescriptionParagraph,
        onPress: speakDescriptionParagraph
      }
    } );
    selfVoicingWrapper.addChild( descriptionParagraph );

    const exampleButton = new TextPushButton( testButtonContent, {
      font: contentFont,
      listener: () => {
        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( pressedString );
      }
    } );

    const exampleSliderProperty = new NumberProperty( 5 );
    const exampleSliderRange = new Range( 0, 10 );
    const exampleSlider = new HSlider( exampleSliderProperty, new Range( 0, 10 ) );

    const exampleComponents = new HBox( {
      children: [ exampleButton, exampleSlider ]
    } );

    // continues to the simulation, closing this dialog
    const continueButton = new TextPushButton( continueButtonContent, {
      font: contentFont,
      listener: () => {
        this.hide();
      }
    } );

    const content = new VBox( {
      children: [ selfVoicingWrapper, exampleComponents, continueButton ],
      spacing: 50
    } );

    super( content, options );

    // @private {Node}
    this.selfVoicingWrapper = selfVoicingWrapper;

    // listeners that provide actual self-voicing content on the example components
    exampleButton.addInputListener( new SelfVoicingInputListener( {
      onFocusIn: () => {
        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( testButtonContent );
      }
    } ) );

    exampleSlider.addInputListener( new SelfVoicingInputListener( {
      onFocusIn: () => {
        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( sliderLabelString );
      }
    } ) );

    continueButton.addInputListener(  new SelfVoicingInputListener( {
      onFocusIn: () => {
        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( continueButtonContent );
      }
    } ) );

    exampleSlider.addInputListener( {
      click: () => {
        const hintString = StringUtils.fillIn( grabDragHintPatternString, {
          manipulation: sliderInteractionHintString
        } );

        phet.joist.sim.selfVoicingUtteranceQueue.addToBack( hintString );
      }
    } );

    const valueChangeUtterance = new SelfVoicingUtterance();
    exampleSliderProperty.lazyLink( value => {
      valueChangeUtterance.alert = value + '';
      phet.joist.sim.selfVoicingUtteranceQueue.addToBack( valueChangeUtterance );
    } );

    let positionOnValueChange = null;
    exampleSlider.swipeStart = event => {
      phet.joist.sim.selfVoicingUtteranceQueue.addToBack( grabbedAlertString );
      positionOnValueChange = event.pointer.point;
    };
    exampleSlider.swipeEnd = () => {
      const releasedAlert = new SelfVoicingUtterance( {
        cancelOther: false,
        alert: releasedString
      } );
      phet.joist.sim.selfVoicingUtteranceQueue.addToBack( releasedAlert );
    };
    exampleSlider.swipeMove = event => {
      const nextSwipePosition = event.pointer.point;
      const swipeDelta = nextSwipePosition.minus( positionOnValueChange );
      const distance = nextSwipePosition.distance( positionOnValueChange );

      if ( distance > 30 ) {
        const swipeAngle = swipeDelta.angle;

        const swipeRight = Utils.equalsEpsilon( Math.abs( swipeAngle ), 0, Math.PI / 4 );
        const swipeLeft = Utils.equalsEpsilon( Math.abs( swipeAngle ), Math.PI, Math.PI / 4 );
        const swipeUp = Utils.equalsEpsilon( swipeAngle, -Math.PI / 2, Math.PI / 4 );
        const swipeDown = Utils.equalsEpsilon( swipeAngle, Math.PI / 2, Math.PI / 4 );

        let nextValue = exampleSliderProperty.value;
        if ( swipeRight || swipeUp ) {
          nextValue++;
        }
        else if ( swipeLeft || swipeDown ) {
          nextValue--;
        }

        if ( exampleSliderRange.contains( nextValue ) ) {
          exampleSliderProperty.set( nextValue );
        }

        positionOnValueChange = nextSwipePosition;
      }
    };
  }

  /**
   * Puts focus on the intro paragraph, useful to do when the dialog first opens.
   * @public
   */
  focusIntroDescription() {
    this.selfVoicingWrapper.focus();
  }
}

sceneryPhet.register( 'CustomGestureIntroDialog', CustomGestureIntroDialog );
export default CustomGestureIntroDialog;