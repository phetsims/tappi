// Copyright 2019-2020, University of Colorado Boulder

/**
 * A listener that can be added to a Node or the Display to detect if a pointer is over a collection
 * of shapes. You can add a shape with addShape, which takes a Shape and a Property. While the pointer is down over the
 * shape, the associated Property will be set to true so that you can observe this behavior.
 *
 * NOTE: This is intended to be added to the display. At one point it extended DragListener. This worked well when
 * added to a Node of the Display, but caused errors when added to the Display directly. If we use this more,
 * figure out why. In the meantime, creating a custom listener. It doesn't support many things that would come for
 * free with DragListener (like interruption).
 *
 * TODO: https://github.com/phetsims/tappi/issues/5 Rename, this now supports more than shapes
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Shape from '../../../kite/js/Shape.js';
import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import tappi from '../tappi.js';
import KeyboardUtils from '../../../scenery/js/accessibility/KeyboardUtils.js';

// modules
// const DragListener = require( '/scenery/js/listeners/DragListener' );

class ShapeHitDetector {

  constructor( parent, options ) {

    options = merge( {

      // {boolean} - if true, the 'hits' will be detected on shapes on over, rather than requiring the pointer to be down
      hitOnOver: false
    }, options );

    // @private {Hittable[]} - collection of shape/Property to be detected
    this.hittables = [];

    // @private {Node} - the parent node of this listener for reference frame transforms
    this.parent = parent;

    // @private {boolean} - is a pointer down and using this listener?
    this.isPressed = false;

    this.pointer = null;

    // @private {boolean} - see options
    this.hitOnOver = options.hitOnOver;

    // @private - list of hittables that currently have a pointer over them. Ordered such that the first item
    // of the list is the most recent to receive a hit
    this.activeHittables = [];

    // @private - the "active" hittable under keyboard focus, only one hittable can have focus at a time
    this.activeFocusHittable = null;

    // @private - maps the Hittable to its hit listener, so that when the hittable is removed its listener
    // can be as well
    this.hittableListenerMap = new Map();

    // @public - the most recent shape that received a hit from a pointer. The first element of the activeHittables
    // array
    // TODO: https://github.com/phetsims/tappi/issues/5 Rename, this now supports more than Shapes
    this.hitShapeEmitter = new Emitter( {
      parameters: [ { valueType: [ Shape, Node, null ] } ]
    } );

    // @public - Emits an event when the Pointer goes down on a hittable target.
    this.downOnHittableEmitter = new Emitter( {
      parameters: [ { valueType: [ Shape, Node ] } ]
    } );

    // @public - Emits an event when a Node is 'hit' from receiving keyboard focus, rather than from a mouse or
    // touch Pointer
    this.focusHitEmitter = new Emitter( {
      parameters: [ { valueType: [ Node ] } ]
    } );

    // @private {Object} - attached to the pointer on `down` if the pointer isn't already attached and interacting
    // with other things
    this._pointerListener = {
      move: event => {
        if ( this.isPressed ) {
          const parentPoint = this.parent.globalToLocalPoint( event.pointer.point );
          this.updateHittables( parentPoint );
        }
      },
      up: event => {
        this.handleRelease();
      },
      cancel: evennt => {
        this.handleRelease();
      }
    };
  }

  /**
   * Part of the scenery listener API.
   * @public (scenery)
   * @param {SceneryEvent} event
   */
  move( event ) {
    if ( this.hitOnOver ) {
      const parentPoint = this.parent.globalToLocalPoint( event.pointer.point );
      for ( let i = 0; i < this.hittables.length; i++ ) {
        const hittable = this.hittables[ i ];
        hittable.detectHit( parentPoint );
      }
    }
  }

  /**
   * Check for any "hits" from a focus event. Part of the scenery listener API.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  focusin( event ) {
    // on focus, all active hittables are cleared since only one focusable item can exist at a time

    for ( let i = 0; i < this.hittables.length; i++ ) {
      if ( this.hittables[ i ].detectHitFromFocus( event ) ) {

        // 'active' hittable detected, only one element can be focused at a time so exit early
        this.activeFocusHittable = this.hittables[ i ];
        return;
      }
    }
  }

  /**
   * Check for activation on a hittable from a click event from a keyboard or assistive technology.
   * The message that is broadcast is the same as the "down" event.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  keydown( event ) {
    if ( event.domEvent.keyCode === KeyboardUtils.KEY_SPACE || event.domEvent.keyCode === KeyboardUtils.KEY_ENTER ) {
      if ( this.activeFocusHittable ) {
        this.downOnHittableEmitter.emit( this.activeFocusHittable.target );
      }
    }
  }

  /**
   * Focus is leaving or moving to something else, clear any detected hits.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  focusout( event ) {
    this.activeFocusHittable = null;
  }

  /**
   * Part of the scenery listener API, update on exits.
   * @public (scenery-internal)
   *
   * @param {SceneryEvent} event
   */
  exit( event ) {
    if ( this.hitOnOver ) {
      const parentPoint = this.parent.globalToLocalPoint( event.pointer.point );
      this.updateHittables( parentPoint );
    }
  }

  /**
   * Go through Hittables and update whether or not they are hit under the provided point.
   * @param {Vector2} point - in the parent coordinate frame (local coordiante frame of this.parent).
   * @private
   */
  updateHittables( point ) {
    for ( let i = 0; i < this.hittables.length; i++ ) {
      const hittable = this.hittables[ i ];
      hittable.detectHit( point );
    }
  }

  /**
   * For the scenery listener API, detects any hits and attaches listener to the pointer for movement and eventually
   * listener removal.
   * @public
   * @param {SceneryEvent} event
   */
  down( event ) {

    // only begin dragging if pointer isn't already interacting with something, and don't attach pointer listeners if we
    // are just detecting hits on hover
    if ( this.pointer === null && !event.pointer.isAttached() && !this.hitOnOver ) {

      this.isPressed = true;
      this.pointer = event.pointer;

      const parentPoint = this.parent.globalToLocalPoint( event.pointer.point );
      for ( let i = 0; i < this.hittables.length; i++ ) {
        this.hittables[ i ].detectHit( parentPoint );
      }

      event.pointer.addInputListener( this._pointerListener, true );
    }

    // emit to active hittables that a down was received while pointer was over it
    this.activeHittables.forEach( hittable => {
      this.downOnHittableEmitter.emit( hittable.target );
    } );
  }

  /**
   * Handle 'release' of the pointer, such as on 'up' and 'cancel' events. Hittables are reset and Pointer listeners
   * are removed.
   * @private
   * @param event
   */
  handleRelease( event ) {
    // no paths hit on release
    for ( let i = 0; i < this.hittables.length; i++ ) {
      this.hittables[ i ].property.set( false );
    }

    this.pointer.removeInputListener( this._pointerListener );
    this.pointer = null;

    this.isPressed = false;
  }

  /**
   * Add a shape to the detectr, Property set true when pointer is down over shape.
   * @public
   *
   * @param {Shape} shape
   * @param {Property} property
   */
  addShape( shape, property, options ) {
    const hittable = new Hittable( shape, property, null, this.parent, options );
    this.addHittable( hittable );
  }

  /**
   * Add a Node to the detector. If the Pointer goes over the Node's bounds in the global coordinate
   * frame, it is detected as a 'hit'.
   * @public
   * @param node
   */
  addNode( node ) {
    const hittable = new Hittable( node, new BooleanProperty( false ), this.focusHitEmitter, this.parent );
    this.addHittable( hittable );
  }

  /**
   * Remove the node from this ShapeHitDetector.
   * @public
   *
   * @param node
   */
  removeNode( node ) {
    this.hittables.forEach( hittable => {
      if ( hittable.target === node ) {
        this.removeHittable( hittable );
      }
    } );
  }

  /**
   * Returns true if the ShapeHitDetector has the provided Node in its list of hittables.
   * @public
   *
   * @param {Node} node
   * @returns {boolean}
   */
  hasNode( node ) {
    return _.some( this.hittables, hittable => {
      return hittable.target === node;
    } );
  }

  /**
   * Add a Hittable to the list.
   * @private
   * @param hittable
   */
  addHittable( hittable ) {
    this.hittables.push( hittable );

    // whenever the Property value changes, update the list of activeHittables so we know the order in which
    // pointers moved over shapes
    const listener = value => {

      // the hittable.property indicates that mouse/touch input is in use, clear the active focus hittable
      this.activeFocusHittable = null;

      _.pull( this.activeHittables, hittable );
      if ( value ) {
        this.activeHittables.unshift( hittable );
      }
      assert && assert( this.activeHittables.length <= this.hittables.length, 'too many active Hittables, probably a memory leak' );

      if ( this.activeHittables.length ) {
        this.hitShapeEmitter.emit( this.activeHittables[ 0 ].target );
      }
      else {
        this.hitShapeEmitter.emit( null );
      }
    };
    hittable.property.link( listener );

    this.hittableListenerMap.set( hittable, listener );
  }

  /**
   * Removes the Hittable from this ShapeHitDetector.
   * @public
   * @param {Hittable} hittable
   */
  removeHittable( hittable ) {
    assert && assert( this.hittables.includes( hittable ), 'trying to remove Node that is not added to hit detector' );
    const index = this.hittables.indexOf( hittable );
    if ( index >= 0 ) {
      this.hittables.splice( index, 1 );
      hittable.property.unlink( this.hittableListenerMap.get( hittable ) );
    }
  }

  /**
   * Set the shape on the hittable associated with the provided Property. Useful if your shape
   * needs to move around.
   * @public
   *
   * @param {Property} property - previously
   */
  updateShape( shape, property ) {

    const hittable = _.find( this.hittables, entry => {
      return entry.property === property;
    } );
    assert && assert( hittable !== undefined, 'could not find hittable' );

    hittable.target = shape;
  }

  /**
   * Interrupts the listener, releasing it and cancelling the behavior.
   * @public
   */
  interrupt() {
    this.isPressed = false;
    for ( let i = 0; i < this.hittables.length; i++ ) {
      this.hittables[ i ].property.set( false );
      _.pull( this.activeHittables, this.hittables[ i ] );
    }

    if ( this.pointer ) {
      this.pointer.removeInputListener( this._pointerListener );
      this.pointer = null;
    }
  }

  /**
   * For debugging. Show attached shapes visually.
   * @public
   * @returns {[type]} [description]
   */
  getDebugPaths() {
    const paths = [];
    for ( let i = 0; i < this.hittables.length; i++ ) {
      paths.push( this.hittables[ i ].getDebugPath() );
    }

    return paths;
  }
}

