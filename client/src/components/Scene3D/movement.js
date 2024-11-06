import { random } from 'lodash';
import { Vector3 } from 'three';

export function getMetaBallEdges(metaBallSize, edges) {
  const radius = metaBallSize / 2;
  return {
    min: new Vector3(edges.x.min + radius, edges.y.min + radius, edges.z.min + radius),
    max: new Vector3(edges.x.max - radius, edges.y.max - radius, edges.z.max - radius),
  };
}

export function calculateCenteringVector(position, direction, options) {
  const directionToCenter = options.center.clone().sub(position);
  const distanceToCenter = position.distanceTo(options.center);
  // strong when far, weak when close, weak when moving towards, strong when moving away. (angle=0 if aligned, 0.5 if perpendicular, 1 if opposite)
  const centeringForce = (distanceToCenter * options.centeringForce) * (direction.angleTo(directionToCenter) / Math.PI);
  return directionToCenter.normalize().multiplyScalar(centeringForce);
}

export function getInitialMetaBallMovement(metaBallSize, spawnMode, options) {
  const edges = getMetaBallEdges(metaBallSize, options.edges);
  let position;
  let direction;
  switch (spawnMode) {
    case 'outside': {
      position = new Vector3(
        random(0, 1, false)
          ? random(edges.min.x - metaBallSize, edges.min.x, true) : random(edges.max.x, edges.max.x + metaBallSize, true),
        random(0, 1, false)
          ? random(edges.min.y - metaBallSize, edges.min.y, true) : random(edges.max.y, edges.max.y + metaBallSize, true),
        random(0, 1, false)
          ? random(edges.min.z - metaBallSize, edges.min.z, true) : random(edges.max.z, edges.max.z + metaBallSize, true),
      );
      direction = calculateCenteringVector(position, new Vector3(0, 0, 0), options);
      direction.normalize().multiplyScalar(options.speed);
      break;
    }
    case 'center': {
      position = new Vector3(
        random(options.center.x - 0.001, options.center.x + 0.001, true),
        random(options.center.y - 0.001, options.center.y + 0.001, true),
        random(options.center.z - 0.001, options.center.z + 0.001, true),
      );
      direction = new Vector3(
        random(-1, 1, true),
        random(-1, 1, true),
        random(-1, 1, true),
      );
      direction.normalize().multiplyScalar(options.speed);
      break;
    }
    case 'inside':
    default: {
      position = new Vector3(
        random(edges.min.x, edges.max.x),
        random(edges.min.y, edges.max.y),
        random(edges.min.z, edges.max.z),
      );
      direction = new Vector3(
        random(-1, 1, true),
        random(-1, 1, true),
        random(-1, 1, true),
      );
      direction.normalize().multiplyScalar(options.speed);
      break;
    }
  }

  return {
    position,
    direction,
  };
}

export function calculateEdgeRepulsionVector(position, direction, edges, options) {
  const calculateAxisRepulsion = (distToMin, distToMax) => {
    let repulsion = 0;
    if (distToMin < options.edgeDistanceThreshold) {
      repulsion += options.edgeRepulsionForce * (1 - distToMin / options.edgeDistanceThreshold);
    }
    if (distToMax < options.edgeDistanceThreshold) {
      repulsion -= options.edgeRepulsionForce * (1 - distToMax / options.edgeDistanceThreshold);
    }
    return repulsion;
  };

  // Calculate distances to each boundary
  const distMin = position.clone().sub(edges.min);
  const distMax = edges.max.clone().sub(position);

  // Apply repulsion force for each axis
  return new Vector3(
    calculateAxisRepulsion(distMin.x, distMax.x),
    calculateAxisRepulsion(distMin.y, distMax.y),
    calculateAxisRepulsion(distMin.z, distMax.z),
  );
}

export function calculateNoiseVector(time, index, options) {
  return new Vector3(
    Math.sin(time * 0.5 + index) * 0.8,
    Math.cos(time * 0.3 + index * 2),
    Math.sin(time * 0.4 + index * 3) * 0.8,
  ).multiplyScalar(options.noiseScale);
}

/**
 * Calculates the repulsion vector between the current meta ball and other meta balls in the scene.
 * @param {Vector3} position - The position of the current meta ball.
 * @param {number} size - The size of the current meta ball.
 * @param {Object[]} otherBalls - The other meta balls in the scene.
 * @param {Vector3} otherBalls[].position - The position of the other meta ball.
 * @param {Vector3} otherBalls[].direction - The direction of the other meta ball.
 * @param {number} otherBalls[].size - The size of the other meta ball.
 * @param {Object} options - The options for calculating the movement.
 * @param {number} options.bounceForce - Force to bounce the meta ball.
 * @param {number} options.bounceThreshold - Distance between balls to bounce.
 * @returns {Vector3} - The repulsion vector between the current meta ball and other meta balls.
 */
