export const RESPONSE_TYPE = {
  TEXT_RESPONSE: 'TEXT_RESPONSE',
  LLM_RESPONSE: 'LLM_RESPONSE',
  TEXT_WITH_IMAGE: 'TEXT_WITH_IMAGE',
  SKILLS: 'SKILLS',
  TIMELINE: 'TIMELINE',
  EVENT: 'EVENT',
  USER_MESSAGE: 'USER_MESSAGE',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  RESTART: 'RESTART',
};

export const INPUT_TYPE = {
  DEFAULT: 'DEFAULT',
  CONTACT_SIMPLE: 'CONTACT_SIMPLE',
};

export const USER_MESSAGE_TYPE = {
  INITIATE: 'INITIATE', // when user connect to socket
  DEFAULT: 'DEFAULT',
  CONTACT_SIMPLE_SEND: 'CONTACT_SIMPLE_SEND',
  CONTACT_SIMPLE_CANCEL: 'CONTACT_SIMPLE_CANCEL',
};

export const ERROR_CODES = {
  INVALID_EMAIL_FORMAT_ERROR: 'InvalidEmailFormatError',
  INVALID_EMAIL_ADDRESS_ERROR: 'InvalidEmailAddressError',
  TOO_MANY_EMAILS_SENDED_AT_TIME: 'TooManyEmailsSendedAtTime',
  TOO_MANY_SIMPLE_CONTACT_BY_USER: 'TooManySimpleContactByUser',
};

export const MODEL_SIZE = {
  LARGE: 'LARGE',
  SLIM: 'SLIM',
};

export const TECH_PROFICIENCY = {
  MASTER: 'MASTER', // I'm an expert
  FAMILIAR_INTERESTED: 'FAMILIAR_INTERESTED', // I know and i'm interested
  FAMILIAR_LOW_INTEREST: 'FAMILIAR_LOW_INTEREST', // I know, but i'm not interested, but i can help with small things
  FAMILIAR_UNINTERESTED: 'FAMILIAR_UNINTERESTED', // I know, but i'm not interested
  UNFAMILIAR_INTERESTED: 'UNFAMILIAR_INTERESTED', // I'm not familiar, but i'm interested, i can learn
  UNFAMILIAR_COMPLEX_INTERESTED: 'UNFAMILIAR_COMPLEX_INTERESTED', // I'm not familiar and it seems complex, but i'm interested, i can learn, but i can't make a big project with it now
  UNFAMILIAR_UNINTERESTED: 'UNFAMILIAR_UNINTERESTED', // I'm not familiar, and i'm not interested
};

export const INPUTS = {
  DEFAULT: () => ({
    type: INPUT_TYPE.DEFAULT,
    data: {},
  }),
  CONTACT_SIMPLE: ({ email, name, body }) => ({
    type: INPUT_TYPE.CONTACT_SIMPLE,
    data: { email, name, body },
  }),
};
