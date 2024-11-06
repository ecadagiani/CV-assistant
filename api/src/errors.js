import { ERROR_CODES } from './constants.js';

export class InvalidEmailFormatError extends Error {
  constructor() {
    super('Invalid email format');
    this.name = ERROR_CODES.INVALID_EMAIL_FORMAT_ERROR;
  }
}

export class InvalidEmailAddressError extends Error {
  constructor() {
    super('Invalid email address');
    this.name = ERROR_CODES.INVALID_EMAIL_ADDRESS_ERROR;
  }
}
export class TooManyEmailsSendedAtTime extends Error {
  // when rate limiter hit for sendEmail is triggered on emailController.js
  constructor() {
    super('Too many emails sended at time');
    this.name = ERROR_CODES.TOO_MANY_EMAILS_SENDED_AT_TIME;
  }
}
export class TooManySimpleContactByUser extends Error {
  // when rate limiter hit for contactSimple is triggered on actionsController.js
  constructor() {
    super('Too many simple contact by user');
    this.name = ERROR_CODES.TOO_MANY_SIMPLE_CONTACT_BY_USER;
  }
}
