import { FONT_WEIGHT, GUTTER } from 'src/styles';
import styled from 'styled-components';

export const FileContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: ${GUTTER};

  svg {
    height: 3em;
    width: 3em;
    display: block;
  }
`;
export const FileIconContainer = styled.a`
  text-decoration: none;
  color: inherit;
  height: 3em;
  width: 3em;
`;

export const FileTextContainer = styled.span`
  display: flex;
  flex-direction: column;
`;

export const FileName = styled.strong`
  display: block;
  font-weight: ${FONT_WEIGHT.bold};
`;

export const DownloadLink = styled.a`
  display: block;
  color: inherit;
  text-transform: capitalize;

  svg {
    height: 1em;
    width: 1em;
    display: inline-block;
    box-sizing: content-box;
    padding-left: 0.1em;
    padding-bottom: 1px;
    vertical-align: text-bottom;
  }
`;
