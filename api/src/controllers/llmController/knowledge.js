import BPromise from 'bluebird';
import KnowledgeModel from '../../models/knowledge.js';
import getRedisClient, { KNOWLEDGES_INDEX_KEY, KNOWLEDGES_KEY_PREFIX, querySimilarVectorByKNN } from '../../redisClient.js';
import { getSetting } from '../settingController.js';
import { getEmbedding } from './embedding.js';

// https://redis.io/learn/howtos/solutions/vector/getting-started-vector

/**
 * Updates the embedding for a specific knowledge entry in the database and Redis.
 *
 * @param {string} knowledgeId - The unique identifier of the knowledge entry.
 * @param {string} key - The key associated with the knowledge entry.
 * @param {string} text - The text content of the knowledge entry.
 * @returns {Promise<number>} The total number of tokens used for embedding.
 * @throws {Error} If there's an issue updating the embedding or storing in Redis.
 */
export async function updateKnowledgeEmbedding(knowledgeId, key, text) {
  const redisClient = await getRedisClient();
  const { embedding, totalTokens } = await getEmbedding(text);
  await redisClient.json.set(`${KNOWLEDGES_KEY_PREFIX}:${knowledgeId.toString()}`, '$', {
    knowledgeId: knowledgeId.toString(),
    knowledgeKey: key,
    knowledgeText: text,
    knowledgeVector: embedding,
  });
  return totalTokens;
}

/**
 * Re-embeds all knowledge entries in the database and Redis.
 *
 * @returns {Promise<number>} The total number of tokens used for re-embedding.
 * @throws {Error} If there's an issue re-embedding any knowledge entry.
 */
export async function reEmbedAllKnowledge() {
  const knowledges = await KnowledgeModel.find({});
  let totalTokens = 0;
  await BPromise.map(knowledges, async (knowledge) => {
    const tokens = await updateKnowledgeEmbedding(knowledge._id, knowledge.key, knowledge.text);
    totalTokens += tokens;
  }, { concurrency: 4 });
  return totalTokens;
}

/**
 * Populates the knowledge base with the provided knowledge entries.
 *
 * @param {Array<{key: string, text: string}>} knowledges - An array of knowledge objects to be added or updated in the knowledge base.
 * @param {Object} options - Options for the operation.
 * @param {boolean} [options.updateIfTextChanged=false] - If true, update the knowledge if the text has changed.
 * @param {boolean} [options.forceEmbedding=false] - If true, forces the embedding of all provided knowledge entries.
 * @returns {Promise<{created: number, updated: number, errors: number, totalTokens: number}>} - An object containing the results of the operation.
 * @throws {Error} If a knowledge entry is invalid.
 */
export async function populateKnowledgeBase(
  knowledges,
  {
    forceEmbedding = false,
    updateIfTextChanged = false,
  } = {},
) {
  const redisClient = await getRedisClient();
  const result = {
    created: 0,
    updated: 0,
    errors: 0,
    totalTokens: 0,
  };

  await BPromise.map(knowledges, async ({ key, text }) => {
    if (!key || !text) {
      throw new Error('Invalid knowledge');
    }

    try {
      let knowledge = await KnowledgeModel.findOne({ key });
      let needsEmbedding = false;

      if (!knowledge) {
        // Create new knowledge
        knowledge = new KnowledgeModel({ key, text });
        await knowledge.save();
        result.created++;
        needsEmbedding = true;
      } else if (updateIfTextChanged && knowledge.text !== text) {
        // check if text has changed
        knowledge.text = text;
        await knowledge.save();
        result.updated++;
        needsEmbedding = true;
      }

      // Check Redis
      const redisKey = `${KNOWLEDGES_KEY_PREFIX}:${knowledge._id.toString()}`;
      const redisData = await redisClient.json.get(redisKey);

      if (!redisData || forceEmbedding) {
        needsEmbedding = true;
      }
      if (updateIfTextChanged && knowledge.text !== text) {
        needsEmbedding = true;
      }

      if (needsEmbedding) {
        const tokens = await updateKnowledgeEmbedding(knowledge._id, key, text);
        result.totalTokens += tokens;
      }
    } catch (error) {
      console.error(`Error processing knowledge with key ${key}:`, error);
      result.errors++;
    }
  }, { concurrency: 2 });
  return result;
}

export async function getKnowledges({ question = null, questionEmbedding = null, resultCount = null }) {
  const LLM_KNOWLEDGE_COUNT = await getSetting('LLM_KNOWLEDGE_COUNT');
  if (!resultCount) {
    resultCount = LLM_KNOWLEDGE_COUNT;
  }

  if (!question && !questionEmbedding) {
    throw new Error('Question or questionEmbedding must be provided');
  }

  let embedding = questionEmbedding;
  let totalTokens = 0;
  if (!questionEmbedding) {
    const embeddingResponse = await getEmbedding(question);
    embedding = embeddingResponse.embedding;
    totalTokens = embeddingResponse.totalTokens;
  }

  return {
    knowledges: await querySimilarVectorByKNN(embedding, {
      vectorField: 'knowledgeVector',
      indexKey: KNOWLEDGES_INDEX_KEY,
      returnFields: ['knowledgeText', 'knowledgeId'],
      resultCount,
    }),
    totalTokens,
  };
}
