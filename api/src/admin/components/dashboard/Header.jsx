import { Box, H2, Text } from '@adminjs/design-system';
import React from 'react';

const pageHeaderHeight = 300;
const pageHeaderPaddingY = 74;
const pageHeaderPaddingX = 250;

export function Header() {
  return (
    <Box data-css="default-dashboard">
      <Box
        position="relative"
        overflow="hidden"
        bg="white"
        height={pageHeaderHeight}
        py={pageHeaderPaddingY}
        px={['default', 'lg', pageHeaderPaddingX]}
      >
        <Text textAlign="center" color="grey100">
          <H2 fontWeight="bold">Bonjour Eden</H2>
          <Text opacity={0.8}>Bienvenue sur ton CV, que puis je faire pour toi ?</Text>
        </Text>
      </Box>
    </Box>
  );
}

export default Header;
