/* eslint-disable react/no-unknown-property */
import {
  Bounds,
  Environment,
  PerspectiveCamera,
} from '@react-three/drei';
import {
  Canvas,
} from '@react-three/fiber';
import { useErrorBoundary } from 'use-error-boundary';

import Color from 'color';
import { useEffect, useMemo, useState } from 'react';
import { MAX_META_BALL, RESPONSE_TYPE } from 'src/constants';
import { useEventChatReceiveMessage, useEventChatReset, useEventChatStart } from 'src/services/event';
import { colors } from 'src/styles/colors';
import CameraController from './CameraController';
import Ground from './Ground';
import LavaLamp from './LavaLamp';
import LavaLamp2D from './LavaLamp2D';
import Lights from './Lights';
import { SceneContainer } from './styles';

const getMetaBallColor = (index) => (new Color(colors.teal)).rotate(Math.cos(index) * 15).hex();

function getSkyBackgroundColor(date = new Date()) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const time = hours + (minutes / 60);

  // Define color stops for different times of day
  const colorStops = [
    { time: 0, color: new Color('hsla(20, 90%, 96%, 1)') }, // Night: very light red
    { time: 6, color: new Color('hsla(200, 90%, 97%, 1)') }, // Morning: very light warm white
    { time: 12, color: new Color('hsla(200, 100%, 99%, 1)') }, // Noon: very light blue-white
    { time: 20, color: new Color('hsla(25, 100%, 97%, 1)') }, // Dusk: very light peach
    { time: 24, color: new Color('hsla(20, 90%, 96%, 1)') }, // Night: (same as 0)
  ];

  // Find the two color stops to interpolate between
  const lowerIndex = colorStops.findIndex((stop) => stop.time > time) - 1;

  const lowerStop = colorStops[lowerIndex];
  const upperStop = colorStops[lowerIndex + 1];

  // Calculate the interpolation factor
  const factor = (time - lowerStop.time) / (upperStop.time - lowerStop.time);

  // Interpolate between the two colors
  const resultColor = lowerStop.color.mix(upperStop.color, factor);

  // Return the color as an rgba string
  return resultColor.hex();
}

function Scene3D() {
  const { ErrorBoundary, didCatch, error } = useErrorBoundary();
  const [metaBalls, setMetaBalls] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState(getSkyBackgroundColor());

  useEventChatStart((data) => {
    const botMessageLength = (data?.responses || []).filter((message) => message.type !== RESPONSE_TYPE.USER_MESSAGE).length;
    setMetaBalls(Array.from({ length: Math.min(botMessageLength, MAX_META_BALL) }, (_, i) => ({
      strength: 0.4,
      subtract: 15,
      color: getMetaBallColor(i),
      spawnMode: 'center',
    })));
  });

  useEventChatReset(() => {
    setMetaBalls([]);
  });

  useEventChatReceiveMessage((serverResponse) => {
    if (serverResponse.responses.length > 0) {
      setMetaBalls((prevMetaBalls) => {
        const ballsToAdd = Math.min(serverResponse.responses.length, MAX_META_BALL - prevMetaBalls.length);
        return [
          ...prevMetaBalls,
          ...Array.from({ length: ballsToAdd }, (_, i) => ({
            strength: 0.4,
            subtract: 15,
            color: getMetaBallColor(i + prevMetaBalls.length),
            spawnMode: 'outside',
          })),
        ];
      });
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundColor(getSkyBackgroundColor());
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  const balls2D = useMemo(() => metaBalls.map((ball, index) => ({
    size: Math.round(Math.abs(Math.cos(index)) * 200) + 100,
    color: getMetaBallColor(0),
    spawnMode: ball.spawnMode,
  })), [metaBalls]);

  return (
    <SceneContainer>
      {didCatch ? (
        <LavaLamp2D
          balls={balls2D}
          backgroundColor={backgroundColor}
        />
      ) : (
        <ErrorBoundary>
          <Canvas shadows dpr={[1, 1.5]}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={15} />
            <fog attach="fog" args={[backgroundColor, 5, 60]} />
            <color attach="background" args={[backgroundColor]} />
            <Environment
              files={`${import.meta.env.VITE_API_URL}/images/environment3d.hdr`}
            />
            <Lights color={backgroundColor} />
            <Ground color={backgroundColor} />
            <CameraController />
            <LavaLamp
              metaBalls={metaBalls}
              options={{
                clampToEdges: false,
              }}
              roughness={1}
            />
            <Bounds fit clip observe margin={1} maxDuration={0}>
              {/* zoom to fit the Lavalamp MarchingCube inside the bounds */}
              <mesh visible={false}>
                {/* simple box 1,1, same size than LavaLamp MarchingCube */}
                <boxGeometry />
              </mesh>
            </Bounds>
          </Canvas>
        </ErrorBoundary>
      )}
    </SceneContainer>
  );
}

export default Scene3D;
