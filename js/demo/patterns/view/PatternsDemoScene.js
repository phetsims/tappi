// Copyright 2019, University of Colorado Boulder

/**
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const tappi = require( 'TAPPI/tappi' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const BooleanRectangularStickyToggleButton = require( 'SUN/buttons/BooleanRectangularStickyToggleButton' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const BUTTON_TEXT_FONT = new PhetFont( { size: 40 } );
  const DEFAULT_BUTTON_WIDTH = 200;

  class PatternsDemoScene extends Node {
    constructor( activePatternProperty ) {
      super();

      // @protected - active vibration pattern running in the model
      this.activePatternProperty = activePatternProperty;

      // @protected {BooleanRectangularStickyToggleButton[]} - list of all buttons for this scene
      this.buttons = [];
    }

    /**
     * Create a button for this scene.
     * @protected
     *
     * @param {number[]} pattern - the actual pattern for vibrationManager
     * @param {string} label - label for the button
     * @param {Object} options
     * @returns {BooleanRectangularStickyToggleButton}
     */
    createPatternButton( pattern, label, options ) {

      options = _.extend( {
        buttonMinWidth: DEFAULT_BUTTON_WIDTH
      }, options );

      const buttonAdapterProperty = new BooleanProperty( false, {
        reentrant: true
      } );
      buttonAdapterProperty.link( ( pressed ) => {
        if ( pressed ) {
          this.activePatternProperty.set( pattern );
        }
        else if ( this.activePatternProperty.get() === pattern ) {

          // clicking the button while it is clicked, disabling all active patterns
          this.activePatternProperty.set( null );
        }
      } );

      // if a different pattern button is clicked, this button is no longer pressed
      this.activePatternProperty.link( ( activePattern ) => {
        if ( activePattern !== pattern ) {
          buttonAdapterProperty.set( false );
        }
      } );

      return new BooleanRectangularStickyToggleButton( buttonAdapterProperty, {
        content: new Text( label, { font: BUTTON_TEXT_FONT } ),
        minWidth: options.buttonMinWidth
      } );
    }

    /**
     * Create one pattern button for each of the provided patterns. Then add all created buttons to the scene
     * and manage layout.
     * NOTE: At this time there is no way to remove buttons. You can only add them. That seems fine for this demo.
     *
     * @param { {pattern: number[], label: string }[] } patterns - contains button label and
     */
    createPatternButtons( patterns ) {

      // remove all added buttons, they will be added back later with new layout
      this.removeAllChildren();

      // determine the min width of buttons by text content so they all match size
      let minWidth = 0;
      for ( let i = 0; i < patterns.length; i++ ) {
        const textText = new Text( patterns[ i ].label, { font: BUTTON_TEXT_FONT } );
        minWidth = Math.max( minWidth, textText.width );
      }
      assert && assert( minWidth > 0, 'min width not found, calculate correctly?' );
      minWidth += 5; // add a little padding

      for ( let i = 0; i < patterns.length; i++ ) {
        const button = this.createPatternButton( patterns[ i ].pattern, patterns[ i ].label, {
          buttonMinWidth: minWidth
        } );
        this.buttons.push( button );
      }

      // rows of three button columns
      const buttonColumns = [];
      for ( let i = 0; i < this.buttons.length + 3; i += 3 ) {
        const buttonVBox = new VBox( {
          children: this.buttons.slice( i, i + 3 ),
          spacing: 5
        } );
        buttonColumns.push( buttonVBox );
      }

      this.addChild( new HBox( {
        children: buttonColumns,
        align: 'top',
        spacing: 5
      } ) );
    }
  }

  return tappi.register( 'PatternsDemoScene', PatternsDemoScene );
} );
