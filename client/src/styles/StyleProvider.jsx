import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import useEventListener from 'src/hooks/useEventListener';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { FONT_FAMILY, FONT_SIZE } from '.';
import { colors } from './colors';

const GlobalStyle = createGlobalStyle`
  html {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  *, *:before, *:after {
    -webkit-box-sizing: inherit;
    -moz-box-sizing: inherit;
    box-sizing: inherit;
  }
  body {
    margin: 0;
    font-family: ${FONT_FAMILY};
    font-size: ${FONT_SIZE.medium};
    font-weight: 300;
    color: ${colors.system.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  :focus{
    outline: ${({ $isUsingKeyboard }) => ($isUsingKeyboard ? ' #08f auto 2px;' : 'none')}
  }
`;

function StyleProvider({ children }) {
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [isUsingKeyboard, setIsUsingKeyboard] = useState(false);
  useEventListener('mousedown', () => {
    setIsUsingKeyboard(false);
  });
  useEventListener('keydown', (event) => {
    if (event.keyCode === 9) {
      setIsUsingKeyboard(true);
    }
  });

  useEffect(() => {
    const measure = document.createElement('div');
    measure.style.height = '10em';
    document.body.appendChild(measure);
    setBaseFontSize(measure.offsetHeight / 10);
    document.body.removeChild(measure);
  }, []);
  const theme = useMemo(() => ({
    isUsingKeyboard,
    baseFontSize,
    isBigFont: baseFontSize >= 30,
  }), [isUsingKeyboard, baseFontSize]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle $isUsingKeyboard={isUsingKeyboard} />
      {children}
    </ThemeProvider>
  );
}

StyleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StyleProvider;
