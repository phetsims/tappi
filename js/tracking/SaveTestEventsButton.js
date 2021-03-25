// Copyright 2020, University of Colorado Boulder

/**
 * Button that saves data collected during sim use by sending it to the
 * containing Swift app.
 *
 * For prototyping/user testing in the vibration project, not to be used
 * in production code.
 *
 * @author Jesse Greenberg
 */

import merge from '../../../phet-core/js/merge.js';
import levelSpeakerModel from '../../../scenery-phet/js/accessibility/speaker/levelSpeakerModel.js';
import VoicingInputListener from '../../../scenery-phet/js/accessibility/speaker/VoicingInputListener.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import tappi from '../tappi.js';
import Text from '../../../scenery/js/nodes/Text.js';

// constants
// no need for this to be translatable
const BUTTON_OBJECT_RESPONSE = 'Save and send user input events';

class SaveTestEventsButton extends RectangularPushButton {

  /**
   * @param {VibrationManageriOS} vibrationManager - sends messages to the containing Swift app
   * @param {VibrationTestEventRecorder} eventRecorder - collection of user input
   * @param {Object} [options]
   */
  constructor( vibrationManager, eventRecorder, options ) {
    if ( options ) {
      assert && assert( options.content === undefined, 'SaveEventsTestButton sets button content' );
      assert && assert( options.listener === undefined, 'SaveEventsTestButton sets its button listener' );
    }

    options = merge( {
      fill: 'lightblue',

      content: new Text( 'Save Data', {
        font: new PhetFont( { size: 25 } )
      } ),

      listener: () => {
        const dataString = eventRecorder.dataToString();
        vibrationManager.saveTestEvents( dataString );
      },

      // PDOM
      innerContent: 'Save Data',
      descriptionContent: 'Press to save test and send to interviewer.',
      appendDescription: true
    }, options );

    super( options );

    // register for voicing output
    this.addInputListener( new VoicingInputListener( {
      onFocusIn: () => {
        const response = levelSpeakerModel.collectResponses( BUTTON_OBJECT_RESPONSE );
        phet.joist.sim.voicingUtteranceQueue.addToBack( response );
      },
      highlightTarget: this
    } ) );

    this.eventRecorder = eventRecorder;
  }
}

tappi.register( 'SaveTestEventsButton', SaveTestEventsButton );

export default SaveTestEventsButton;
