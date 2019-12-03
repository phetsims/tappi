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
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );
  const tappi = require( 'TAPPI/tappi' );
  const Text = require( 'SCENERY/nodes/Text' );
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
          verticalRange: [ new Range( -1.5, 1.5 ) ]
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
      this.vibrationSeries.data.push( new Vector2( this.timeProperty.get(), vibrationDataPoint ) );

      while ( this.vibrationSeries.data[ 0 ].x < this.timeProperty.value - MAX_TIME ) {
        this.vibrationSeries.data.shift();
      }
      this.vibrationSeries.emitter.emit();
    }
  }

  return tappi.register( 'VibrationChart', VibrationChart );
} );
