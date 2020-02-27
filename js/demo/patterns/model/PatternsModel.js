// Copyright 2019, University of Colorado Boulder

/**
 * Model for the Patterns screen of the tappi demo.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../../axon/js/Property.js';
import Enumeration from '../../../../../phet-core/js/Enumeration.js';
import tappi from '../../../tappi.js';

/**
 * @constructor
 */
class PatternsModel {
  constructor() {

    // @public - the current set of patterns available for demonstration
    this.activePatternSetProperty = new EnumerationProperty( PatternsModel.PatternSet, PatternsModel.PatternSet.PULSES );

    // @public {Property<null|number[]>} - The running pattern provided to the vibration manager
    this.activePatternProperty = new Property( null );

    // @public - if true, vibration patterns will be time limitted rather than running forever
    this.limitPatternsProperty = new BooleanProperty( false );
  }
}

// @public
PatternsModel.PatternSet = Enumeration.byKeys( [ 'PULSES', 'EFFECTS', 'TUNES' ] );

tappi.register( 'PatternsModel', PatternsModel );
export default PatternsModel;