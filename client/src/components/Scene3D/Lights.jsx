/* eslint-disable react/no-unknown-property */
import PropTypes from 'prop-types';

function Lights({
  color = '#fff',
}) {
  return (
    <>
      <ambientLight
        color={color}
        intensity={0.5}
      />
      <hemisphereLight
        color={color}
        intensity={0.2}
      />
      <spotLight
        color={color}
        penumbra={1}
        angle={1}
        castShadow
        position={[8, 8, 10]}
        intensity={8}
        shadow-mapSize={[512, 512]}
      />
    </>
  );
}

Lights.propTypes = {
  color: PropTypes.string,
};

export default Lights;
