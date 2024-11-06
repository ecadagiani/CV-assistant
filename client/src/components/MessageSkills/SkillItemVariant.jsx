import BPromise from 'bluebird';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { fadeSlide, horizontalShake } from 'src/styles/keyframes';
import styled, { css } from 'styled-components';

const FADE_ANIMATION_DELAY = 300;

const SkillItemVariantContainer = styled.div`
  animation: ${horizontalShake({ durationRatio: 0.5, shakeSize: '1px' })} 1s ease-in-out infinite;
  animation-direction: alternate;
  animation-play-state: ${({ $animationPaused }) => ($animationPaused ? 'paused' : 'running')};
  cursor: pointer;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SkillItemVariantContent = styled.div`
  display: ${({ $display }) => ($display ? 'block' : 'none')};
  animation: ${({ $fadeIn, $fadeOut }) => {
    if ($fadeIn) {
      return css`${fadeSlide({ direction: 'left' })} ${FADE_ANIMATION_DELAY}ms ease-in-out forwards normal`;
    }
    if ($fadeOut) {
      return css`${fadeSlide({ direction: 'right' })} ${FADE_ANIMATION_DELAY}ms ease-in-out forwards reverse`;
    }
    return 'none';
  }};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

function SkillItemVariant({
  item, variant,
}) {
  const [displayVariant, setDisplayVariant] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const handleToggle = async () => {
    if (fadeOut || fadeIn) return;
    const willDisplayVariant = !displayVariant;
    setFadeOut(true);
    setShakeAnimation(false);
    await BPromise.delay(FADE_ANIMATION_DELAY);
    setFadeOut(false);
    setFadeIn(true);
    setDisplayVariant(willDisplayVariant);
    await BPromise.delay(FADE_ANIMATION_DELAY);
    setFadeIn(false);
    setShakeAnimation(!willDisplayVariant);
  };

  return (
    <SkillItemVariantContainer
      $animationPaused={!shakeAnimation}
      onClick={handleToggle}
    >
      <SkillItemVariantContent
        className="skillItem"
        $display={!displayVariant}
        $fadeIn={fadeIn && !displayVariant}
        $fadeOut={fadeOut && !displayVariant}
      >
        {item}
      </SkillItemVariantContent>
      <SkillItemVariantContent
        className="skillItem"
        $display={displayVariant}
        $fadeIn={fadeIn && displayVariant}
        $fadeOut={fadeOut && displayVariant}
      >
        {variant}
      </SkillItemVariantContent>
    </SkillItemVariantContainer>
  );
}

SkillItemVariant.propTypes = {
  item: PropTypes.node.isRequired,
  variant: PropTypes.node.isRequired,
};

const MemoizedSkillItemVariant = React.memo(SkillItemVariant);
export default MemoizedSkillItemVariant;
