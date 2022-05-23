// Copyright 2019-2022, University of Colorado Boulder

/**
 * Main entry point for the demo and test harness for this library.
 *
 * @author Jesse Greenberg
 */

// @ts-nocheck

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import BasicsScreen from './demo/basics/BasicsScreen.js';
import PatternsScreen from './demo/patterns/PatternsScreen.js';
import tappiStrings from './tappiStrings.js';
// import vibrationManager from './vibrationManager.js';

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
  }

  // NOTE: Sim.js no longer takes this option, but this was the way we passed it to the sim to test HTML5 vibration.
  // It was an option for Sim.js so that we didn't create dependencies on tappi because it is experimental. But
  // TypeScript requires references for typing so we decided to just remove the option for now since tappi is
  // abandoned for the most part. If coming back to this, look into initializing and stepping the vibrationManager.
  // See https://github.com/phetsims/joist/issues/794
  // vibrationManager: vibrationManager
};

// launch the sim - beware that scenery Image nodes created outside of simLauncher.launch() will have zero bounds
// until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
simLauncher.launch( () => {
  const sim = new Sim( tappiTitleString, [
    new BasicsScreen( Tandem.ROOT.createTandem( 'basicsScreen' ) ),
    new PatternsScreen()
  ], simOptions );
  sim.start();
} );