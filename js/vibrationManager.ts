// Copyright 2019-2022, University of Colorado Boulder

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
 * vibrationManager.step().
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import stepTimer from '../../axon/js/stepTimer.js';
import tappi from './tappi.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationProperty from '../../axon/js/EnumerationProperty.js';
import Property from '../../axon/js/Property.js';
import { TimerListener } from '../../axon/js/Timer.js';

// constants
const LOW_INTENSITY_PATTERN = [ 8, 8 ];
const HIGH_INTENSITY_PATTERN = [ Number.MAX_SAFE_INTEGER, 0 ];

// enum for intensity levels
export class Intensity extends EnumerationValue {
  public static HIGH = new Intensity();
  public static LOW = new Intensity();

  // Gets a list of keys, values and mapping between them.  For use in EnumerationProperty and PhET-iO
  public static enumeration = new Enumeration( Intensity );
}

const NOOP_TIME_LISTENER = ( dt: number ) => {};

// by default, vibration will be continuous vibration without interruption
const DEFAULT_VIBRATION_PATTERN = [ Number.MAX_SAFE_INTEGER ];

class VibrationManager {

  private readonly enabledProperty = new BooleanProperty( true );

  // Indicates whether the motor should be vibrating. This accurately reflects whether the motor is running during
  // uptime/downtime during a vibration pattern.
  private readonly vibratingProperty = new BooleanProperty( false );

  // Indicates the current value of vibration intensity. Either HIGH or LOW, vibration can be one of these two (at this
  // time) while still providing continuous vibration.  The vibration motor is either on or off, and we mimic "low"
  // intensity vibration by turning the motor on and off rapidly.
  private readonly intensityProperty = new EnumerationProperty( Intensity.HIGH );

  // Whether a vibration pattern is running, may not indicate whether the device is actually vibrating as this could be
  // true during a vibration pattern downtime.
  private _runningVibration = false;

  // Pattern of vibration and pause intervals, each value indicates number of milliseconds to vibrate or pause in
  // alternation. Unlike the Navigator API, single value is not allowed, and any pattern here will proceed until
  // stopVibrate is called.
  private _vibrationPattern = DEFAULT_VIBRATION_PATTERN;

  // The duration of active intensity pattern, only used to produce one of intensity feedback during active vibration.
  private _intensityDuration = 0;

  // Tracks how long we have been vibrating at the current interval of the specified vibrationPattern. Increments even
  // during downtime "off" interval in a pattern.
  private _timeRunningCurrentInterval = 0;

  // Limitation for the active vibration, vibration pattern will run until this time runs out. Includes pattern
  // downtime. By default, vibration patterns will run forever.
  private _patternTimeLimit = Number.POSITIVE_INFINITY;

  // How much time has passed since we started to vibrate with a particular pattern, will still increment during
  // vibration pattern downtime.
  private _timeRunningCurrentPattern = 0;

  // index of the vibrationPattern that is currently 'active' in the sequence
  private _currentIntervalIndex = 0;

  private _vibrationIntensityPattern = HIGH_INTENSITY_PATTERN;

  // Reference to the callback added to timer that keeps the vibrating motor running until stopVibrate. This will
  // eventually call navigator.vibrate.
  private _navigatorVibrationCallback: TimerListener = NOOP_TIME_LISTENER;

  public constructor() {
  }

  /**
   * Initialize the vibrationManager by setting initial state variables and attaching listeners.
   * NOTE: This should eventually be called in Sim.js (or other framework) only when vibration is required.
   */
  public initialize( simVisibleProperty: Property<boolean>, simActiveProperty: Property<boolean> ): void {
    this.setVibrationIntensity( this.intensityProperty.get() );

    // if either vibration or intensity changes we need to stop/start vibration or change timeouts for intensity
    Multilink.multilink( [ this.vibratingProperty, this.intensityProperty ], ( vibrating, intensity ) => {
      this.controlNavigator();
    } );

    // stop all vibration when the sim is invisible or inactive
    Multilink.multilink( [ this.enabledProperty, simVisibleProperty, simActiveProperty ], ( enabled, simVisible, simActive ) => {
      if ( enabled && simVisible && simActive ) {
        this.stopVibrate();
      }
    } );
  }