export function calculateOtherBallsRepulsionVector(position, size, otherBalls, options) {
  const repulsion = new Vector3();

  otherBalls.forEach((ball) => {
    const distance = position.distanceTo(ball.position);
    if (distance <= (options.bounceThreshold + size + ball.size)) {
      // Repulsion force is stronger when closer, and when the balls are bigger, but weaker when we have many balls
      const repulsionForce = (((size + ball.size) / distance) * options.bounceForce) / otherBalls.length;
      const reverseDirectionToBall = position.clone().sub(ball.position).normalize();
      repulsion.add(reverseDirectionToBall.multiplyScalar(repulsionForce));
    }
  });
  return repulsion;
}

/**
 * Calculates the movement of a meta ball in a 3D scene.
 * @param {Object} args - The args for calculating the movement.
 * @param {Vector3} args.position - The current position of the meta ball.
 * @param {Vector3} args.direction - The current direction of the meta ball.
 * @param {number} args.size - The size of the meta ball.
 * @param {number} args.time - The time factor for calculating the movement.
 * @param {number} args.index - The index of the meta ball.
 * @param {Object} args.ballBounds - The bounds of the meta ball.
 * @param {Object[]} args.otherBalls - The other meta balls in the scene.
 * @param {Vector3} args.otherBalls[].position - The position of the other meta ball.
 * @param {Vector3} args.otherBalls[].direction - The direction of the other meta ball.
 * @param {number} args.otherBalls[].size - The size of the other meta ball.
 * @param {Object} options - The options for calculating the movement.
 * @param {boolean} options.clampToEdges - Whether to clamp the meta ball to the edges of the scene.
 * @param {number} options.centeringForce - Force to center the meta ball.
 * @param {Vector3} options.center - position of center.
 * @param {number} options.bounceForce - Force to bounce the meta ball.
 * @param {number} options.bounceThreshold - Distance between balls to bounce.
 * @param {number} options.noiseScale - Scale of the noise.
 * @param {number} options.edgeRepulsionForce - Force to repulse the meta ball from the edges.
 * @param {number} options.edgeDistanceThreshold - Distance to the edges to repulse.
 * @param {number} options.speed - Speed of the meta ball.
 * @param {number} options.directionChangeThreshold - To avoid drastic direction changement, minimum to angle to smooth direction change. 0-1
 * @param {number} options.directionSmoothingFactor - Factor to smooth direction change 0-1
 * @param {Object} options.edges - The edges of the scene.
 * @returns {Object} - The new position and direction of the meta ball.
 * @property {Object} position - The new position of the meta ball.
 * @property {number} position.x - The x-coordinate of the new position.
 * @property {number} position.y - The y-coordinate of the new position.
 * @property {number} position.z - The z-coordinate of the new position.
 * @property {Object} direction - The new direction of the meta ball.
 * @property {number} direction.x - The x-coordinate of the new direction.
 * @property {number} direction.y - The y-coordinate of the new direction.
 * @property {number} direction.z - The z-coordinate of the new direction.
 * @property {Object} edges - The edges of the scene.
 * @property {Object} edges.min - The minimum edges of the scene.
 * @property {number} edges.min.x - The minimum x-coordinate of the scene.
 * @property {number} edges.min.y - The minimum y-coordinate of the scene.
 * @property {number} edges.min.z - The minimum z-coordinate of the scene.
 * @property {Object} edges.max - The maximum edges of the scene.
 * @property {number} edges.max.x - The maximum x-coordinate of the scene.
 * @property {number} edges.max.y - The maximum y-coordinate of the scene.
 * @property {number} edges.max.z - The maximum z-coordinate of the scene.
 */
export function calculateMetaBallMovement({
  position, // Vector3
  direction, // Vector3
  size,
  time,
  index,
  otherBalls, // [{ position, direction, size }]
}, options) {
  const edges = getMetaBallEdges(size, options.edges);
  const newPosition = position.clone();
  const newDirection = direction.clone();

  const noiseVector = calculateNoiseVector(time, index, options);
  const centeringVector = calculateCenteringVector(position, direction, options);
  const otherBallsRepulsion = calculateOtherBallsRepulsionVector(position, size, otherBalls, options);
  const edgeForce = calculateEdgeRepulsionVector(newPosition, direction, edges, options);

  newDirection.add(noiseVector);
  newDirection.add(centeringVector);
  newDirection.add(otherBallsRepulsion);
  newDirection.add(edgeForce);

  // Calculate angle from previous direction (angle=0 if aligned, 0.5 if perpendicular, 1 if opposite)
  const angleFromPrevious = newDirection.angleTo(direction) / Math.PI;

  // If the change in direction is too drastic, smooth it out
  if (angleFromPrevious > options.directionChangeThreshold) {
    newDirection.normalize().lerp(direction, options.directionSmoothingFactor);
  }
  // normalize the direction (to put to 1 length), and multiply by the speed. To have a constant speed
  newDirection.normalize().multiplyScalar(options.speed);

  // move the ball througt the direction vector
  newPosition.add(newDirection);

  // security check for the EDGES
  if (options.clampToEdges) newPosition.clamp(edges.min, edges.max);

  return {
    position: newPosition,
    direction: newDirection,
  };
}
