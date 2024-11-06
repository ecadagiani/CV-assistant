/* eslint-disable import/prefer-default-export */
import { Tiktoken } from 'tiktoken/lite';
import { readJson } from '../../utils/files.js';
import { getSetting, getSettings } from '../settingController.js';

function getEncoder(tokenizerName) {
  const tokenizerJson = readJson(`node_modules/tiktoken/encoders/${tokenizerName}`);
  return new Tiktoken(
    tokenizerJson.bpe_ranks,
    tokenizerJson.special_tokens,
    tokenizerJson.pat_str,
  );
}

let cachedSlimModelEncoder = null;
let cachedLargeModelEncoder = null;
let cachedEmbeddingModelEncoder = null;

async function getSlimModelEncoder() {
  if (!cachedSlimModelEncoder) {
    const tokenizerName = await getSetting('SLIM_MODEL_TOKENIZER');
    cachedSlimModelEncoder = getEncoder(tokenizerName);
  }
  return cachedSlimModelEncoder;
}

async function getLargeModelEncoder() {
  if (!cachedLargeModelEncoder) {
    const tokenizerName = await getSetting('LARGE_MODEL_TOKENIZER');
    cachedLargeModelEncoder = getEncoder(tokenizerName);
  }
  return cachedLargeModelEncoder;
}

async function getEmbeddingModelEncoder() {
  if (!cachedEmbeddingModelEncoder) {
    const tokenizerName = await getSetting('EMBEDDING_MODEL_TOKENIZER');
    cachedEmbeddingModelEncoder = getEncoder(tokenizerName);
  }
  return cachedEmbeddingModelEncoder;
}

export async function getTokensLength(text, model) {
  const { OPENAI_EMBEDDING_MODEL, OPENAI_SLIM_MODEL, OPENAI_LARGE_MODEL } = await getSettings(
    'OPENAI_EMBEDDING_MODEL',
    'OPENAI_SLIM_MODEL',
    'OPENAI_LARGE_MODEL',
  );
  let encoder;
  switch (model) {
    case OPENAI_SLIM_MODEL:
      encoder = await getSlimModelEncoder();
      break;
    case OPENAI_LARGE_MODEL:
      encoder = await getLargeModelEncoder();
      break;
    case OPENAI_EMBEDDING_MODEL:
      encoder = await getEmbeddingModelEncoder();
      break;
    default:
      throw new Error('Invalid model');
  }
  const tokensLength = encoder.encode(text).length;
  return tokensLength;
}
