// Copyright 2020, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import tappi from '../tappi.js';
import VibrationTestEvent from './VibrationTestEvent.js';

class VibrationTestInputListener {

  /**
   * @param {VibrationTestEventRecorder} eventRecorder - object saving VibrationTestEvents, passed in since this is not
   *                                                     the only class creating and saving events.
   */
  constructor( eventRecorder ) {

    // @private {VibrationTestEventRecorder}
    this.eventRecorder = eventRecorder;

    // in seconds
    this.elapsedTime = 0;
  }

  /**
   * @public (scenery-internal) - part of the listener API
   * @param event
   */
  down( event ) {
    const globalPoint = event.pointer.point;
    const testEvent = new VibrationTestEvent( globalPoint.x, globalPoint.y, this.elapsedTime, event.pointer.type + 'down' );
    this.eventRecorder.addTestEvent( testEvent );
  }

  move( event ) {
    const globalPoint = event.pointer.point;
    const testEvent = new VibrationTestEvent( globalPoint.x, globalPoint.y, this.elapsedTime, event.pointer.type + 'move' );
    this.eventRecorder.addTestEvent( testEvent );
  }

  /**
   * @public (scenery-internal) - part of the listener API
   * @param event
   */
  up( event ) {
    const globalPoint = event.pointer.point;
    const testEvent = new VibrationTestEvent( globalPoint.x, globalPoint.y, this.elapsedTime, event.pointer.type + 'up' );
    this.eventRecorder.addTestEvent( testEvent );
  }

  /**
   * Sets the elapsed time to be saved for events. Rather than stepping/tracking its own elapsed time,
   * it should be set externally by a simulation because this listener is not the only one to save data
   * to the event recorder. The simulation updates its elapsed time in one location and sends that
   * to the places that need it.
   * @public
   *
   * @param {number} time - in seconds
   */
  setElapsedTime( time ) {
    this.elapsedTime = time;
  }
}

tappi.register( 'VibrationTestInputListener', VibrationTestInputListener );

export default VibrationTestInputListener;
