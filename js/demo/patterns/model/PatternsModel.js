// Copyright 2019, University of Colorado Boulder

/**
 * Model for the Patterns screen of the tappi demo.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const tappi = require( 'TAPPI/tappi' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  class PatternsModel  {
    constructor() {

      // @public - the current set of patterns available for demonstration
      this.activePatternSetProperty = new EnumerationProperty( PatternsModel.PatternSet, PatternsModel.PatternSet.PULSES );

      // @public {Property<null|number[]>} - The running pattern provided to the vibration manager
      this.activePatternProperty = new Property( null );
    }
  }

  // @public
  PatternsModel.PatternSet = new Enumeration( [ 'PULSES', 'EFFECTS', 'TUNES' ] );

  return tappi.register( 'PatternsModel', PatternsModel );
} );