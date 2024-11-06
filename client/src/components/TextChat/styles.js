import { GUTTER } from 'src/styles';
import { buttonStyle } from 'src/styles/base/button';
import { colors } from 'src/styles/colors';
import styled from 'styled-components';

export const TextContainer = styled.div`
  blockquote {
    padding-left: ${GUTTER};
    display: flex; // to avoid a strange space in top and bottom
    flex-direction: column;

    p {
      border-left: 1px solid rgba(0, 0, 0, 0.3);
      padding-left: calc(${GUTTER} / 2);
      flex-grow: 1;
    }
  }
  h1 {
    padding-top: calc(${GUTTER} * 0.8);
    padding-bottom: calc(${GUTTER} * 0.6);
  }
  h2 {
    padding-top: calc(${GUTTER} * 0.8);
    padding-bottom: calc(${GUTTER} * 0.6);
  }
  h3 {
    padding-top: calc(${GUTTER} * 0.6);
    padding-bottom: calc(${GUTTER} * 0.4);
  }
  h4 {
    padding-top: calc(${GUTTER} * 0.4);
    padding-bottom: calc(${GUTTER} * 0.2);
  }
`;

export const IntentLinkButton = styled.button`
  ${buttonStyle}
  color: ${colors.system.link};
  text-decoration: underline;
  text-decoration-color: ${colors.system.linkUnderline};
  padding: 0;
`;
