import Color from 'color';

export const colors = { // https://colorbase.app/tools/generator?color=70c2ad&tab=gray
  teal: new Color('hsla(165, 40%, 60%, 1)').hex(),
  red: new Color('hsla(1, 40%, 60%, 1)').hex(),
  orange: new Color('hsla(56, 40%, 60%, 1)').hex(),
  yellow: new Color('hsla(46, 80%, 48%, 1)').hex(),
  lime: new Color('hsla(93, 40%, 60%, 1)').hex(),
  green: new Color('hsla(129, 40%, 60%, 1)').hex(),
  blue: new Color('hsla(236, 40%, 60%, 1)').hex(),
  indigo: new Color('hsla(200, 40%, 60%, 1)').hex(),
  purple: new Color('hsla(273, 40%, 60%, 1)').hex(),
  pink: new Color('hsla(345, 40%, 60%, 1)').hex(),
  white: new Color('hsla(150, 10%, 96%, 1)').hex(),
  grey1: new Color('hsla(163, 11%, 88%, 1)').hex(),
  grey2: new Color('hsla(163, 13%, 78%, 1)').hex(),
  grey3: new Color('hsla(166, 12%, 64%, 1)').hex(),
  grey4: new Color('hsla(165, 12%, 55%, 1)').hex(),
  grey5: new Color('hsla(162, 12%, 44%, 1)').hex(),
  system: {
    bubble: '#fff',
    bubbleContainer: 'hsl(0deg 0% 97%)',
    textBackground: '#fff',
    text: '#000',
    link: 'rgba(25, 118, 210, 1)',
    linkUnderline: 'rgba(25, 118, 210, 0.4)',
    submitButton: 'hsla(166, 12%, 64%, 1)',
    warningText: 'hsla(1, 100%, 60%, 1)',
  },
};

export function applyColor(color) {
  if (color.startsWith('colors.') && color.split('.').length >= 1) {
    const colorPath = color.split('.');
    return colors[colorPath[1]];
  }
  return color;
}
