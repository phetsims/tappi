// Copyright 2020, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import inheritance from '../../../phet-core/js/inheritance.js';
import extend from '../../../phet-core/js/extend.js';
import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Utils from '../../../dot/js/Utils.js';

const ValueGestureControl = {

  mixInto: type => {
    assert && assert( _.includes( inheritance( type ), Node ), 'must be mixed into a Node' );

    const proto = type.prototype;

    extend( proto, {
      initializeValueGestureControl( node, options ) {

        options = merge( {
          onIncrement: () => {},
          onDecrement: () => {}
        }, options );

        let positionOnChange = null;
        node.swipeStart = event => {
          positionOnChange = event.pointer.point;
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
        };
      }
    } );
  }
};

export default ValueGestureControl;
