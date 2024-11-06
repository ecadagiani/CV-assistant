import i18next from 'i18next';
import _ from 'lodash';
import JOKES_DATA from '../../../resources/constants/responseJokesData.js';
import { RESPONSE_TYPE } from '../../constants.js';
import { getImageUrl } from '../../utils/files.js';

function getMessageTranslation(text, language) {
  return i18next.t(`message:${text}`, { lng: language });
}

function getJokeImageMessage(language) {
  // select a random joke

  const jokesKeys = Object.keys(JOKES_DATA);
  const randomIndex = _.random(0, jokesKeys.length - 1);
  const randomJoke = JOKES_DATA[jokesKeys[randomIndex]];

  // add a message before the joke, if any
  let messageBefore = [];
  if (randomJoke?.messageBefore) {
    messageBefore = [{
      type: RESPONSE_TYPE.TEXT_RESPONSE,
      content: getMessageTranslation(randomJoke.messageBefore, language),
    }];
  }

  return [
    ...messageBefore,
    {
      type: RESPONSE_TYPE.IMAGE,
      noScroll: true,
      content: {
        id: jokesKeys[randomIndex],
        src: getImageUrl(randomJoke.src),
        alt: randomJoke.alt,
        height: randomJoke.height,
        width: randomJoke.width,
      },
    },
  ];
}

export default getJokeImageMessage;
