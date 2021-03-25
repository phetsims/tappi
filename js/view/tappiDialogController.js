// Copyright 2020, University of Colorado Boulder

/**
 * Controls landing and intro dialogs as they appear on simulation load. Intended only for interviews
 * coming up early November 2020. If voicing is enabled, it will show an initial dialog
 * that has a button to enable web speech, satisfying the requirement by most browsers that
 * speech becomes enabled after some user interaction. If custom gestures are enabled, it will
 * then continue to another dialog with a few simple UI components to teach the user how to use gestures.
 *
 * A singleton, because it registers behavior but is generally unused once the dialogs have
 * been shown.
 *
 * @author Jesse Greenberg
 */

import CustomGestureIntroDialog from './CustomGestureIntroDialog.js';
import VoicingLandingDialog from './VoicingLandingDialog.js';
import tappi from '../tappi.js';

class TappiDialogController {
  constructor() {}

  /**
   * Creates the dialogs, and adds a listener that creates the dialogs once the sim has been
   * constructed (because bounds will be defined then).
   * @public
   * @param voicingQuickControl
   */
  initialize( voicingQuickControl ) {
    assert && assert( phet.joist.sim, 'This controller must be used in a PhET simulation' );

    const supportsVoicing = phet.chipper.queryParameters.supportsVoicing;
    const supportsGestureControl = phet.chipper.queryParameters.supportsGestureControl;

    // wait to display any initial dialogs until the simulation is complete
    phet.joist.sim.isConstructionCompleteProperty.link( complete => {
      if ( complete ) {
        if ( supportsVoicing ) {

          // for interviews, you should not be able to do anything outside of these
          // dialogs until you go through their content - don't dismiss by tapping
          // barrier rectangle
          phet.joist.sim.barrierRectangle.inputEnabled = false;

          const landingDialog = new VoicingLandingDialog( {
            hideCallback: () => {

              // if gesture controls are enabled, show an intro dialog that introduces
              // gestures - otherwise, put focus on the quick control to guide the user
              // toward those simulation overview buttons
              if ( supportsGestureControl ) {
                const introDialog = new CustomGestureIntroDialog( {
                  hideCallback: () => {
                    voicingQuickControl.focusExpandCollapseButton();
                    phet.joist.sim.barrierRectangle.inputEnabled = true;
                  }
                } );

                introDialog.show();
                introDialog.focusIntroDescription();
              }
              else {
                voicingQuickControl.focusExpandCollapseButton();
                phet.joist.sim.barrierRectangle.inputEnabled = true;
              }
            }
          } );

          landingDialog.show();
        }
      }
    } );
  }
}

const tappiDialogController = new TappiDialogController();

tappi.register( 'tappiDialogController', tappiDialogController );
export default tappiDialogController;