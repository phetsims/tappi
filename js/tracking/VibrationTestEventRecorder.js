// Copyright 2020, University of Colorado Boulder

/**
 * A collection of VibrationTestEvents. Has functions that prepare the data to be sent to
 * a containing Swift app (as is used in the Vibration project) - so that the data
 * can be saved to the device or sent back to the team for further testing.
 *
 * @author Jesse Greenberg
 */

import tappi from '../tappi.js';

class VibrationTestEventRecorder {
  constructor( options ) {
    this.events = [];

    this.dataSaved = false;
  }

  /**
   * Adds a VibrationTestEvent to the collection.
   * @public
   *
   * @param {VibrationTestEvent} testEvent
   */
  addTestEvent( testEvent ) {
    this.events.push( testEvent );
  }

  /**
   * Convert all saved events to a string that can be sent to the containing Swift app.
   * @public
   */
  dataToString() {
    let string = '';

    this.events.forEach( event => {
      string += event.x + ',';
      string += event.y + ',';
      string += event.time + ',';
      string += event.name + ';';
    } );

    return string;
  }
}

tappi.register( 'VibrationTestEventRecorder', VibrationTestEventRecorder );

export default VibrationTestEventRecorder;