/**
 * Collection of Shape and BooleanProperty whose value is true the pointer is down over the provided shape.
 */
class Hittable {

  /**
   * @param {Shape|Node} target - Either a Shape or a Node to detect hits by a Pointer
   * @param {BooleanProperty} property - true when the pointer is down over this shape
   * @param {null|Emitter} focusHitEmitter - emits an event when focus is on the target (only if target is Node)
   * @param {Node} parent - pare
   * @param {Objects} options
   */
  constructor( target, property, focusHitEmitter, parent, options ) {
    options = merge( {

      // to make this shape visible during debugging
      debugStroke: 'green'
    }, options );

    // {Shape|Node}
    this.target = target;

    this.parent = parent;

    // @public (read-only)
    this.property = property;

    // @public {null|Emitter}
    this.focusHitEmitter = focusHitEmitter;

    // @private
    this.debugStroke = options.debugStroke;
  }

  /**
   * Sets the property based on whether or not the point is within the shape.
   * @public
   *
   * @param {Vector2} point - in the global coordinate frame
   * @returns {boolean} [description]
   */
  detectHit( point ) {
    if ( this.target instanceof Node ) {
      this.property.set( this.parent.globalToLocalBounds( this.target.globalBounds ).containsPoint( point ) );
    }
    else {
      this.property.set( this.target.containsPoint( point ) );
    }
  }

