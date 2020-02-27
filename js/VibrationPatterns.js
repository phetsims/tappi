// Copyright 2019, University of Colorado Boulder

/**
 * Collection of reusable patterns that may be useful with vibrationManager. For example, try
 * vibrationManager.startVibrate( VibrationPatterns.FLUTTER )
 *
 * @author Jesse Greenberg
 */

import tappi from './tappi.js';

// constants

const VibrationPatterns = {

  // frequency patterns
  HZ_2_5: [ 200, 200 ],
  HZ_5: [ 100, 100 ],
  HZ_10: [ 50, 50 ],
  HZ_25: [ 25, 25 ],

  // default vibration, no pattern
  MOTOR_CALL: null,

  // these patterns are faster than 60 fps and will not appear or work well
  HZ_50: [ 10, 10 ],
  HZ_100: [ 5, 5 ],

  // effects pattens
  QUICK_BALL_ROLL: [ 70, 100 ],
  SLOW_BALL_ROLL: [ 700, 300 ],
  FLUTTER: [ 10, 10, 10, 10, 10, 20, 10, 20, 10, 20, 10, 20, 10, 20, 10, 50, 10, 50, 10, 50, 10, 50, 10, 50, 10, 70, 10, 70, 10, 70, 10 ],
  SLOW_DOWN: [ 70, 300, 70, 400, 100, 500, 200, 500 ],
  HEARTBEAT: [ 100, 100, 150, 1000 ],
  QUICK_HEARTBEAT: [ 50, 50, 100, 700 ]
};

tappi.register( 'VibrationPatterns', VibrationPatterns );
export default VibrationPatterns;