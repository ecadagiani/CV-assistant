export const GUTTER = '0.8em';
export const TIMELINE_WIDTH = '800px';
export const TIMELINE_GAP = `calc(${GUTTER} * 1.4)`;

export const ZINDEX = {
  bottomContainer: 99,
  modalOverlay: 100,
};

export const DEVICE_SIZE = {
  mobile: 320,
  tablet: 768,
  laptop: 992,
  desktop: 1200,
};

export const DEVICE = {
  mobile: `(min-width: ${DEVICE_SIZE.mobile}px)`,
  tablet: `(min-width: ${DEVICE_SIZE.tablet}px)`,
  laptop: `(min-width: ${DEVICE_SIZE.laptop}px)`,
  desktop: `(min-width: ${DEVICE_SIZE.desktop}px)`,
};

export const FONT_FAMILY = 'Roboto, sans-serif';

export const FONT_WEIGHT = {
  thin: 100,
  light: 300,
  regular: 400,
  bold: 700,
};

export const FONT_SIZE = {
  extraSmall: '0.65rem',
  small: '0.8rem',
  medium: '1rem',
  large: '1.2rem',
};

const elevationShadowColor = '0deg 0% 78%';
export const SHADOWS = {
  small: '-4px 4px 30px 0px rgba(0, 0, 0, 0.1)',
  medium: '-4px 4px 20px 0px rgba(0, 0, 0, 0.1)',
  large: '-4px 4px 20px 00px rgba(0, 0, 0, 0.15)',
  dropShadow: {
    small: `
      drop-shadow(-4px 4px 30px 0px rgba(0, 0, 0, 0.1))
    `,
  },
  elevations: {
  // Created from https://www.joshwcomeau.com/shadow-palette/
  // Oomph 0.05 / crispy: 0.40 / Light Position: 1,1 / backgroundColor: #fff / resolution: 0.70
    small: `
    -0.2px 0.2px 0.3px hsl(${elevationShadowColor} / 0.15),
    -0.3px 0.3px 0.5px -1px hsl(${elevationShadowColor} / 0.17),
    -0.7px 0.6px 1.1px -2px hsl(${elevationShadowColor} / 0.2);
  `,
    medium: `
    -0.2px 0.2px 0.3px hsl(${elevationShadowColor} / 0.15),
    -0.6px 0.6px 1px -0.7px hsl(${elevationShadowColor} / 0.17),
    -1.4px 1.4px 2.4px -1.3px hsl(${elevationShadowColor} / 0.19),
    -3.3px 3.2px 5.5px -2px hsl(${elevationShadowColor} / 0.21);
  `,
    large: `
    -0.2px 0.2px 0.3px hsl(${elevationShadowColor} / 0.14),
    -0.9px 0.9px 1.5px -0.3px hsl(${elevationShadowColor} / 0.15),
    -1.5px 1.5px 2.5px -0.6px hsl(${elevationShadowColor} / 0.16),
    -2.4px 2.3px 4px -0.9px hsl(${elevationShadowColor} / 0.17),
    -3.6px 3.6px 6.1px -1.1px hsl(${elevationShadowColor} / 0.18),
    -5.5px 5.3px 9.2px -1.4px hsl(${elevationShadowColor} / 0.19),
    -8.1px 7.9px 13.6px -1.7px hsl(${elevationShadowColor} / 0.2),
    -11.7px 11.5px 19.7px -2px hsl(${elevationShadowColor} / 0.21);
  `,
    inset: `
    inset 0.2px 0.15px 0.3px hsl(${elevationShadowColor} / 0.23),
    inset 0.8px 0.55px 1.2px -0.3px hsl(${elevationShadowColor} / 0.29),
    inset 1.8px 1.3px 2.75px -0.55px hsl(${elevationShadowColor} / 0.34),
    inset 4.1px 2.95px 6.3px -0.85px hsl(${elevationShadowColor} / 0.4)
  `,
  },
};

export const BORDER_RADIUS = {
  small: '5px',
  medium: '10px',
  large: '15px',
};

export function getBaseFontSize() {
  const measure = document.createElement('div');
  measure.style.height = '10em';
  document.body.appendChild(measure);
  const baseFontSize = measure.offsetHeight / 10;
  document.body.removeChild(measure);
  return baseFontSize;
}
