// Copyright 2020, University of Colorado Boulder

/**
 * Controls landing and intro dialogs as they appear on simulation load. Intended only for interviews
 * coming up early November 2020. If self-voicing is enabled, it will show an initial dialog
 * that has a button to enable web speech, satisfying the requirement by most browsers that
 * speech becomes enabled after some user interaction. If custom gestures are enabled, it will
 * then continue to another dialog with a few simple UI componenents to teach the user how to use gestures.
 *
 * A singleton, because it registers behavior but is generally unused once the dialogs have
 * been shown.
 *
 * @author Jesse Greenberg
 */

import CustomGestureIntroDialog from '../../../scenery-phet/js/accessibility/speaker/CustomGestureIntroDialog.js';
import SelfVoicingLandingDialog from '../../../scenery-phet/js/accessibility/speaker/SelfVoicingLandingDialog.js';
import tappi from '../tappi.js';

class TappiDialogController {
  constructor() {}

  /**
   * Creates the dialogs, and adds a listener that creates the dialogs once the sim has been
   * constructed (because bounds will be defined then).
   * @public
   * @param selfVoicingQuickControl
   */
  initialize( selfVoicingQuickControl ) {
    assert && assert( phet.joist.sim, 'This controller must be used in a PhET simulation' );

    const supportsSelfVoicing = phet.chipper.queryParameters.supportsSelfVoicing;
    const supportsGestureControl = phet.chipper.queryParameters.supportsGestureControl;

    // wait to display any intial dialogs until the simulation is complete
    phet.joist.sim.isConstructionCompleteProperty.link( complete => {
      if ( complete ) {
        if ( supportsSelfVoicing ) {
          const landingDialog = new SelfVoicingLandingDialog( {
            hideCallback: () => {

              // if gesture controls are enabled, show an intro dialog that introduces
              // guestures - otherwise, put focus on the quick control to guide the user
              // toward those simulation overview buttons
              if ( supportsGestureControl ) {
                const introDialog = new CustomGestureIntroDialog( {
                  hideCallback: () => {
                    selfVoicingQuickControl.focusExpandCollapseButton();
                  }
                } );

                introDialog.show();
                introDialog.focusIntroDescription();
              }
              else {
                selfVoicingQuickControl.focusExpandCollapseButton();
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