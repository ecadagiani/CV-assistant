/* eslint-disable react/no-unknown-property */
import {
  Plane,
} from '@react-three/drei';
import PropTypes from 'prop-types';

function Ground({
  groundLevel = -0.5,
  groundSize = 500,
  color = 'white',
}) {
  return (
    <>
      <Plane
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, groundLevel, 0]}
        args={[groundSize, groundSize, groundSize]}
        receiveShadow
        renderOrder={100000}
      >
        <meshStandardMaterial color={color} roughness={1} />
      </Plane>
      <Plane
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, groundLevel, 0]}
        args={[groundSize, groundSize, groundSize]}
        receiveShadow
        renderOrder={100000}
      >
        <shadowMaterial
          transparent
          color="#251005"
          opacity={0.25}
        />
      </Plane>
    </>
  );
}

Ground.propTypes = {
  groundLevel: PropTypes.number,
  groundSize: PropTypes.number,
  color: PropTypes.string,
};

export default Ground;
