import mongoose from 'mongoose';
import { MODEL_SIZE } from '../constants.js';
import getRedisClient, { SEMANTIC_CACHE_KEY_PREFIX } from '../redisClient.js';

const { Schema } = mongoose;

const SemanticCache = new Schema({
  question: { type: String },
  prompt: { type: String },
  queries: [{
    question: { type: String },
    distance: { type: Number },
    wasUsed: { type: Boolean },
    message: { type: Schema.Types.ObjectId, ref: 'Message' },
  }],
  responses: [{
    language: { type: String },
    response: { type: String },
  }],
  model: { type: String },
  modelSize: { type: String, enum: Object.values(MODEL_SIZE) },

  // if true, the response is verified by the user
  isVerified: { type: Boolean, default: false },

  // if false, the cache will be skipped
  // (because certain questions is not cacheable, example: "explain previous message")
  shouldUseCache: { type: Boolean, default: false },

  // if shouldUseCache=false && isVerified=false, the cache has just been created and not verified by eden
  // if shouldUseCache=false && isVerified=true, the cache is verified by eden, but it cannot be used
  // if shouldUseCache=true && isVerified=true, the cache is verified by eden, and it can be used
  // if shouldUseCache=true && isVerified=false, weird case that should not happen, but will not create a bug
}, { timestamps: true, strict: false });

SemanticCache.post('findOneAndDelete', async (semanticCache) => {
  const redisClient = await getRedisClient();
  await redisClient.del(`${SEMANTIC_CACHE_KEY_PREFIX}:${semanticCache._id}`);
});

const SemanticCacheModel = mongoose.model('SemanticCache', SemanticCache);

export default SemanticCacheModel;
