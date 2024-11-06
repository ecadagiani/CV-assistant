import PropTypes from 'prop-types';
import { Tooltip as RTooltip } from 'react-tooltip';
import { FONT_SIZE, SHADOWS } from 'src/styles';

function Tooltip({
  id,
  content,
  style,
  children,
  ...rest
}) {
  return (
    <RTooltip
      id={id}
      content={content}
      style={{
        boxShadow: SHADOWS.large,
        fontSize: FONT_SIZE.small,
        zIndex: 1000,
        maxWidth: '80vw',
        ...style,
      }}
      {...rest}
    >
      {children}
    </RTooltip>
  );
}

Tooltip.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  children: PropTypes.node,
};

export default Tooltip;
