/* eslint-disable import/prefer-default-export */
import { getSetting } from '../settingController.js';
import { llmClient } from './llmClient.js';

// https://redis.io/learn/howtos/solutions/vector/getting-started-vector

/**
 * Generates an embedding for the given text using the specified model.
 *
 * @param {string} text - The text to generate an embedding for.
 * @param {string} [model=LLM_EMBEDDING_MODEL] - The model to use for generating the embedding.
 * @returns {Promise<{embedding: number[], totalTokens: number} | Object>} - An object containing the embedding and the total number of tokens used, or undefined if no embedding was generated.
 */
export async function getEmbedding(text, model = null) {
  const LLM_EMBEDDING_MODEL = await getSetting('LLM_EMBEDDING_MODEL');
  if (model === null) {
    model = LLM_EMBEDDING_MODEL;
  }

  const response = await llmClient.embeddings.generate({
    requestBody: {
      model,
      input: text,
      encodingFormat: 'float',
    },
  });
  if (response?.data?.length === 0) {
    return { };
  }

  return { embedding: response.data[0]?.embedding, totalTokens: response.usage?.totalTokens };
}
