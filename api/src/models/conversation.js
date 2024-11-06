import mongoose from 'mongoose';
import RESPONSE_ID from '../../resources/constants/responseId.js';
import Message from './message.js';

const { Schema } = mongoose;

const Conversation = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  origin: { type: String },
  ip: {
    address: { type: String },
    country: { type: String },
    region: { type: String },
    city: { type: String },
  },
  userAgent: { type: String },
  language: { type: String },
}, { timestamps: true, strict: false });

Conversation.index({ user: 1, createdAt: 1, updatedAt: 1 });

async function findLastMessageNotEmpty(currentMessageId) {
  if (!this._cache) this._cache = {};

  if (this._cache.messagesLength !== this.messages.length) {
    const messages = await Message
      .find({
        conversation: this._id,
        _id: { $ne: currentMessageId },
        responseId: { $ne: RESPONSE_ID.R_EMPTY },
      })
      .sort({ createdAt: 'desc' })
      .limit(1);

    this._cache.messagesLength = this.messages.length;
    if (messages.length > 0) this._cache.lastMessageNotEmpty = messages[0];
    else this._cache.lastMessageNotEmpty = null;
  }
  return this._cache.lastMessageNotEmpty;
}
Conversation.methods.findLastMessageNotEmpty = findLastMessageNotEmpty;

async function findPreviousMessagesNotEmpty(currentMessageId) {
  if (!this._cache) this._cache = {};

  if (this._cache.messagesLength !== this.messages.length) {
    const messages = await Message
      .find({
        conversation: this._id,
        _id: { $ne: currentMessageId },
        responseId: { $ne: RESPONSE_ID.R_EMPTY },
      })
      .sort({ createdAt: 'asc' });

    this._cache.messagesLength = this.messages.length;
    if (messages.length > 0) this._cache.previousMessagesNotEmpty = messages;
    else this._cache.previousMessagesNotEmpty = null;
  }
  return this._cache.previousMessagesNotEmpty;
}
Conversation.methods.findPreviousMessagesNotEmpty = findPreviousMessagesNotEmpty;

Conversation.post('findOneAndDelete', async (conversation) => {
  if (conversation?.messages && conversation.messages.length > 0) {
    await Message.deleteMany({ _id: { $in: conversation.messages } });
  }
});

async function populateAll() {
  await this.populate({ path: 'messages', options: { sort: { createdAt: 'asc' } } });
  await this.populate({
    path: 'user',
    populate: {
      path: 'conversations',
      options: { sort: { createdAt: 'asc' } },
    },
  });
}

Conversation.methods.populateAll = populateAll;

const ConversationModel = mongoose.model('Conversation', Conversation);

ConversationModel.findByIdWithPopulate = async (id) => ConversationModel
  .findById(id)
  .populate({ path: 'messages', options: { sort: { createdAt: 'asc' } } })
  .populate({ path: 'user', populate: { path: 'conversations', options: { sort: { createdAt: 'asc' } } } })
  .exec();

ConversationModel.findWithPopulate = async (filter) => ConversationModel
  .find(filter)
  .populate({ path: 'messages', options: { sort: { createdAt: 'asc' } } })
  .populate({ path: 'user', populate: { path: 'conversations', options: { sort: { createdAt: 'asc' } } } })
  .exec();

ConversationModel.findOneWithPopulate = async (filter) => ConversationModel
  .findOne(filter)
  .populate({ path: 'messages', options: { sort: { createdAt: 'asc' } } })
  .populate({ path: 'user', populate: { path: 'conversations', options: { sort: { createdAt: 'asc' } } } })
  .exec();

export default ConversationModel;
