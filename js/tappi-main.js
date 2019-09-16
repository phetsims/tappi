// Copyright 2019, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const TappiScreen = require( 'TAPPI/demo/TappiScreen' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const tappiTitleString = require( 'string!TAPPI/tappi.title' );

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
  };

  // launch the sim - beware that scenery Image nodes created outside of SimLauncher.launch() will have zero bounds
  // until the images are fully loaded, see https://github.com/phetsims/coulombs-law/issues/70
  SimLauncher.launch( () => {
    const sim = new Sim( tappiTitleString, [
      new TappiScreen( Tandem.rootTandem.createTandem( 'tappiScreen' ) )
    ], simOptions );
    sim.start();
  } );
} );