import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import * as Styled from './styles';

function ButtonsLanguage({ onSelectLanguage = () => {} }) {
  const { i18n } = useTranslation();

  const onClickLanguage = (language) => () => {
    i18n.changeLanguage(language);
    onSelectLanguage(language);
  };

  return (
    <Styled.ButtonsLanguageTimelineContainer>
      <Styled.ButtonsLanguageContainer>
        <Styled.Button
          $selected={i18n.language === 'fr'}
          onClick={onClickLanguage('fr')}
        >
          🇫🇷
        </Styled.Button>
        <Styled.Button
          $selected={i18n.language === 'en'}
          onClick={onClickLanguage('en')}
        >
          🇬🇧
        </Styled.Button>
      </Styled.ButtonsLanguageContainer>
    </Styled.ButtonsLanguageTimelineContainer>
  );
}

ButtonsLanguage.propTypes = {
  onSelectLanguage: PropTypes.func,
};

export default ButtonsLanguage;
