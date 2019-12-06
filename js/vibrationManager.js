// Copyright 2019, University of Colorado Boulder

/**
 * A singleton that manages vibration feedback through the web vibration API. navigator.vibrate is required
 * to use this file. See https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate for more
 * information and a list of supported platforms. If not defined, this file will do nothing.
 *
 * Vibration can be started with vibrationManager.startVibrate() to begin continuous vibration. Stop with
 * vibrationManager.stopVibrate.
 *
 * Vibration patterns can also be defined similarly to navigator.vibrate(). vibrationManager.startVibrate()
 * can take an array of intervals that define the uptime/downtime of the vibration motor. See that function
 * for more information.
 *
 * Since the manager works with intervals of time, it must be stepped every animation frame with
 * vibrationManater.step().
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const tappi = require( 'TAPPI/tappi' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const Property = require( 'AXON/Property' );
  const timer = require( 'AXON/timer' );

  // constants
  const LOW_INTENSITY_PATTERN = [ 8, 8 ];
  const HIGH_INTENSITY_PATTERN = [ Number.MAX_SAFE_INTEGER, 0 ];

  const Intensity = Enumeration.byKeys( [ 'HIGH', 'LOW' ] );

  // by default, vibration will be continuous vibration without interruption
  const DEFAULT_VIBRATION_PATTERN = [ Number.MAX_SAFE_INTEGER ];

  class VibrationManager {
    constructor() {

      // @public (read-only) {BooleanProperty} - Indicates whether or not the motor should be vibrating. This
      // accurately reflects whether or not the motor is running during uptime/downtime during a vibration
      // pattern
      this.vibratingProperty = new BooleanProperty( false );

      // @public (read-only) {EnumerationProperty} - Indicates the current value of vibration intensity. Either HIGH
      // or LOW, vibration can be one of these two (at this time) while still providing continuous vibration.
      // The vibration motor is either on or off, and we mimic "low" intensity vibration by turning the motor on and
      // off rapidly.
      this.intensityProperty = new EnumerationProperty( Intensity, Intensity.HIGH );

      // @public (read-only) - whether or not vibration is enabled
      this.enabledProperty = new BooleanProperty( true );

      // @private {boolean} - whether or not a vibration pattern is running, may not
      // indicate whether or not the device is actually vibrating as this could be true
      // during a vibration pattern downtime.
      this._runningVibration = false;

      // @private {Array<number>} - Pattern of vibration and pause intervals, each value
      // indicates number of milliseconds to vibrate or pause in alternation. Unlike the
      // Navigator API, single value is not allowed, and any pattern here will proceed until
      // stopVibrate is called.
      this._vibrationPattern = DEFAULT_VIBRATION_PATTERN;

      // @private {number} - the duration of active intensity pattern, only used to produce one of
      // Intensity feedback during active vibration.
      this._intensityDuration = 0;

      // @private {number} - tracks how long we have been vibrating at the current interval of the specified
      // vibrationPattern. Increments even during downtime "off" interval in a pattern.
      this._timeRunningCurrentInterval = 0;

      // @private {number} - limitation for the active vibration, vibration pattern will run until this time
      // runs out. Includes pattern down time. By default, vibration patterns will run forever.
      this._patternTimeLimit = Number.POSITIVE_INFINITY;

      // @private {number} - how much time has passed since we started to vibrate with a particular pattern, will
      // still increment during vibration pattern downtime.
      this._timeRunningCurrentPattern = 0;

      // @private {number} - index of the vibrationPattern that is currently 'active' in the sequence.
      this._currentIntervalIndex = 0;

      // @private {number[]}
      this._vibrationIntensityPattern = HIGH_INTENSITY_PATTERN;

      // @private {function} - reference to the callback added to timer that keeps the vibrating motor running
      // until stopVibrate. This will eventually call navigator.vibrate.
      this._navigatorVibrationCallback = null;
    }

    /**
     * Initialize the vibrationManager by setting initial state variables and attaching listeners.
     * NOTE: This should eventually be called in Sim.js (or other framework) only when vibration is required.
     * @public
     *
     * @param {BooleanProperty} simVisibleProperty - is your application visible?
     * @param {BooleanProperty} simActiveProperty - is your application in the foreground?
     */
    initialize( simVisibleProperty, simActiveProperty ) {
      this.setVibrationIntensity( this.intensityProperty.get() );

      // if either vibration or intensity changes we need to stop/start vibration or change timeouts for intensity
      Property.multilink( [ this.vibratingProperty, this.intensityProperty ], ( vibrating, intensity ) => {
        this.controlNavigator();
      } );

      // stop all vibration when the sim is invisible or inactive
      Property.multilink( [ this.enabledProperty, simVisibleProperty, simActiveProperty ], ( enabled, simVisible, simActive ) => {
        if ( enabled && simVisible && simActive ) {
          this.stopVibrate();
        }
      } );
    }

    /**
     * Initiate vibration with navigator.vibrate at the correct intervals for vibration intensity.
     * @private
     */
    controlNavigator() {
      if ( this._navigatorVibrationCallback ) {
        timer.clearInterval( this._navigatorVibrationCallback );
        this._navigatorVibrationCallback = null;

        // stop any previous vibration
        navigator.vibrate( 0 );
      }

      if ( this.vibratingProperty.get() ) {

        // referenced so that it can be called eagerly without waiting for intensityDuration for first call
        const intervalFunction = () => {
          navigator.vibrate( this._vibrationIntensityPattern );
        };
        this._navigatorVibrationCallback = timer.setInterval( intervalFunction, this._intensityDuration );
        intervalFunction();
      }
    }

    /**
     * Begins vibration. Optionally provide a pattern sequence for the vibration. Vibration will continue
     * with the pattern sequence until stopVibrate is called.
     * @public
     *
     * @param {number} [pattern] - optional vibration sequence, default motor call if not defined
     */
    startVibrate( pattern ) {
      this.resetTimingVariables();

      this._runningVibration = true;
      this._vibrationPattern = pattern ? pattern : DEFAULT_VIBRATION_PATTERN;
    }

    /**
     * Stops all vibration immediately.
     */
    stopVibrate() {
      this._runningVibration = false;
      this.vibratingProperty.set( false );
    }

    /**
     * Start a vibration. Optionally provide a pattern sequence for the vibration. Vibration will proceed for
     * time in ms and then stop.
     *
     * @param {number} time - in ms, how long the vibration should run
     * @param {number[]} pattern - optional, pattern for the vibration, uses defalt vibration pattern if not defined
     */
    startTimedVibrate( time, pattern ) {
      assert && assert( typeof time === 'number', 'time limit required for startTimedVibration' );

      this.resetTimingVariables();

      this._patternTimeLimit = time;
      this._runningVibration = true;
      this._vibrationPattern = pattern ? pattern : DEFAULT_VIBRATION_PATTERN;
    }

    /**
     * Shortcut to determine whether we are currently vibrating. This should accurately
     * indicate whether or not the device is actually vibrating.
     *
     * @returns {boolean}
     */
    isVibrating() {
      return this.vibratingProperty.get();
    }

    /**
     * Returns true if the VibrationManager is active with a vibration pattern. The device may or may not be
     * actually vibrating as this will return true even during down time within a pattern.
     * @public
     *
     * @returns {boolean}
     */
    isRunningPattern() {
      return this._runningVibration;
    }

    /**
     * Set the intensity of vibration. Will change intensity of the running vibration if there
     * is one, or set the intensity for the next time startVibrate is called.
     * @public
     */
    setVibrationIntensity( intensity ) {
      assert && assert( Intensity.includes( intensity ), 'intensity not supported' );

      if ( intensity === Intensity.LOW ) {
        this._vibrationIntensityPattern = LOW_INTENSITY_PATTERN;
      }
      else if ( intensity === Intensity.HIGH ) {
        this._vibrationIntensityPattern = HIGH_INTENSITY_PATTERN;
      }

      this._intensityDuration = _.reduce( this._vibrationIntensityPattern, ( sum, value ) => {
        return sum + value;
      } );

      // set after updating state
      this.intensityProperty.set( intensity );
    }

    /**
     * Reset all variables tracking time and where we are in the vibration sequence.
     * @private
     */
    resetTimingVariables() {
      this._timeRunningCurrentInterval = 0;
      this._timeRunningCurrentPattern = 0;
      this._currentIntervalIndex = 0;
      this._patternTimeLimit = Number.POSITIVE_INFINITY;
    }

    /**
     * Vibrate at the intervals and intensity specified. To be called on the animation frame.
     * @public
     *
     * @param {number} dt
     */
    step( dt ) {

      // navigator.vibrate works in milliseconds
      dt = dt * 1000;

      // running a vibration, vibrate with navigator
      if ( this._runningVibration ) {
        assert && assert( this._currentIntervalIndex < this._vibrationPattern.length, 'index out of interval length' );

        const currentInverval = this._vibrationPattern[ this._currentIntervalIndex ];
        if ( this._timeRunningCurrentInterval > currentInverval ) {

          // move on to the next interval (or back to beginning if next index is out of array)
          const nextIndex = this._currentIntervalIndex + 1;
          this._currentIntervalIndex = nextIndex < this._vibrationPattern.length ? nextIndex : 0;
          this._timeRunningCurrentInterval = 0;
        }
        else {

          // proceed with vibration (or not) - even indices in the series are uptime
          if ( this._currentIntervalIndex % 2 === 0 ) {
            this.vibratingProperty.set( true );
          }
          else {
            this.vibratingProperty.set( false );
          }
        }

        // increment timing variables for the whole pattern and individual pattern intervals
        this._timeRunningCurrentInterval += dt;
        this._timeRunningCurrentPattern += dt;

        if ( this._timeRunningCurrentPattern >= this._patternTimeLimit ) {
          this.stopVibrate();
        }
      }
    }
  }

  // create the singleton instance
  const vibrationManager = new VibrationManager();

  // @public - the possible intensities for vibration supported at this time (on the singleton instance because
  // that is what is made available through require)
  vibrationManager.Intensity = Intensity;

  return tappi.register( 'vibrationManager', vibrationManager );
} );
