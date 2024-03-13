function ballCollide(ball1, ball2) {
  // Calculate the distance between the balls
  var dx = ball1.x - ball2.x;
  var dy = ball1.y - ball2.y;
  var distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the angle of the collision
  var angle = Math.atan2(dy, dx);

  // Calculate the components of the velocity of each ball
  var velocity1 = Math.sqrt(ball1.dx * ball1.dx + ball1.dy * ball1.dy);
  var velocity2 = Math.sqrt(ball2.dx * ball2.dx + ball2.dy * ball2.dy);

  // Calculate the direction of each ball
  var direction1 = Math.atan2(ball1.dy, ball1.dx);
  var direction2 = Math.atan2(ball2.dy, ball2.dx);

  // Calculate the new velocity of each ball
  var velocity1x = velocity1 * Math.cos(direction1 - angle);
  var velocity1y = velocity1 * Math.sin(direction1 - angle);
  var velocity2x = velocity2 * Math.cos(direction2 - angle);
  var velocity2y = velocity2 * Math.sin(direction2 - angle);

  // The final velocities after collision are calculated considering the mass and elasticity
  var finalVelocity1x = ((ball1.weight - ball2.weight) * velocity1x + 2 * ball2.weight * velocity2x) / (ball1.weight + ball2.weight) * ball1.elasticity;
  var finalVelocity2x = ((ball2.weight - ball1.weight) * velocity2x + 2 * ball1.weight * velocity1x) / (ball1.weight + ball2.weight) * ball2.elasticity;

  // Convert velocities back to vectors
  ball1.dx = Math.cos(angle) * finalVelocity1x + Math.cos(angle + Math.PI/2) * velocity1y;
  ball1.dy = Math.sin(angle) * finalVelocity1x + Math.sin(angle + Math.PI/2) * velocity1y;
  ball2.dx = Math.cos(angle) * finalVelocity2x + Math.cos(angle + Math.PI/2) * velocity2y;
  ball2.dy = Math.sin(angle) * finalVelocity2x + Math.sin(angle + Math.PI/2) * velocity2y;

  if (distance < ball1.radius + ball2.radius) {
      var overlap = ball1.radius + ball2.radius - distance;
      var angle = Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);
      ball1.x -= overlap * Math.cos(angle) / 2;
      ball1.y -= overlap * Math.sin(angle) / 2;
      ball2.x += overlap * Math.cos(angle) / 2;
      ball2.y += overlap * Math.sin(angle) / 2;
  } else {
      // If balls are not overlapping, they should not be moving towards each other
      var relativeVelocityX = ball2.dx - ball1.dx;
      var relativeVelocityY = ball2.dy - ball1.dy;
      var relativeVelocityDotProduct = dx * relativeVelocityX + dy * relativeVelocityY;
      if (relativeVelocityDotProduct > 0) {
          return;  // Balls are moving apart, not colliding
      }
  }
}