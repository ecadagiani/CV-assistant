/* eslint-disable react/no-unknown-property */
import {
  useFrame, useThree,
} from '@react-three/fiber';
import PropTypes from 'prop-types';
import { useRef } from 'react';

import useDeviceOrientation from 'src/hooks/useDeviceOrientation';
import useEventListener from 'src/hooks/useEventListener';

function CameraController({
  pointerSensitivity = 0.1,
  gyroscopeSensitivity = 1,
}) {
  const { camera } = useThree();
  const initialPosition = useRef([0, 0, 5]);
  const { deviceOrientation, isPhone } = useDeviceOrientation();

  // use mouse position for camera movement, not three pointer because, the scene have a z-index=-1
  const mousePositionRef = useRef({ x: 0, y: 0 });
  useEventListener('mousemove', (event) => {
    mousePositionRef.current = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1,
    };
  }, document);

  useFrame(() => {
    // Camera movement on mouse or giroscope
    if (isPhone) {
      // Use gyroscope data for phone
      const { beta, gamma } = deviceOrientation;
      camera.position.x = initialPosition.current[0] + (gamma / 90) * gyroscopeSensitivity;
      camera.position.y = initialPosition.current[1] + (beta / 180) * gyroscopeSensitivity;
    } else {
      // Use mouse position for non-phone devices
      camera.position.x = initialPosition.current[0] + (mousePositionRef.current.x * pointerSensitivity);
      camera.position.y = initialPosition.current[1] + (mousePositionRef.current.y * pointerSensitivity);
    }
    camera.lookAt(0, 0, 0);
  });

  return null;
}

CameraController.propTypes = {
  pointerSensitivity: PropTypes.number,
  gyroscopeSensitivity: PropTypes.number,
};

export default CameraController;
