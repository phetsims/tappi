// Copyright 2019-2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jesse Greenberg
 */

import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BasicsScreen from './demo/basics/BasicsScreen.js';
import PatternsScreen from './demo/patterns/PatternsScreen.js';
import tappiStrings from './tappi-strings.js';
import vibrationManager from './vibrationManager.js';

const tappiTitleString = tappiStrings.tappi.title;

const simOptions = {
  credits: {
    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    soundDesign: '',
    thanks: ''
  },

  vibrationManager: vibrationManager
};

// launch the sim - beware that scenery Image nodes created outside of SimLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
SimLauncher.launch( () => {
  const sim = new Sim( tappiTitleString, [
    new BasicsScreen( Tandem.ROOT.createTandem( 'basicsScreen' ) ),
    new PatternsScreen()
  ], simOptions );
  sim.start();
} );