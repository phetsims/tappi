// Copyright 2019, University of Colorado Boulder

/**
 * A chart that visualizes vibration. Either "on" or "off", it produces a square wave to display vibration
 * over time.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const DynamicSeries = require( 'GRIDDLE/DynamicSeries' );
  const tappi = require( 'TAPPI/tappi' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Text = require( 'SCENERY/nodes/Text' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Panel = require( 'SUN/Panel' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const MAX_TIME = 10; // seconds of plotted data

  class VibrationChart extends Node {

    /**
     * @param {BooleanProperty} vibratingProperty
     * @param {number} width
     * @param {number} height
     */
    constructor( vibratingProperty, width, height, options ) {
      super();

      // @private
      this.vibratingProperty = vibratingProperty;

      // @private {NumberProperty} - amount of time that has elapsed in order to plot vibration against time
      this.timeProperty = new NumberProperty( 0 );

      // create the plot
      this.vibrationSeries = new DynamicSeries( { color: 'orange' } );
      const scrollingChartNode = new ScrollingChartNode( this.timeProperty, [ this.vibrationSeries ], {
        width: width,
        height: height,
        numberVerticalLines: MAX_TIME,
        numberHorizontalLines: 3
      } );
      const verticalLabel = new Text( 'Vibration', {
        rotation: -Math.PI / 2,
        font: new PhetFont( { size: 24 } )
      } );
      const horizontalLabel = new Text( 'Time (s)', {
        font: new PhetFont( { size: 24 } )
      } );

      // layout
      const labeledChartNode = new Node();
      labeledChartNode.addChild( scrollingChartNode );
      labeledChartNode.addChild( verticalLabel );
      labeledChartNode.addChild( horizontalLabel );
      verticalLabel.rightCenter = scrollingChartNode.leftCenter.minusXY( 5, 0 );
      horizontalLabel.leftTop = scrollingChartNode.leftBottom.plusXY( 0, 5 );

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
      this.vibrationSeries.data.push( new Vector2( this.timeProperty.get(), vibrationDataPoint ) );

      while ( this.vibrationSeries.data[ 0 ].x < this.timeProperty.value - MAX_TIME ) {
        this.vibrationSeries.data.shift();
      }
      this.vibrationSeries.emitter.emit();
    }
  }

  return tappi.register( 'VibrationChart', VibrationChart );
} );
