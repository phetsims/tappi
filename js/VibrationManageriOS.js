// Copyright 2020, University of Colorado Boulder


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


  vibrateAtFrequencyForever( frequency ) {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyForeverMessageHandler ) {
      window.webkit.messageHandlers.vibrateFrequencyForeverMessageHandler.postMessage(
        { frequency: frequency }
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


  stop() {
    if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.stopMessageHandler ) {
      window.webkit.messageHandlers.stopMessageHandler.postMessage(
        {}
      );
    }
  }
}

tappi.register( 'VibrationManageriOS', VibrationManageriOS );
export default VibrationManageriOS;