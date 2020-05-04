// Copyright 2020, University of Colorado Boulder

import Utils from '../../dot/js/Utils.js';
import tappi from './tappi.js';

class VibrationManageriOS {
  constructor() {
    this.vibrationMessageHandlers = window.webkit && window.webkit.messageHandlers;
  }

  vibrate( seconds ) {
    assert && assert( typeof seconds === 'number', 'seconds should be a number' );

    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateMessageHandler ) {
      this.vibrationMessageHandlers.vibrateMessageHandler.postMessage( { duration: seconds } );
    }
  }

  vibrateForever() {

    if ( this.vibrationMessageHandlers
         && this.vibrationMessageHandlers.vibrateForeverMessageHandler ) {
      window.webkit.messageHandlers.vibrateForeverMessageHandler.postMessage(
        {}
      );
    }
  }

  vibrateAtFrequency( seconds, frequency ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyMessageHandler ) {
      window.webkit.messageHandlers.vibrateFrequencyMessageHandler.postMessage(
        { duration: seconds, frequency: frequency }
      );
    }
  }


  /**
   * Vibrate at the desired frequency.
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

  vibrateWithCustomPattern( vibrationPattern, seconds, loopForever ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternMessageHandler ) {
      window.webkit.messageHandlers.vibrateWithCustomPatternMessageHandler.postMessage( {
        vibrationPattern: vibrationPattern,
        duration: seconds,
        loopForever: loopForever
      } );
    }
  }

  vibrateWithCustomPatternDuration( vibrationPattern, seconds ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternDurationMessageHandler ) {
      window.webkit.messageHandlers.vibrateWithCustomPatternDurationMessageHandler.postMessage( {
        vibrationPattern: vibrationPattern,
        duration: seconds
      } );
    }
  }

  vibrateWithCustomPatternForever( vibrationPattern ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateWithCustomPatternForeverMessageHandler ) {
      window.webkit.messageHandlers.vibrateWithCustomPatternForeverMessageHandler.postMessage( { vibrationPattern: vibrationPattern } );
    }
  }

  /**
   * Sets the intenstiy of the current vibration. No effect if there is no active vibration
   * @param intensity
   */
  setVibrationIntensity( intensity ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrationIntensityMessageHandler ) {
      window.webkit.messageHandlers.vibrationIntensityMessageHandler.postMessage( { intensity: intensity } );
    }
  }


  stop() {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.stopMessageHandler ) {
      window.webkit.messageHandlers.stopMessageHandler.postMessage(
        {}
      );
    }
  }

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