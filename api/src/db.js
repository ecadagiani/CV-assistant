/* eslint-disable max-len */
import BPromise from 'bluebird';
import mongoose from 'mongoose';
import cachegoose from 'recachegoose';

import {
  DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME,
  OPENAI_DEFAULT_LARGE_MODEL, OPENAI_DEFAULT_SLIM_MODEL,
} from './config.js';
import { populateKnowledgeBase } from './controllers/llmController/knowledge.js';
import { saveNewSetting } from './controllers/settingController.js';
import BanModel from './models/ban.js';
import ConversationModel from './models/conversation.js';
import KnowledgeModel from './models/knowledge.js';
import LlmLimiterModel from './models/llmLimiter.js';
import MessageModel from './models/message.js';
import SemanticCacheModel from './models/semanticCache.js';
import SettingModel from './models/setting.js';
import UserModel from './models/user.js';
import { readJson } from './utils/files.js';
import { logError, logInfo } from './utils/logger.js';

async function initMongo() {
  logInfo({ withStdOut: true }, 'Syncing indexes...');
  await UserModel.syncIndexes();
  await ConversationModel.syncIndexes();
  await MessageModel.syncIndexes();
  await LlmLimiterModel.syncIndexes();
  await SemanticCacheModel.syncIndexes();
  await BanModel.syncIndexes();
  await SettingModel.syncIndexes();
  await KnowledgeModel.syncIndexes();

  // Initialize settings
  logInfo({ withStdOut: true }, 'Initializing settings...');
  const initialSettings = [
    { key: 'DIALOGFLOW_TIMEOUT', value: 5000, description: 'Timeout for Dialogflow API requests in milliseconds' },
    { key: 'USER_TEXT_INTENT_MAX_LENGTH', value: 256, description: 'Maximum length of user default free text' },
    { key: 'USER_TEXT_MAX_LENGTH', value: 256, description: 'Maximum length of user text (used in contact default, email and subject' },
    { key: 'USER_CONTACT_BODY_MAX_LENGTH', value: 8192, description: 'Maximum length of user contact default body' },
    { key: 'NO_SEE_DURATION', value: 1000 * 60 * 60 * 12, description: 'Duration in milliseconds to send "no see" message' },
    { key: 'WAITING_MESSAGE_TIMEOUT', value: 3000, description: 'Duration in milliseconds to send waiting message' },
    { key: 'DETECT_LANGUAGE_TIMEOUT', value: 1000, description: 'Timeout for language detection (Google Translate) in milliseconds' },
    { key: 'DETECT_LANGUAGE_MAX_CHAR', value: 40, description: 'Maximum number of characters to use for language detection in google translate' },
    { key: 'ORIGIN_QUERY_MAX_LENGTH', value: 256, description: 'Maximum length of origin query params' },
    { key: 'OPENAI_EMBEDDING_MODEL', value: 'text-embedding-3-large', description: 'OpenAI embedding model to use' },
    { key: 'OPENAI_EMBEDDING_SIZE', value: 3072, description: 'Size of OpenAI embeddings' },
    { key: 'OPENAI_SLIM_MODEL', value: OPENAI_DEFAULT_SLIM_MODEL, description: 'OpenAI slim model to use' },
    { key: 'OPENAI_LARGE_MODEL', value: OPENAI_DEFAULT_LARGE_MODEL, description: 'OpenAI large model to use' },
    { key: 'EMBEDDING_MODEL_TOKENIZER', value: 'cl100k_base.json', description: 'Tokenizer for embedding model - https://stackoverflow.com/questions/75804599/openai-api-how-do-i-count-tokens-before-i-send-an-api-request' },
    { key: 'LARGE_MODEL_TOKENIZER', value: 'o200k_base.json', description: 'Tokenizer for large model  - https://stackoverflow.com/questions/75804599/openai-api-how-do-i-count-tokens-before-i-send-an-api-request' },
    { key: 'SLIM_MODEL_TOKENIZER', value: 'o200k_base.json', description: 'Tokenizer for slim model - https://stackoverflow.com/questions/75804599/openai-api-how-do-i-count-tokens-before-i-send-an-api-request' },
    { key: 'LLM_TIMEOUT', value: 10000, description: 'Timeout for LLM requests in milliseconds. Max time to receive first stream response.' },
    { key: 'LLM_PREVIOUS_MESSAGES_MAX', value: 5, description: 'Maximum number of previous messages to include in the prompt' },
    { key: 'LLM_PREVIOUS_MESSAGES_SUMMARIZED', value: 2, description: 'In the message include in the prompt, the x oldest messages will be summarized' },
    { key: 'LLM_PREVIOUS_MESSAGE_SUMMARIZED_MAX_LENGTH', value: 512, description: 'Maximum length of summarized previous messages' },
    { key: 'LLM_PREVIOUS_MESSAGE_MAX_LENGTH', value: 1024, description: 'Maximum length of previous messages' },
    { key: 'LLM_SEMANTIC_CACHE_MAX_DISTANCE', value: 0.19, description: 'Maximum semantic distance for cache hits' },
    { key: 'LLM_KNOWLEDGE_COUNT', value: 10, description: 'Number of knowledge items to include in prompt' },
    { key: 'LLM_LARGE_MODEL_USER_LIMIT', value: 5, description: 'User limit for large LLM model' },
    { key: 'LLM_SLIM_MODEL_USER_LIMIT', value: 15, description: 'User limit for slim LLM model' },
    { key: 'LLM_LARGE_MODEL_USER_MIN', value: 2, description: 'In case of planned reduction of user limits. Minimum for large LLM model' },
    { key: 'LLM_SLIM_MODEL_USER_MIN', value: 2, description: 'In case of planned reduction of user limits. Minimum for slim LLM model' },
    { key: 'LLM_LARGE_MODEL_GLOBAL_LIMIT', value: 1000, description: 'Global limit for use of large LLM model' },
    { key: 'LLM_SLIM_MODEL_GLOBAL_LIMIT', value: 6000, description: 'Global limit for use of slim LLM model' },
    // in average, per message: 1300 input tokens (96.3%), 50 output tokens (3.7%) => 3.7%
    { key: 'PRICE_LLM_LARGE_MODEL_M_TOKEN', value: 3.75 * 0.963 + 15 * 0.037, description: 'Price ($) for 1M tokens for large LLM model. Price=inputPrice*0.963 + outputPrice*0.037' },
    { key: 'PRICE_LLM_SLIM_MODEL_M_TOKEN', value: 0.3 * 0.963 + 1.2 * 0.037, description: 'Price ($) for 1M tokens for slim LLM model. Price=inputPrice*0.963 + outputPrice*0.037' },
    { key: 'PRICE_LLM_EMBEDDING_M_TOKEN', value: 0.13, description: 'Price ($) for 1M tokens for embedding' },
    { key: 'PRICE_INTENT_REQUEST', value: 0.002, description: 'Price ($) for 1 intent request' },

    {
      key: 'LLM_PROMPT',
      description: 'LLM prompt',
      value: `CONTEXT:
Eden Cadagiani is a full-stack engineer since 2016, specializing in application development. He focuses on Python, JavaScript and TypeScript, building clean, efficient, and scalable solutions.
The actual date is {{datetime}}
{{knowledges}}

INSTRUCTIONS:
You are a professional AI assistant representing Eden in a webchat designed to introduce his professional CV to potential clients. Your task is to respond to user inquiries based on the provided context. Keep the following in mind:
- Be concise: Clients are busy and prefer short, clear answers. Keep responses focused and informative.
- Engaging tone: Maintain a professional, yet personable and slightly humorous tone. Keep it light but always on point.
- Use the context: 
  - Some information may not be relevant.
  - Base all responses on the given context. If relevant details are missing, use reasonable inferences. Example, “Does Eden like pasta carbonara?” and the context includes Eden’s preferences for cooking, respond with: “Given what I know, Eden might enjoy it"
  - If the question pertains to something not mentioned in the context, but you have ample related information you can excludes the possibility. Example, "When did Eden work for Google?" and there’s no information about Google, you can reasonably conclude with: "It seems that Eden has never worked at Google.".
  - If the question is entirely unrelated to the context and there’s no basis for inference, respond with: "Sorry, I don’t have this information, but you can contact Eden directly."
- Keep professional image: you are responsible for the professional image of Eden, so it is very important to remain professional, and only answer politically correct question. If a question is inappropriate, respond with: "Sorry, I'm not here to answer that. But if you absolutely want to know more, you can contact Eden directly."
- Language: Respond in the same language as the user’s question (either English or French). If the question is asked in another language, respond with: "Sorry, I cannot provide information in this language."`,
    },
  ];

  await BPromise.map(initialSettings, ({ key, value, description }) => saveNewSetting(key, value, description));
  logInfo({ withStdOut: true }, 'Settings initialized');

  logInfo({ withStdOut: true }, 'Initializing knowledges...');
  const knowledges = readJson('/resources/LLM/knowledges.json');
  await populateKnowledgeBase(knowledges, { forceEmbedding: false, updateIfTextChanged: false });
  logInfo({ withStdOut: true }, 'Knowledges initialized');
}

async function connectToMongo() {
  cachegoose(mongoose, {
    engine: 'memory',
  });
  return new Promise((resolve, reject) => {
    logInfo({ withStdOut: true }, 'Connecting to database...');
    mongoose.connect(`mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    mongoose.connection.on('error', (err) => {
      logError({ withStdOut: true }, 'Error on mongoose.connection', err);
      reject(err);
    });
    mongoose.connection.once('open', async () => {
      logInfo({ withStdOut: true }, 'Connected to database');
      await initMongo();
      resolve();
    });
  });
}

export default connectToMongo;
