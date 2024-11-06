import {
  Popover, PopoverButton, PopoverPanel, Transition,
} from '@headlessui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import CogIcon from 'src/assets/icons/cog.svg?react';
import MailIcon from 'src/assets/icons/mail.svg?react';
import MenuIcon from 'src/assets/icons/menu.svg?react';
import ResetIcon from 'src/assets/icons/reset.svg?react';
import { PAYLOADS } from 'src/constants/payloads';
import { useMobileSize } from 'src/hooks/useDevice';
import { useSocket } from 'src/hooks/useSocket';
import { incognitoState } from 'src/store/chat';
import * as Styled from './styles';

function SettingsButton() {
  const { t, i18n } = useTranslation();
  const { reset, isConnected, sendDefaultMessage } = useSocket();
  const disabledForIncognito = useRecoilValue(incognitoState);
  const isMobileSize = useMobileSize();

  const onLanguageChange = (language) => () => {
    i18n.changeLanguage(language);
  };

  const handleReset = () => {
    if (isConnected) {
      reset();
    }
  };

  return (
    <Styled.SettingsContainer $isMobile={isMobileSize}>
      <Popover as={Styled.SettingsPopoverContainer}>
        <PopoverButton $isMobile={isMobileSize} as={Styled.SettingsPopoverButton} aria-label={t('settings')}>
          {isMobileSize ? <MenuIcon /> : <CogIcon /> }
        </PopoverButton>

        <Transition
          as={Fragment}
          enter="transition-enter"
          enterFrom="transition-enterFrom"
          enterTo="transition-enterTo"
          leave="transition-leave"
          leaveFrom="transition-leaveFrom"
          leaveTo="transition-leaveTo"
        >
          <PopoverPanel $isMobile={isMobileSize} as={Styled.SettingsPopoverPanel}>
            <Styled.SettingsItemContainer>
              {i18n.language === 'fr' ? (
                <Styled.SettingsItem
                  onClick={onLanguageChange('en')}
                >
                  {t('english', { lng: 'en' })}
                  {' '}
                  🇬🇧
                </Styled.SettingsItem>
              ) : (
                <Styled.SettingsItem
                  onClick={onLanguageChange('fr')}
                >
                  {t('french', { lng: 'fr' })}
                  {' '}
                  🇫🇷
                </Styled.SettingsItem>
              )}
              <Styled.SettingsItem
                onClick={handleReset}
                disabled={!isConnected || disabledForIncognito}
              >
                {t('reset')}
                {' '}
                <ResetIcon />
              </Styled.SettingsItem>
              <Styled.SettingsItem
                onClick={() => sendDefaultMessage({ text: t('Contact Eden'), payload: PAYLOADS.CONTACT_SIMPLE })}
                disabled={!isConnected || disabledForIncognito}
              >
                {t('Contact Eden')}
                {' '}
                <MailIcon />
              </Styled.SettingsItem>
            </Styled.SettingsItemContainer>
          </PopoverPanel>
        </Transition>
      </Popover>
    </Styled.SettingsContainer>
  );
}

export default SettingsButton;
