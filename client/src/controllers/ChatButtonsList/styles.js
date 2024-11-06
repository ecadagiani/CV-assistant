import {
  DEVICE, GUTTER,
  SHADOWS,
} from 'src/styles';
import { buttonStyle } from 'src/styles/base/button';
import styled from 'styled-components';

export const ButtonContainer = styled.div`
  display: flex;
  gap: ${GUTTER};
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  overflow-x: auto;

  // for shadow to escape from the container
  margin: -20px -20px;
  padding: 20px 20px calc(20px + ${GUTTER}) 20px;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;  

  @media ${DEVICE.tablet}{
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
  }

`;

export const Button = styled.button`
  ${buttonStyle}
  display: block;
  background-color: #fff;
  border-radius: 1.5rem;
  padding-top: calc(${GUTTER} * 0.6);
  padding-bottom: calc(${GUTTER} * 0.6);
  padding-left: calc(${GUTTER} * 1.2);
  padding-right: calc(${GUTTER} * 1.2);
  box-shadow: ${SHADOWS.medium};
  white-space: nowrap;

  &:hover:not(:disabled) {
    box-shadow: ${SHADOWS.large};
  }

  &:disabled {
    cursor: not-allowed;
  }

  ${({ theme }) => theme.isBigFont && `
    &:not(:first-child) {
      display: none;
    }
  `}
`;
