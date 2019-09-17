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
  const timer = require( 'AXON/timer' );

  // constants
  const LOW_INTENSITY_PATTERN = [ 8, 8 ];
  const HIGH_INTENSITY_PATTERN = [ Number.MAX_SAFE_INTEGER, 0 ];

  // by default, vibration will be continuous vibration without interruption
  const DEFAULT_VIBRATION_PATTERN = [ Number.MAX_SAFE_INTEGER ];

  class VibrationManager {
    constructor() {

      // @public (read-only) {BooleanProperty} - Indicates whether or not the motor should be vibrating. This
      // accurately reflects whether or not the motor is running during uptime/downtime during a vibration
      // pattern
      this.vibratingProperty = new BooleanProperty( false );

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
      // VibrationManager.Intensity feedback during active vibration.
      this._intensityDuration = 0;

      // @private {number} - tracks how long we have been vibrating at the current interval of the specified
      // vibrationPattern.
      this._timeRunningCurrentInterval = 0;

      // @private {number} - index of the vibrationPattern that is currently 'active' in the sequence.
      this._currentIntervalIndex = 0;

      // @private {Enumeration} - Either HIGH or LOW, vibration can be one of these two (at this time) while
      // still providing continuous vibration. The vibration motor is either on or off, and we mimic "low"
      // intensity vibration by turning the motor on and off rapidly.
      this._vibrationIntensity = VibrationManager.Intensity.HIGH;

      // @private {number[]}
      this._vibrationIntensityPattern = HIGH_INTENSITY_PATTERN;

      // @private {function} - reference to the callback added to timer that keeps the vibrating motor running
      // until stopVibrate. This will eventually call navigator.vibrate.
      this._navigatorVibrationCallback = null;

      // TODO: to be called by Sim.js
      this.initialize();
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
      this.setVibrationIntensity( this._vibrationIntensity );

      // initiate vibration from the motor
      this.vibratingProperty.lazyLink( ( vibrating ) => {
        if ( vibrating ) {

          // referenced so that it can be called eagerly without waiting for intensityDuration for first call
          const intervalFunction = () => {
            navigator.vibrate( this._vibrationIntensityPattern );
          };
          this._navigatorVibrationCallback = timer.setInterval( intervalFunction, this._intensityDuration );
          intervalFunction();
        }
        else {
          timer.clearInterval( this._navigatorVibrationCallback );

          // stop any vibration
          navigator.vibrate( 0 );
        }
      } );
    }

    /**
     * Begins vibration. Optionally provide an intensity from 0 to 1 of the vibration.
     * @public
     *
     * @param {number} [intensity] - optional intensity for the vibration
     */
    startVibrate( pattern ) {
      this._runningVibration = true;
      this._vibrationPattern = pattern ? pattern : this._vibrationPattern;
    }

    /**
     * Stops all vibration immediately.
     */
    stopVibrate() {
      this._runningVibration = false;
      this.vibratingProperty.set( false );
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
     * Set the intensity of vibration. Will change intensity of the running vibration if there
     * is one, or set the intensity for the next time startVibrate is called.
     * @public
     */
    setVibrationIntensity( intensity ) {
      assert && assert( VibrationManager.Intensity.includes( intensity ), 'intensity not supported' );
      this._vibrationIntensity = intensity;

      if ( intensity === VibrationManager.Intensity.LOW ) {
        this._vibrationIntensityPattern = LOW_INTENSITY_PATTERN;
      }
      else if ( intensity === VibrationManager.Intensity.HIGH ) {
        this._vibrationIntensityPattern = HIGH_INTENSITY_PATTERN;
      }

      this._intensityDuration = _.reduce( this._vibrationIntensityPattern, ( sum, value ) => {
        return sum + value;
      } );
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
          console.log( 'moving to next interval');

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

        this._timeRunningCurrentInterval += dt;
      }
    }
  }


  // @public - the possible intensities for vibration supported at this time
  VibrationManager.Intensity = new Enumeration( [ 'HIGH', 'LOW' ] );

  // create the singleton instance
  const vibrationManager = new VibrationManager();

  return tappi.register( 'vibrationManager', vibrationManager );
} );