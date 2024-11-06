import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkDirective from 'remark-directive';
import remarkDirectiveRehype from 'remark-directive-rehype';
import IntentLink from './IntentLink';
import { TextContainer } from './styles';

const DisabledIntentLink = ({ children }) => children;

function TextChat({ text, disableIntentLink = false }) {
  const { i18n } = useTranslation();
  const textToDisplay = useMemo(() => {
    if (typeof text === 'object') {
      return i18n.language === 'fr' ? text.fr : text.en;
    }
    return text;
  }, [i18n.language, text]);

  return (
    <TextContainer>
      <ReactMarkdown
        remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
        components={{
          'intent-link': disableIntentLink ? DisabledIntentLink : IntentLink,
        }}
      >
        {textToDisplay}
      </ReactMarkdown>
    </TextContainer>
  );
}

TextChat.propTypes = {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      fr: PropTypes.string,
      en: PropTypes.string,
    }),
  ]).isRequired,
  disableIntentLink: PropTypes.bool,
};

export default TextChat;
