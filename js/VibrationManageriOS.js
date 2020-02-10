// Copyright 2020, University of Colorado Boulder

define( require => {
  'use strict';

  // modules
  const tappi = require( 'TAPPI/tappi' );


  class VibrationManageriOS {
    constructor() {
      this.vibrationMessageHandlers = window.webkit && window.webkit.messageHandlers;
    }

    vibrate(seconds){
      assert && assert (typeof seconds === 'number', 'seconds should be a number');

      if ( this.vibrationMessageHandlers && this.vibrationMessageHandlers.vibrateMessageHandler ) {
        this.vibrationMessageHandlers.vibrateMessageHandler.postMessage( { duration: seconds } );
      }
    }

    vibrateForever(){

      if ( this.vibrationmessageHandlers
        && this.vibrationMessageHandlers.vibrateForeverMessageHandler ){
          window.webkit.messageHandlers.vibrateForeverMessageHandler.postMessage(
        {}
      );}
    }

    vibrateAtFrequency(seconds, frequency){
      if ( this.vibrationmessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyMessageHandler ){
        window.webkit.messageHandlers.vibrateFrequencyMessageHandler.postMessage(
          { duration: seconds, frequency: frequency }
        );}
     }


    vibrateAtFrequencyForever(frequency){
      if ( this.vibrationmessageHandlers && this.vibrationMessageHandlers.vibrateFrequencyForeverMessageHandler ){
      window.webkit.messageHandlers.vibrateFrequencyForeverMessageHandler.postMessage(
          { frequency: frequency }
        );}
       }

    stop() {
      if ( this.vibrationmessageHandlers && this.vibrationMessageHandlers.stopMessageHandler ){
        window.webkit.messageHandlers.stopMessageHandler.postMessage(
          {}
        );}
      }
}

  return tappi.register( 'VibrationManageriOS', VibrationManageriOS );
} );
