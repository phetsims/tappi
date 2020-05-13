// Copyright 2020, University of Colorado Boulder

import Utils from '../../dot/js/Utils.js';
import tappi from './tappi.js';

class VibrationManageriOS {
  constructor() {

    // @private {Object} - message handlers for the Webkit window, only available in Safari.
    this.vibrationMessageHandlers = window.webkit && window.webkit.messageHandlers;
  }

  /**
   * Start a timed vibration for the provided time in seconds.
   * @public
   *
   * @param {number} seconds
   */
  vibrate( seconds ) {
    assert && assert( typeof seconds === 'number', 'seconds should be a number' );

    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateMessageHandler ) {
      this.vibrationMessageHandlers.vibrateMessageHandler.postMessage( { duration: seconds } );
    }
  }

  /**
   * Start a vibration that will continue forever.
   * @public
   */
  vibrateForever() {

    if ( this.vibrationMessageHandlers
         && this.vibrationMessageHandlers.vibrateForeverMessageHandler ) {
      window.webkit.messageHandlers.vibrateForeverMessageHandler.postMessage(
        {}
      );
    }
  }

  /**
   * Start a vibration for the provided duration, with a provided frequency.
   * @public
   *
   * @param {number} seconds - time in seconds
   * @param {number} frequency - in hertz
   */
  vibrateAtFrequency( seconds, frequency ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyMessageHandler ) {
      window.webkit.messageHandlers.vibrateFrequencyMessageHandler.postMessage(
        { duration: seconds, frequency: frequency }
      );
    }
  }


  /**
   * Vibrate at the desired frequency.
   * @public
   *
   * @param {number} frequency
   * @param {number} [intensity] - from 0 to 1
   */
  vibrateAtFrequencyForever( frequency, intensity ) {
    intensity = typeof intensity === 'number' ? intensity : 1;
    intensity = Utils.clamp( intensity, 0, 1 );
    this.debug( intensity + '' );

    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyForeverMessageHandler ) {
      window.webkit.messageHandlers.vibrateFrequencyForeverMessageHandler.postMessage(
        { frequency: frequency, intensity: intensity }
      );
    }
  }

  /**
   * Request a vibration with a custom pattern that loops forever.
   *
   * @public
   * @param {number[]} vibrationPattern - alternating values where even indicies are "on" time, odd indices are "off"
   * @param [number] seconds - time in seconds, how long to run the vibration
   * @param {boolean} loopForever - should this loop forever?
   */
  vibrateWithCustomPattern( vibrationPattern, seconds, loopForever ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternMessageHandler ) {
      window.webkit.messageHandlers.vibrateWithCustomPatternMessageHandler.postMessage( {
        vibrationPattern: vibrationPattern,
        duration: seconds,
        loopForever: loopForever
      } );
    }
  }

  /**
   * Vibrate with a custom pattern for the provided duration.
   * @public
   *
   * @param {number[]} vibrationPattern - alternative values where even indicies are "on" time and odd indicies are "off"
   * @param {number} seconds
   */
  vibrateWithCustomPatternDuration( vibrationPattern, seconds ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternDurationMessageHandler ) {
      window.webkit.messageHandlers.vibrateWithCustomPatternDurationMessageHandler.postMessage( {
        vibrationPattern: vibrationPattern,
        duration: seconds
      } );
    }
  }

  /**
   * Vibrate with a custom pattern forever.
   * @public
   * @param {number[]} vibrationPattern - alternating values of "on" and "off" time, starting with "on" time.
   */
  vibrateWithCustomPatternForever( vibrationPattern ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternForeverMessageHandler ) {
      window.webkit.messageHandlers.vibrateWithCustomPatternForeverMessageHandler.postMessage( { vibrationPattern: vibrationPattern } );
    }
  }

  /**
   * Sets the intenstiy of the current vibration. No effect if there is no active vibration.
   * @public
   * @param intensity
   */
  setVibrationIntensity( intensity ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrationIntensityMessageHandler ) {
      window.webkit.messageHandlers.vibrationIntensityMessageHandler.postMessage( { intensity: intensity } );
    }
  }

  /**
   * Stop any active vibration immediately.
   * @public
   */
  stop() {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.stopMessageHandler ) {
      window.webkit.messageHandlers.stopMessageHandler.postMessage(
        {}
      );
    }
  }

  /**
   * Send a debug message to the containing app that will be printed in the debugging tools.
   * @public
   *
   * @param {string} debugString
   */
  debug( debugString ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.debugMessageHandler ) {
      window.webkit.messageHandlers.debugMessageHandler.postMessage( {
        debugString: debugString
      } );
    }
  }
}

tappi.register( 'VibrationManageriOS', VibrationManageriOS );
export default VibrationManageriOS;