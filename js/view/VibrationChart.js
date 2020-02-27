// Copyright 2019, University of Colorado Boulder

/**
 * A chart that visualizes vibration. Either "on" or "off", it produces a square wave to display vibration
 * over time.
 *
 * @author Jesse Greenberg
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import DynamicSeries from '../../../griddle/js/DynamicSeries.js';
import ScrollingChartNode from '../../../griddle/js/ScrollingChartNode.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Panel from '../../../sun/js/Panel.js';
import tappi from '../tappi.js';

// constants
const MAX_TIME = 10; // seconds of plotted data

class VibrationChart extends Node {

  /**
   * @param {BooleanProperty} vibratingProperty
   * @param {number} width
   * @param {number} height
   */
  constructor( vibratingProperty, width, height, options ) {

    // beware this also gets passed to mutate for the supertype later
    options = merge( {

      // font for the vibration/time labels
      labelFont: new PhetFont( 24 )
    }, options );

    super();

    // @private
    this.vibratingProperty = vibratingProperty;

    // @private {NumberProperty} - amount of time that has elapsed in order to plot vibration against time
    this.timeProperty = new NumberProperty( 0 );

    // create the plot
    this.vibrationSeries = new DynamicSeries( { color: 'orange' } );

    const verticalAxisTitleNode = new Text( 'Vibration', {
      rotation: -Math.PI / 2,
      font: options.labelFont
    } );
    const horizontalAxisTitleNode = new Text( 'Time (s)', {
      font: options.labelFont
    } );
    const scrollingChartNode = new ScrollingChartNode( this.timeProperty, [ this.vibrationSeries ], verticalAxisTitleNode,
      horizontalAxisTitleNode, new Text( '' ), {
        width: width,
        height: height,
        numberVerticalLines: MAX_TIME,
        numberHorizontalLines: 3,
        verticalRanges: [ new Range( -1.5, 1.5 ) ]
      } );

    // layout
    const labeledChartNode = new Node();
    labeledChartNode.addChild( scrollingChartNode );

    // contain in a panel
    const panel = new Panel( labeledChartNode, {
      fill: 'lightgrey'
    } );
    this.addChild( panel );

    // mutate with options after bounds are defined
    this.mutate( options );
  }

  /**
   * Add data to the scrolling chart.
   *
   * @param {number} dt - in ms
   */
  step( dt ) {
    this.timeProperty.set( this.timeProperty.get() + dt );

    const vibrationDataPoint = this.vibratingProperty.get() ? 1 : -1;
    this.vibrationSeries.addXYDataPoint( this.timeProperty.get(), vibrationDataPoint );

    while ( this.vibrationSeries.getDataPoint( 0 ).x < this.timeProperty.value - MAX_TIME ) {
      this.vibrationSeries.shiftData();
    }
  }
}

tappi.register( 'VibrationChart', VibrationChart );
export default VibrationChart;