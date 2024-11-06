import PropTypes from 'prop-types';
import {
  memo, useEffect, useRef, useState,
} from 'react';
import styled, { keyframes } from 'styled-components';
import { Vector3 } from 'three';
import { calculateMetaBallMovement, getInitialMetaBallMovement } from './movement';

// largely inspired by https://github.com/404ryannotfound
// https://codepen.io/404ryannotfound/pen/gOpXpMM

const Container = styled.div`
  background: ${({ $background }) => $background};
  height:100%;
  width:100%;
`;

const LavaContainer = styled.div`
  filter: url("#goo");
  position:absolute;
  height:100%;
  width:100%;
  top:0;
  left:0;
`;

const wobbleAnimation = keyframes`
  50% {
   border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  }
  100% {
   border-radius: 38% 52% 75% 36% / 50% 40% 50% 60%;
  }
`;

const Blob = styled.div`
  border-radius: 50%;
  background: ${({ $color }) => $color};
  position: absolute;
  transform: translate(-50%, -50%);
  animation: ${wobbleAnimation} ${(props) => props.$wobbleSpeed}s ease-in-out alternate infinite;
`;

const defaultOptions = {
  clampToEdges: false,
  centeringForce: 0.000002,
  center: new Vector3(0.5, 0.5, 0.5),
  bounceForce: 1,
  bounceThreshold: 0.25,
  noiseScale: 0,
  edgeRepulsionForce: 0.01,
  edgeDistanceThreshold: 0.05,
  speed: 0.0002,
  directionChangeThreshold: 0.75,
  directionSmoothingFactor: 0.3,
  edges: {
    x: { min: 0, max: 1 },
    y: { min: 0, max: 1 },
    z: { min: 0, max: 1 },
  },
};

const Ball = memo(({
  size = 200,
  wobbleSpeed = 5,
  color = '#e8630a',
  spawnMode = 'center',
  index,
  coordinate,
  setCoordinates,
  ...rest
}) => {
  const timeRef = useRef(new Date().getTime());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCoordinates((prevCoordinates) => {
        const newCoordinates = [...prevCoordinates];
        const { position, direction } = prevCoordinates[index];

        if (!position || !direction) {
          const { position: newPosition, direction: newDirection } = getInitialMetaBallMovement(0, spawnMode, defaultOptions);
          newCoordinates[index] = {
            position: newPosition,
            direction: newDirection,
          };
          return newCoordinates;
        }

        const time = (new Date().getTime() - timeRef.current) / 1000;

        const otherBalls = prevCoordinates
          .filter((ball, i) => i !== index && ball.position && ball.direction)
          .map((ball) => ({
            position: ball.position,
            direction: ball.direction,
            size: 0,
          }));

        // update the position and direction of the ball
        const { position: newPosition, direction: newDirection } = calculateMetaBallMovement({
          position,
          direction,
          size: 0,
          time,
          index,
          otherBalls,
        }, defaultOptions);
        newCoordinates[index] = {
          position: newPosition,
          direction: newDirection,
        };
        return newCoordinates;
      });
    }, 10);
    return () => clearInterval(intervalId);
  }, [size, index, spawnMode, setCoordinates]);

  return (
    <Blob
      $wobbleSpeed={wobbleSpeed}
      $color={color}
      style={{
        width: size,
        height: size,
        left: `${(coordinate?.position?.x || 0) * 100}%`,
        top: `${[coordinate?.position?.y || 0] * 100}%`,
      }}
      {...rest}
    />
  );
});

Ball.propTypes = {
  size: PropTypes.number,
  wobbleSpeed: PropTypes.number,
  index: PropTypes.number,
  color: PropTypes.string,
  spawnMode: PropTypes.oneOf(['inside', 'outside', 'center']),
  coordinate: PropTypes.shape({
    position: PropTypes.instanceOf(Vector3),
    direction: PropTypes.instanceOf(Vector3),
  }),
  setCoordinates: PropTypes.func.isRequired,
};

function LavaLamp2D({
  balls = [
    {
      size: 200, color: 'indianred',
    },
    {
      size: 330, color: 'skyblue',
    },
  ],
  backgroundColor,
}) {
  const [coordinates, setCoordinates] = useState(balls.map(() => ({
    position: null,
    direction: null,
  })));

  useEffect(() => {
    setCoordinates((prevCoordinates) => {
      if (balls.length === prevCoordinates.length) {
        return prevCoordinates;
      } if (balls.length < prevCoordinates.length) {
        return prevCoordinates.slice(0, balls.length);
      }
      const newCoordinates = balls.map((ball, index) => {
        if (prevCoordinates[index]) {
          return prevCoordinates[index];
        }
        return {
          position: null,
          direction: null,
        };
      });
      return newCoordinates;
    });
  }, [balls]);

  return (
    <Container $background={backgroundColor}>
      <LavaContainer>
        {balls.map((ball, index) => (
          <Ball
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            index={index}
            setCoordinates={setCoordinates}
            coordinate={coordinates[index]}
            {...ball}
          />
        ))}
      </LavaContainer>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </Container>
  );
}

LavaLamp2D.propTypes = {
  balls: PropTypes.arrayOf(PropTypes.shape({
    color: PropTypes.string,
    wobbleSpeed: PropTypes.number,
    spawnMode: PropTypes.oneOf(['inside', 'outside', 'center']),
    size: PropTypes.number,
  })),
  backgroundColor: PropTypes.string,
};

export default LavaLamp2D;
