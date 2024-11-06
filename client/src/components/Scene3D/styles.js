import styled from 'styled-components';

export const SceneContainer = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  overflow: hidden;
  z-index: -1;
  

  @media (prefers-reduced-motion: reduce) {
    background-color: #f3f3f3;
    * {
      display: none;
    }
  }
`;
