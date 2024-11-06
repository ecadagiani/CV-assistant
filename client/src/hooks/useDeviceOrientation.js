import { useEffect, useState } from 'react';
import { useMobile } from './useDevice';

function useDeviceOrientation() {
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const isPhone = useMobile();

  useEffect(() => {
    const handleOrientation = (event) => {
      setDeviceOrientation({
        alpha: event.alpha || 0, // Z axis (0 to 360)
        beta: event.beta || 0, // X axis (-180 to 180)
        gamma: event.gamma || 0, // Y axis (-90 to 90)
      });
    };

    if (isPhone) {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ requires user permission
        DeviceOrientationEvent.requestPermission()
          .then((permissionState) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        // Non iOS 13+ devices
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isPhone]);

  return { deviceOrientation, isPhone };
}

export default useDeviceOrientation;
