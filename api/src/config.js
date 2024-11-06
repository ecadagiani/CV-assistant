/* eslint-disable max-len */
export const PORT = 3000;
export const { ENVIRONMENT } = process.env;
export const { NODE_APP_PATH } = process.env;
export const IS_DEBUG = process.env.ENVIRONMENT !== 'PRODUCTION';
export const IS_PRODUCTION = process.env.ENVIRONMENT === 'PRODUCTION';

export const { API_URL } = process.env;
export const FRONT_URL = process.env.FRONT_URL || 'https://ecadagiani.fr';
export const { DB_NAME } = process.env;
export const { DB_USERNAME } = process.env;
export const { DB_PASSWORD } = process.env;
export const { DB_HOST } = process.env;
export const { DB_PORT } = process.env;
export const { DIALOGFLOW_PROJECT_ID } = process.env;
export const { DIALOGFLOW_ENVIRONMENT_ID } = process.env;
export const EMAIL_ADDRESS = 'e.cadagiani@gmail.com';
export const { EMAIL_APP_USER } = process.env;
export const { EMAIL_APP_PASSWORD } = process.env;
export const MAX_DB_SIZE_GB = process.env.MAX_DB_SIZE_GB || 10;

export const { ADMIN_USER } = process.env;
export const { ADMIN_PASSWORD } = process.env;
export const { ADMIN_ROOT_PATH } = process.env;

export const SUPPORTED_LANGUAGES = ['en', 'fr'];


export const { AWS_CLOUDWATCH_GROUP } = process.env;
export const { AWS_CLOUDWATCH_STREAM } = process.env;

export const { REDIS_HOST } = process.env;
export const { REDIS_PORT } = process.env;
export const { REDIS_PASSWORD } = process.env;

export const { OPENAI_API_KEY } = process.env;
export const { OPENAI_DEFAULT_SLIM_MODEL } = process.env;
export const { OPENAI_DEFAULT_LARGE_MODEL } = process.env;

export const { IPDATA_API_KEY } = process.env;
