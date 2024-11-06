import mongoose from 'mongoose';
import getRedisClient, { KNOWLEDGES_KEY_PREFIX } from '../redisClient.js';

const { Schema } = mongoose;

const Knowledge = new Schema({
  key: { type: String, required: true, unique: true },
  text: { type: String },
}, { timestamps: true, strict: false });

Knowledge.post('findOneAndDelete', async (knowledge) => {
  const redisClient = await getRedisClient();
  await redisClient.del(`${KNOWLEDGES_KEY_PREFIX}:${knowledge._id.toString()}`);
});

const KnowledgeModel = mongoose.model('Knowledge', Knowledge);

export default KnowledgeModel;
