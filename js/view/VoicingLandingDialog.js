// Copyright 2020, University of Colorado Boulder

/**
 * A Dialog with information about the voicing feature, and a button
 * to enable web speech within the sim. Many browsers do not allow speech synthesis
 * until user has made some activation. It is intended for use only in interviews
 * that are coming up in November of 2020, so that it is as easy as possilbe to enable this feature
 * in interviews with BVI participants. In the long run this feature will be enabled with
 * some user setting so this will not be necessary.
 *
 * @author Jesse Greenberg
 */

import stepTimer from '../../../axon/js/Timer.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import sceneryPhet from '../../../scenery-phet/js/sceneryPhet.js';
import voicingUtteranceQueue from '../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import webSpeaker from '../../../scenery/js/accessibility/voicing/webSpeaker.js';
import Display from '../../../scenery/js/display/Display.js';
import RichText from '../../../scenery/js/nodes/RichText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import TextPushButton from '../../../sun/js/buttons/TextPushButton.js';
import Dialog from '../../../sun/js/Dialog.js';

// constants
const contentFont = new PhetFont( 16 );
const titleFont = new PhetFont( 32 );

// strings
const titleString = 'Web Speech!';
const descriptionString = 'This page uses Web Speech to describe what is available and what is happening. ' +
                          'You will need to turn off your screen reader once you enable web speech.';
const enableButtonContent = 'Enable Web Speech';
const speechEnabledString = 'Web Speech Enabled';

class VoicingLandingDialog extends Dialog {
  constructor( options ) {
    if ( options ) {
      assert && assert( options.title === undefined, 'VoicingLandingDialog sets title' );
      assert && assert( options.closeButtonListener === undefined, 'VoicingLandingDialog sets closeButtonListener' );
    }

    options = merge( {

      title: new Text( titleString, {
        font: titleFont,
        tagName: 'h1',
        innerContent: titleString
      } ),

      closeButtonListener: () => {
        this.closeLandingDialog();
      }
    }, options );

    // paragraph describing the dialog and this feature
    const descriptionParagraph = new RichText( descriptionString, {
      lineWrap: 500,
      tagName: 'p',
      innerContent: descriptionString
    } );

    const enableButton = new TextPushButton( enableButtonContent, {
      listener: () => {
        this.closeLandingDialog();
      },

      font: contentFont
    } );

    const content = new VBox( {
      children: [ descriptionParagraph, enableButton ],
      spacing: 15
    } );

    super( content, options );

    // this is a workaround to speak the label of the close button when this dialog is
    // open - when this feature gets built out more thoroughly this would just be
    // attached to focus of the Dialog's private close button - but I really didn't want
    // to add code to Dialog, and I didn't want to work in a branch so this is here for now
    Display.focusProperty.lazyLink( focus => {
      if ( focus && focus.trail.lastNode().innerContent === 'Close' ) {
        voicingUtteranceQueue.addToBack( 'Close' );
      }
    } );
  }

  /**
   * Close the landing dialog, speaking immediately that speech is enabled so that browsers
   * will allow speech after an initial user interaction.
   * @private
   */
  closeLandingDialog() {

    // speak must be called directly, for some reason if this gets deferred by the delay
    // in utteranceQueue iOS Safari will never speak it
    webSpeaker.speakImmediately( speechEnabledString );

    // allow the initial speech to finish before speaking the next thing - the initial
    // speech is separate from the utteranceQueue and therefore we cannot make other
    // utterances relatively polite
    stepTimer.setTimeout( () => {
      this.hide();
    }, 1000 );

    // don't allow any input while waiting for speech, we don't want to close the dialog twice
    this.inputEnabled = false;
  }
}

sceneryPhet.register( 'VoicingLandingDialog', VoicingLandingDialog );
export default VoicingLandingDialog;