import mongoose from 'mongoose';
import { MODEL_SIZE, RESPONSE_TYPE, USER_MESSAGE_TYPE } from '../constants.js';

const { Schema } = mongoose;

const Message = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },

  // user message fields
  userMessage: {
    type: { type: String, enum: Object.values(USER_MESSAGE_TYPE) },
    content: {
      // type: DEFAULT
      text: { type: String },
      payload: { type: String },

      // type: CONTACT_SIMPLE_SEND
      email: { type: String },
      name: { type: String },
      body: { type: String },
    },
    language: { type: String },
  },

  // process fields
  intent: {
    displayName: { type: String },
    isFallback: { type: Boolean },
  },
  parameters: { type: Object },
  language: { type: String }, // gived by conversation, or userMessage.language if exist and is 'fr' or 'en'
  detectedLanguage: { type: String },
  isDifferentLanguage: { type: Boolean },
  isSupportedLanguage: { type: Boolean },
  isInitiate: { type: Boolean },
  isNewUser: { type: Boolean },
  isNewConversation: { type: Boolean },
  isLongTimeNoSee: { type: Boolean },
  error: {
    name: { type: String },
    message: { type: String },
    stack: { type: String },
  },

  // stats fields
  questionId: { type: String },
  responseId: { type: String },
  receivedAt: { type: Date, default: Date.now }, // when the message is received by the server
  repliedAt: { type: Date }, // when the message is replied by the server

  // llm fields
  model: { type: String }, // model used to generate the response, or used by the semanticCache find
  modelSize: { type: String, enum: Object.values(MODEL_SIZE) },
  tokens: {
    embedding: { type: Number },
    completion: { type: Number },
  },
  semanticCache: { type: Schema.Types.ObjectId, ref: 'SemanticCache' },
  semanticCacheCreated: { type: Boolean },
  generated: { type: Boolean },
  // if generated=true && semanticCacheCreated=true, this is a new question, with a new response saved in semanticCache
  // if generated=true && semanticCache && semanticCacheCreated=false, this is NOT a question, but semanticCache have shouldUseCache===false
  // if generated=false && semanticCache && semanticCacheCreated=false, this is NOT a question, with a usable cache
  // generated=false && semanticCacheCreated=true, CANNOT be possible
  // !semanticCache && semanticCacheCreated=true, CANNOT be possible

  // responses fields
  responses: [{
    type: { type: String, enum: Object.values(RESPONSE_TYPE) },
    content: { type: Schema.Types.Mixed }, // string or object or array
  }],
  buttons: [{
    text: {
      en: { type: String },
      fr: { type: String },
    },
    payload: { type: String },
  }],
  input: {
    type: { type: String },
    data: {
      // type: CONTACT_SIMPLE
      email: { type: String },
      name: { type: String },
      body: { type: String },
    },
  },
}, { timestamps: true, strict: false });

Message.index({
  conversation: 1,
  responseId: 1,
  semanticCacheCreated: 1,
  generated: 1,
  createdAt: 1,
  updatedAt: 1,
});

const MessageModel = mongoose.model('Message', Message);

export default MessageModel;
