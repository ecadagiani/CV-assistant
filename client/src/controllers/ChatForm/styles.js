import styled, { css } from 'styled-components';

export const FormContainer = styled.div`
  position: relative;
  min-height: 2rem;
`;

export const FormTransitionContainer = styled.div`
  ${({ $isSelected }) => (
    $isSelected ? css`
        position: relative;`
      : css`
        position: absolute;
        bottom: 0;
        width: 100%;
      `
  )};

  @media (prefers-reduced-motion: no-preference) {
    &.transition-enter{
      transition: all 400ms cubic-bezier(0.15, 0.59, 0.3, 1);
    }
    &.transition-enterFrom{
      opacity: 0;
      transform: translate(20%, 0);
    }
    &.transition-enterTo{
      opacity: 1;
      transform: translate(0, 0);
    }
    &.transition-leave{
      transition: all 200ms cubic-bezier(0.15, 0.59, 0.3, 1);
    }
    &.transition-leaveFrom{
      opacity: 1;
      transform: translate(0, 0);
    }
    &.transition-leaveTo{
      opacity: 0;
      transform: translate(-20%, 0);
    }
  }
`;
