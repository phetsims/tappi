// Copyright 2020, University of Colorado Boulder

/**
 * A Trait for a node to be used in combination with SwipeListener. Adds listeners
 * that will fire when swipe gestures are made to the screen while the provided Node
 * has DOM focus.
 *
 * @author Jesse Greenberg
 */

import Utils from '../../../dot/js/Utils.js';
import extend from '../../../phet-core/js/extend.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import levelSpeakerModel from '../../../scenery-phet/js/accessibility/speaker/levelSpeakerModel.js';
import sceneryPhetStrings from '../../../scenery-phet/js/sceneryPhetStrings.js';
import Node from '../../../scenery/js/nodes/Node.js';
import voicingUtteranceQueue from '../../../scenery/js/accessibility/speaker/voicingUtteranceQueue.js';

// constants
const grabDragHintPatternString = sceneryPhetStrings.a11y.voicing.grabDragHintPattern;
const changeValueString = 'Change Value';

const ValueGestureControl = {

  /**
   * @trait {Node}
   * @param {function} type - the type (constructor) that is modified.
   */
  mixInto: type => {
    assert && assert( _.includes( inheritance( type ), Node ), 'must be mixed into a Node' );

    const proto = type.prototype;

    extend( proto, {

      /**
       * This should be called in the constructor to initialize the ValueGestureControl. The
       * listeners on swipe gestures will fire when gestures are made while the provided
       * Node has DOM focus.
       *
       * @param {Node} node - the Node to modify, should be focusable
       * @param options
       */
      initializeValueGestureControl( node, options ) {

        options = merge( {

          // {function} - called by SwipeListener when a swipe gesture begins
          onSwipeStart: event => {},

          // {function} - called by a SwipeListener every move of a swipe gesture
          onSwipeMove: event => {},

          // {function} - called by SwipeListener when a swipe gesture ends
          onSwipeEnd: event => {},

          // {function} custom function on an 'increment' gesture (swiping up or right)
          onIncrement: () => {},

          // {function} custom function on a 'decrement' gesture (swiping down or left)
          onDecrement: () => {}
        }, options );

        // the functions that SwipeListener assumes will be on the Node
        let positionOnChange = null;
        node.swipeStart = event => {
          positionOnChange = event.pointer.point;
          options.onSwipeStart( event );
        };
        node.swipeMove = event => {
          const nextSwipePosition = event.pointer.point;
          const swipeDelta = nextSwipePosition.minus( positionOnChange );
          const distance = nextSwipePosition.distance( positionOnChange );

          // if distance is alrge enough, in the global coordinate frame
          if ( distance > 30 ) {
            const swipeAngle = swipeDelta.angle;

            const swipeRight = Utils.equalsEpsilon( Math.abs( swipeAngle ), 0, Math.PI / 4 );
            const swipeLeft = Utils.equalsEpsilon( Math.abs( swipeAngle ), Math.PI, Math.PI / 4 );
            const swipeUp = Utils.equalsEpsilon( swipeAngle, -Math.PI / 2, Math.PI / 4 );
            const swipeDown = Utils.equalsEpsilon( swipeAngle, Math.PI / 2, Math.PI / 4 );

            if ( swipeRight || swipeUp ) {
              options.onIncrement();
            }
            else if ( swipeLeft || swipeDown ) {
              options.onDecrement();
            }

            positionOnChange = nextSwipePosition;
          }

          options.onSwipeMove( event );
        };
        node.swipeEnd = event => {
          options.onSwipeEnd( event );
        };

        // on the click event from custom gesture, speak an interaction hint that describes
        // to the user how to interact with this component
        node.addInputListener( {
          click: event => {
            const interactionHint = StringUtils.fillIn( grabDragHintPatternString, {
              manipulation: changeValueString
            } );
            const response = levelSpeakerModel.collectResponses( interactionHint );
            voicingUtteranceQueue.addToBack( response );
          }
        } );
      }
    } );
  }
};

export default ValueGestureControl;