  /**
   * Initiate vibration with navigator.vibrate at the correct intervals for vibration intensity.
   */
  public controlNavigator(): void {
    if ( this._navigatorVibrationCallback ) {
      stepTimer.clearInterval( this._navigatorVibrationCallback );
      this._navigatorVibrationCallback = NOOP_TIME_LISTENER;

      // stop any previous vibration
      navigator.vibrate( 0 );
    }

    if ( this.vibratingProperty.get() ) {

      // referenced so that it can be called eagerly without waiting for intensityDuration for first call
      const intervalFunction = () => {
        navigator.vibrate( this._vibrationIntensityPattern );
      };
      this._navigatorVibrationCallback = stepTimer.setInterval( intervalFunction, this._intensityDuration );
      intervalFunction();
    }
  }

  /**
   * Begins vibration. Optionally provide a pattern sequence for the vibration. Vibration will continue with the pattern
   * sequence until stopVibrate is called.
   */
  public startVibrate( pattern: number[] ): void {
    this.resetTimingVariables();
    this._runningVibration = true;
    this._vibrationPattern = pattern ? pattern : DEFAULT_VIBRATION_PATTERN;
  }

  /**
   * Stops all vibration immediately.
   */
  public stopVibrate(): void {
    this._runningVibration = false;
    this.vibratingProperty.set( false );
  }

  /**
   * Start a vibration. Optionally provide a pattern sequence for the vibration. Vibration will proceed for
   * time in ms and then stop.
   * @param time - in ms, how long the vibration should run
   * @param pattern - optional, pattern for the vibration, uses default vibration pattern if not defined
   */
  public startTimedVibrate( time: number, pattern: number[] ): void {
    this.resetTimingVariables();

    this._patternTimeLimit = time;
    this._runningVibration = true;
    this._vibrationPattern = pattern ? pattern : DEFAULT_VIBRATION_PATTERN;
  }

  /**
   * Shortcut to determine whether we are currently vibrating. This should accurately indicate whether the device is
   * actually vibrating.
   */
  public isVibrating(): boolean {
    return this.vibratingProperty.get();
  }

  /**
   * Returns true if the VibrationManager is active with a vibration pattern. The device may or may not be actually
   * vibrating as this will return true even during downtime within a pattern.
   */
  public isRunningPattern(): boolean {
    return this._runningVibration;
  }

  /**
   * Set the intensity of vibration. Will change intensity of the running vibration if there is one, or set the
   * intensity for the next time startVibrate is called.
   */
  public setVibrationIntensity( intensity: Intensity ): void {

    if ( intensity === Intensity.LOW ) {
      this._vibrationIntensityPattern = LOW_INTENSITY_PATTERN;
    }
    else if ( intensity === Intensity.HIGH ) {
      this._vibrationIntensityPattern = HIGH_INTENSITY_PATTERN;
    }

    const intensityDuration = _.reduce( this._vibrationIntensityPattern, ( sum, value ) => {
      return sum + value;
    } );

    this._intensityDuration = typeof intensityDuration === 'number' ? intensityDuration : 0;

    // set after updating state
    this.intensityProperty.set( intensity );
  }

  /**
   * Reset all variables tracking time and where we are in the vibration sequence.
   */
  private resetTimingVariables(): void {
    this._timeRunningCurrentInterval = 0;
    this._timeRunningCurrentPattern = 0;
    this._currentIntervalIndex = 0;
    this._patternTimeLimit = Number.POSITIVE_INFINITY;
  }

  /**
   * Vibrate at the intervals and intensity specified. To be called on the animation frame.
   */
  public step( dt: number ): void {

    // navigator.vibrate works in milliseconds
    dt = dt * 1000;

    // running a vibration, vibrate with navigator
    if ( this._runningVibration ) {
      assert && assert( this._currentIntervalIndex < this._vibrationPattern.length, 'index out of interval length' );

      const currentInterval = this._vibrationPattern[ this._currentIntervalIndex ];
      if ( this._timeRunningCurrentInterval > currentInterval ) {

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

tappi.register( 'vibrationManager', vibrationManager );
export default vibrationManager;