  /**
   * Determines whether a focus event lands on this hittable. If the hittable target is an ancestor of the focused
   * node OR the focused node is an ancestor of the hittable, it is considered a hit.
   *
   * @param {SceneryEvent} focusEvent
   * @private
   */
  detectHitFromFocus( focusEvent ) {
    let hitDetected = false;

    if ( this.target === focusEvent.target ) {
      hitDetected = true;
      this.focusHitEmitter.emit( this.target );
    }

    return hitDetected;

    // THis was useful if we needed to detect whether the focused node and hit target were anywhere along
    // eachothers trails, which was at one time desireable. But this is currently not the behavior we want.
    // Keeping around in case we need this behavior again
    // let trails = [];
    //
    // if ( this.target instanceof Node ) {
    //   const eventToHittableTrails = focusEvent.target.getLeafTrailsTo( this.target );
    //   const hittableToEventTrails = this.target.getLeafTrailsTo( focusEvent.target );
    //   trails = eventToHittableTrails.concat( hittableToEventTrails );
    // }
    //
    // this.property.set( trails.length > 0 );
  }

  /**
   * Make the object shape visible. This is purely for debugging purposes.
   * @public
   */
  getDebugPath() {
    const hitShape = this.target instanceof Node ? Shape.bounds( this.target.globalBounds ) : this.target;

    return new Path( hitShape, {
      stroke: this.debugStroke,
      pickable: false
    } );
  }
}

tappi.register( 'ShapeHitDetector', ShapeHitDetector );
export default ShapeHitDetector;