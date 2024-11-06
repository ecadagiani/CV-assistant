import BPromise from 'bluebird';
import _ from 'lodash';
import SemanticCacheModel from '../../models/semanticCache.js';
import getRedisClient, {
  querySimilarVectorByKNN,
  SEMANTIC_CACHE_INDEX_KEY,
  SEMANTIC_CACHE_KEY_PREFIX,
} from '../../redisClient.js';
import { getSetting } from '../settingController.js';
import { getEmbedding } from './embedding.js';

export async function checkSemanticCache(question, messageId = null) {
  const LLM_SEMANTIC_CACHE_MAX_DISTANCE = await getSetting('LLM_SEMANTIC_CACHE_MAX_DISTANCE');
  const { embedding: questionEmbedding, totalTokens } = await getEmbedding(question);

  const result = {
    semanticCache: null,
    questionEmbedding,
    totalTokens,
  };

  const redisSemanticCache = await querySimilarVectorByKNN(questionEmbedding, {
    vectorField: 'semanticCacheVector',
    indexKey: SEMANTIC_CACHE_INDEX_KEY,
    returnFields: ['semanticCacheId', 'semanticCacheQuestion'],
    resultCount: 1,
  });

  // If the distance is too far, we don't consider it as a match
  if (!redisSemanticCache || !redisSemanticCache.length || redisSemanticCache[0].score > LLM_SEMANTIC_CACHE_MAX_DISTANCE) {
    return result;
  }

  const semanticCacheId = redisSemanticCache[0].semanticCacheId;
  const semanticCache = await SemanticCacheModel.findById(semanticCacheId);

  if (!semanticCache) {
    // This should never happen, the cache exists in redis but not in mongo
    // remove in redis
    const redisClient = await getRedisClient();
    await redisClient.del(`${SEMANTIC_CACHE_KEY_PREFIX}:${semanticCacheId}`);
    return result;
  }

  // add question to queries
  if (!semanticCache.queries.find((query) => query.question === question)) {
    semanticCache.queries.push({
      question,
      distance: redisSemanticCache[0].score,
      wasUsed: semanticCache.shouldUseCache,
      ...(messageId && { message: messageId }),
    });
    await semanticCache.save();
  }

  if (!semanticCache.shouldUseCache) {
    // This cache is not usable, (because certain questions is not cacheable like the one based on the context of the previous questions)
    return { ...result, semanticCache };
  }

  return {
    ...result,
    semanticCache,
  };
}

export async function createSemanticCache({
  question, questionEmbedding, prompt, language, response, model, modelSize, messageId = null,
}) {
  const redisClient = await getRedisClient();
  // If cache doesn't exist, create a new one
  const semanticCache = await SemanticCacheModel.create({
    question,
    prompt,
    queries: [{
      question,
      distance: 0,
      wasUsed: true,
      ...(messageId && { message: messageId }),
    }],
    responses: [{
      language,
      response,
    }],
    model,
    modelSize,
  });

  await redisClient.json.set(`${SEMANTIC_CACHE_KEY_PREFIX}:${semanticCache._id}`, '$', {
    semanticCacheId: semanticCache._id,
    semanticCacheQuestion: question,
    semanticCacheVector: questionEmbedding,
  });

  return semanticCache;
}

export async function addResponseToSemanticCache({ semanticCache, language, response }) {
  // Check if the semanticCache already has a response for this language
  const existingResponseIndex = semanticCache.responses.findIndex((r) => r.language === language);

  if (existingResponseIndex !== -1) {
    // If a response for this language exists, update it
    semanticCache.responses[existingResponseIndex].response = response;
  } else {
    // If no response for this language exists, add a new one
    semanticCache.responses.push({ language, response });
  }

  // Save the updated semanticCache
  await semanticCache.save();

  return semanticCache;
}

export async function updateSemanticCacheEmbedding(semanticCacheId, question) {
  const redisClient = await getRedisClient();
  const { embedding, totalTokens } = await getEmbedding(question);

  await redisClient.json.set(`${SEMANTIC_CACHE_KEY_PREFIX}:${semanticCacheId}`, '$', {
    semanticCacheId,
    semanticCacheQuestion: question,
    semanticCacheVector: embedding,
  });

  return {
    success: true,
    totalTokens,
  };
}

export async function getNearestSemanticCache(question, resultCount = 5) {
  // for debugging
  const { embedding: questionEmbedding, totalTokens } = await getEmbedding(question);

  const redisSemanticCache = await querySimilarVectorByKNN(questionEmbedding, {
    vectorField: 'semanticCacheVector',
    indexKey: SEMANTIC_CACHE_INDEX_KEY,
    returnFields: ['semanticCacheId', 'semanticCacheQuestion'],
    resultCount,
  });

  const nearest = await BPromise.map(redisSemanticCache, async (cache) => {
    const semanticCache = await SemanticCacheModel.findById(cache.semanticCacheId);
    return { ...semanticCache.toObject(), score: cache.score };
  });

  return { nearest: _.sortBy(nearest, 'score'), totalTokens };
}
