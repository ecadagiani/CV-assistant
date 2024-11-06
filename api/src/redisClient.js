import {
  createClient,
  SchemaFieldTypes,
  VectorAlgorithms,
} from 'redis';
import {
  REDIS_HOST, REDIS_PASSWORD, REDIS_PORT,
} from './config.js';
import { getSetting } from './controllers/settingController.js';
import { float32Buffer } from './utils/buffer.js';
import { logError, logInfo } from './utils/logger.js';

let redisClient = null;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
      password: REDIS_PASSWORD,
      connectTimeout: 10000, // in milliseconds
      socket: {
        reconnectStrategy(retries) {
          if (retries > 20) {
            logError({ withStdOut: true }, 'Too many attempts to reconnect. Redis connection was terminated');
            return new Error('Too many retries.');
          }
          return retries * 500;
        },
      },
    });

    redisClient.on('connect', () => {
      logInfo({ withStdOut: true }, 'Connected to Redis');
    });

    redisClient.on('error', (err) => {
      logError({ withStdOut: true }, 'Redis error:', err);
    });

    await redisClient.connect();
  }
  return redisClient;
};

export default getRedisClient;

export const KNOWLEDGES_KEY_PREFIX = 'knowledges';
export const KNOWLEDGES_INDEX_KEY = 'idx:knowledges';

export const SEMANTIC_CACHE_KEY_PREFIX = 'semanticCache';
export const SEMANTIC_CACHE_INDEX_KEY = 'idx:semanticCache';

const createRedisIndex = async () => {
  // https://redis.io/learn/howtos/solutions/vector/getting-started-vector
  const nodeRedisClient = await getRedisClient();
  const OPENAI_EMBEDDING_SIZE = await getSetting('OPENAI_EMBEDDING_SIZE');

  const knowledgeSchema = {
    '$.knowledgeId': {
      type: SchemaFieldTypes.TEXT,
      NOSTEM: true,
      SORTABLE: false,
      AS: 'knowledgeId',
    },
    '$.knowledgeKey': {
      type: SchemaFieldTypes.TEXT,
      NOSTEM: true,
      SORTABLE: false,
      AS: 'knowledgeKey',
    },
    '$.knowledgeText': {
      type: SchemaFieldTypes.TEXT,
      NOSTEM: true,
      SORTABLE: false,
      AS: 'knowledgeText',
    },
    '$.knowledgeVector': {
      type: SchemaFieldTypes.VECTOR,
      TYPE: 'FLOAT32',
      ALGORITHM: VectorAlgorithms.FLAT,
      DIM: OPENAI_EMBEDDING_SIZE,
      DISTANCE_METRIC: 'L2',
      INITIAL_CAP: 111,
      BLOCK_SIZE: 111,
      AS: 'knowledgeVector',
    },
  };
  const semanticCacheSchema = {
    '$.semanticCacheId': {
      type: SchemaFieldTypes.TEXT,
      NOSTEM: true,
      SORTABLE: false,
      AS: 'semanticCacheId',
    },
    '$.semanticCacheQuestion': {
      type: SchemaFieldTypes.TEXT,
      NOSTEM: true,
      SORTABLE: false,
      AS: 'semanticCacheQuestion',
    },
    '$.semanticCacheVector': {
      type: SchemaFieldTypes.VECTOR,
      TYPE: 'FLOAT32',
      ALGORITHM: VectorAlgorithms.FLAT,
      DIM: OPENAI_EMBEDDING_SIZE,
      DISTANCE_METRIC: 'L2',
      INITIAL_CAP: 111,
      BLOCK_SIZE: 111,
      AS: 'semanticCacheVector',
    },
  };

  try {
    await nodeRedisClient.ft.dropIndex(KNOWLEDGES_INDEX_KEY);
    await nodeRedisClient.ft.dropIndex(SEMANTIC_CACHE_INDEX_KEY);
  } catch (indexErr) {
    logError({ withStdOut: true }, 'Redis index drop error:', indexErr);
  }
  await nodeRedisClient.ft.create(KNOWLEDGES_INDEX_KEY, knowledgeSchema, {
    ON: 'JSON',
    PREFIX: `${KNOWLEDGES_KEY_PREFIX}:`,
  });
  await nodeRedisClient.ft.create(SEMANTIC_CACHE_INDEX_KEY, semanticCacheSchema, {
    ON: 'JSON',
    PREFIX: `${SEMANTIC_CACHE_KEY_PREFIX}:`,
  });
  logInfo({ withStdOut: true }, 'Redis index created');
};

export async function initRedis() {
  await createRedisIndex();
}

/**
 * Queries the top N documents that best match the query vector using K-Nearest Neighbors (KNN).
 *
 * @param {Array<number>} embedding - The embedding vector to search for.
 * @param {Object} options - The options for the query.
 * @param {string} options.vectorField - The field in the index that contains the vector data.
 * @param {string} options.indexKey - The key of the index to search.
 * @param {Array<string>} options.returnFields - The fields to return in the search results.
 * @param {number} [options.resultCount=5] - The number of results to return.
 * @returns {Promise<Array<{id: string, value: {score: number, knowledgeText: string, knowledgeId: string}}>>} An object containing the search results and the total tokens used.
 * @throws {Error} If the search text is empty.
 */
export const querySimilarVectorByKNN = async (embedding, {
  vectorField,
  indexKey,
  returnFields,
  resultCount = 5,
}) => {
  // A KNN query will give us the top n documents that best match the query vector.
  // https://redis.io/docs/interact/search-and-query/query/
  if (!embedding) {
    throw new Error('embedding must be provided');
  }

  const redisClientKnn = await getRedisClient();

  const searchQuery = `*=>[KNN ${resultCount} @${vectorField} $searchBlob AS score]`;
  const results = await redisClientKnn.ft.search(indexKey, searchQuery, {
    PARAMS: {
      searchBlob: float32Buffer(embedding),
    },
    RETURN: ['score', ...returnFields],
    SORTBY: {
      BY: 'score',
    },
    LIMIT: { from: 0, size: resultCount },
    DIALECT: 2,
  });

  return results?.documents.map((d) => d.value);
};
