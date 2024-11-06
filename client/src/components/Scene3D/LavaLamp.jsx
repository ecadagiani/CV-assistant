/* eslint-disable react/no-unknown-property */
import { MarchingCube, MarchingCubes } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { defaults } from 'lodash';
import PropTypes from 'prop-types';
import React, {
  useEffect, useImperativeHandle, useMemo, useRef,
} from 'react';
import { useMobile } from 'src/hooks/useDevice';
import { Vector3 } from 'three';
import { calculateMetaBallMovement, getInitialMetaBallMovement } from './movement';

export const defaultOptions = {
  clampToEdges: true,
  centeringForce: 0.001,
  center: new Vector3(0, 0, 0),
  bounceForce: 0.01,
  bounceThreshold: -0.75,
  noiseScale: 0.005,
  edgeRepulsionForce: 0.05,
  edgeDistanceThreshold: 0.15,
  speed: 0.001,
  directionChangeThreshold: 0.75,
  directionSmoothingFactor: 0.3,
  edges: {
    x: { min: -0.85, max: 0.85 },
    y: { min: -0.6, max: 0.6 },
    z: { min: -0.85, max: 0.6 },
  },
};

const optionsPropTypes = PropTypes.shape({
  clampToEdges: PropTypes.bool,
  centeringForce: PropTypes.number,
  center: PropTypes.instanceOf(Vector3),
  bounceForce: PropTypes.number,
  bounceThreshold: PropTypes.number,
  noiseScale: PropTypes.number,
  edgeRepulsionForce: PropTypes.number,
  edgeDistanceThreshold: PropTypes.number,
  speed: PropTypes.number,
  directionChangeThreshold: PropTypes.number,
  directionSmoothingFactor: PropTypes.number,
  edges: PropTypes.shape({
    min: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number, z: PropTypes.number }),
    max: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number, z: PropTypes.number }),
  }),
});

export const MetaBall = React.forwardRef(({
  strength,
  subtract,
  color,
  spawnMode,
  index,
  childsRef,
  options: _options = undefined,
  ...rest
}, forwardRef) => {
  const marchingCubeRef = useRef();
  const directionRef = useRef();
  const isPositionInitializedRef = useRef(false);
  const options = useMemo(() => defaults({ ..._options }, defaultOptions), [_options]);

  useImperativeHandle(forwardRef, () => {
    marchingCubeRef.current.strength = strength;
    marchingCubeRef.current.directionRef = directionRef;
    return marchingCubeRef.current;
  }, [strength]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (!marchingCubeRef.current) return;

    // on first render, set the position and direction of the ball
    if (!isPositionInitializedRef.current) {
      const { position, direction } = getInitialMetaBallMovement(strength, spawnMode, options);
      marchingCubeRef.current.position.copy(position);
      // eslint-disable-next-line no-param-reassign
      directionRef.current = direction.clone();
      // eslint-disable-next-line no-param-reassign
      isPositionInitializedRef.current = true;
    }

    const otherBalls = (childsRef?.current || [])
      .filter((el) => el.uuid !== marchingCubeRef.current.uuid)
      .map((ball) => ({
        uuid: ball.uuid,
        position: ball.position,
        direction: ball.directionRef.current,
        size: ball.strength,
      }));

    // update the position and direction of the ball
    const { position, direction } = calculateMetaBallMovement({
      position: marchingCubeRef.current.position,
      direction: directionRef.current,
      size: strength,
      time,
      index,
      otherBalls,
    }, options);
    marchingCubeRef.current.position.copy(position);
    directionRef.current = direction.clone();
  });

  return (
    <MarchingCube
      ref={marchingCubeRef}
      strength={strength}
      subtract={subtract}
      color={color}
      {...rest}
    />
  );
});

MetaBall.propTypes = {
  strength: PropTypes.number,
  subtract: PropTypes.number,
  color: PropTypes.string,
  spawnMode: PropTypes.oneOf(['inside', 'outside', 'center']),
  index: PropTypes.number,
  childsRef: PropTypes.oneOfType([
    PropTypes.shape({ current: PropTypes.arrayOf(PropTypes.object) }),
    PropTypes.func,
  ]),
  options: optionsPropTypes,
};

function LavaLamp({
  metaBalls = [
    {
      strength: 0.4, subtract: 15, color: 'indianred', spawnMode: 'inside',
    },
    {
      strength: 0.4, subtract: 15, color: 'skyblue', spawnMode: 'inside',
    },
    {
      strength: 0.4, subtract: 15, color: 'teal', spawnMode: 'inside',
    },
  ],
  thickness = 0.15,
  roughness = 0.3,
  options,
}) {
  const isMobile = useMobile();

  const metaBallsRef = useRef([]);
  useEffect(() => {
    metaBallsRef.current = metaBallsRef.current.slice(0, metaBalls.length);
  }, [metaBalls]);

  return (
    <MarchingCubes
      castShadow
      receiveShadow
      resolution={isMobile ? 60 : 100}
      maxPolyCount={200000}
      enableUvs={false}
      enableColors
    >
      {metaBalls.map((metaBall, index) => (
        <MetaBall
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          index={index}
          strength={metaBall.strength}
          subtract={metaBall.subtract}
          color={metaBall.color}
          spawnMode={metaBall.spawnMode}
          ref={(el) => { metaBallsRef.current[index] = el; }}
          childsRef={metaBallsRef}
          options={options}
        />
      ))}
      <meshStandardMaterial fog vertexColors thickness={thickness} roughness={roughness} />
    </MarchingCubes>
  );
}

LavaLamp.propTypes = {
  metaBalls: PropTypes.arrayOf(PropTypes.shape({
    strength: PropTypes.number,
    subtract: PropTypes.number,
    color: PropTypes.string,
    spawnMode: PropTypes.oneOf(['inside', 'outside', 'center']),
  })),
  thickness: PropTypes.number,
  roughness: PropTypes.number,
  options: optionsPropTypes,
};
export default LavaLamp;
