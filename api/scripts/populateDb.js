/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
import _ from 'lodash';
import mongoose from 'mongoose';
import { PAYLOADS } from '../resources/constants/payloads.js';
import { QUESTION_ID } from '../resources/constants/questionId.js';
import { RESPONSE_ID } from '../resources/constants/responseId.js';
import { selectRandomButtons } from '../src/chatMiddlewares/findButtons.js';
import {
  DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME,
} from '../src/config.js';
import { INPUT_TYPE, RESPONSE_TYPE, USER_MESSAGE_TYPE } from '../src/constants.js';
import { getLlmUserLimit, getModelFromLimiter, incrementModelCount } from '../src/controllers/llmController/limiter.js';
import { getResponse } from '../src/controllers/responsesController/responses.js';
import { getSettings } from '../src/controllers/settingController.js';
import initI18n from '../src/i18n.js';
import Conversation from '../src/models/conversation.js';
import LlmLimiterModel from '../src/models/llmLimiter.js';
import Message from '../src/models/message.js';
import SemanticCache from '../src/models/semanticCache.js';
import User from '../src/models/user.js';

// Connect to the database
mongoose.connect(`mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

async function createRandomUser(date) {
  const user = new User();
  user.createdAt = date;
  user.updatedAt = date;
  await user.save();
  return user;
}

async function createRandomConversation(user, date) {
  const conversation = new Conversation({
    user: user._id,
    language: Math.random() < 0.5 ? 'en' : 'fr',
    ip: {
      address: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      country: 'FR',
      region: 'France',
      city: 'Paris',
    },
    userAgent: 'Mozilla/5.0',
  });
  conversation.createdAt = date;
  conversation.updatedAt = date;
  await conversation.save();
  user.conversations.push(conversation._id);
  await user.save();
  return conversation;
}

async function createMessage({
  conversation, date,
  payload, userTextEn, userTextFr,
  questionId, responseId, responsesFunction,
}) {
  const computeTime = _.random(20, 100);
  const message = new Message({
    conversation: conversation._id,
    language: conversation.language,
    userMessage: {
      type: USER_MESSAGE_TYPE.DEFAULT,
      content: {
        text: conversation.language === 'fr' ? userTextFr : userTextEn,
        payload,
      },
    },
    input: {
      type: INPUT_TYPE.DEFAULT,
    },
    buttons: selectRandomButtons(3),
    receivedAt: new Date(date.getTime()),
    repliedAt: new Date(date.getTime() + computeTime),
    questionId,
    responseId,
    responses: responsesFunction(conversation.language),
  });

  message.createdAt = date;
  message.updatedAt = date;

  await message.save();
  conversation.messages.push(message._id);
  conversation.updatedAt = date;
  await conversation.save();
  return message;
}

async function createLLMMessage({
  conversation,
  date,
  userText,
  responseText,
}) {
  // find llmLimiter by user or ipAdress
  let llmLimiter = await LlmLimiterModel.findOne({
    $or: [{ user: conversation.user }, { ipAddress: conversation.ip.address }],
  });
  if (!llmLimiter) {
    const { largeModelLimit, slimModelLimit } = await getLlmUserLimit(date);
    llmLimiter = await LlmLimiterModel.create({
      user: conversation.user,
      ipAddress: conversation.ip.address,
      largeModelLimit,
      slimModelLimit,
    });
    llmLimiter.createdAt = date;
    await llmLimiter.save();
  }
  llmLimiter.updatedAt = date;

  const { modelSize, model } = await getModelFromLimiter(llmLimiter);
  if (!model || !modelSize) return;

  const semanticCache = new SemanticCache({
    question: userText,
    response: responseText,
    model,
  });
  semanticCache.createdAt = date;
  semanticCache.updatedAt = date;
  await semanticCache.save();

  const computeTime = _.random(800, 5000);
  const message = new Message({
    conversation: conversation._id,
    language: conversation.language,
    userMessage: {
      type: USER_MESSAGE_TYPE.TEXT,
      content: {
        text: userText,
      },
      language: conversation.language,
    },
    intent: {
      displayName: 'Default Fallback Intent',
      isFallback: true,
    },
    input: {
      type: INPUT_TYPE.DEFAULT,
    },
    buttons: selectRandomButtons(3),
    receivedAt: new Date(date.getTime()),
    repliedAt: new Date(date.getTime() + computeTime),
    questionId: QUESTION_ID.Q_UNKNOWN,
    responseId: RESPONSE_ID.R_LLM,
    responses: {
      type: RESPONSE_TYPE.LLM_RESPONSE,
      content: {
        text: responseText,
        isVerified: false,
      },
    },
    detectedLanguage: conversation.language,
    generated: true,
    model,
    semanticCache: semanticCache._id,
    semanticCacheCreated: true,
    tokens: {
      embedding: _.random(9, 15),
      completion: _.random(1100, 1500),
    },
  });

  message.createdAt = date;
  message.updatedAt = date;
  await message.save();

  conversation.messages.push(message._id);
  conversation.updatedAt = date;
  await conversation.save();

  await incrementModelCount(llmLimiter, modelSize);
  llmLimiter.updatedAt = date;
  await llmLimiter.save();

  // eslint-disable-next-line consistent-return
  return message;
}

async function createRandomChat(date) {
  const { LLM_LARGE_MODEL_USER_LIMIT, LLM_SLIM_MODEL_USER_LIMIT } = await getSettings('LLM_LARGE_MODEL_USER_LIMIT', 'LLM_SLIM_MODEL_USER_LIMIT');
  const numMessages = _.random(2, 6);
  const numLLMMessages = _.random(0, LLM_LARGE_MODEL_USER_LIMIT + LLM_SLIM_MODEL_USER_LIMIT);
  const user = await createRandomUser(date);
  const conversation = await createRandomConversation(user, date);

  const initiateMessage = new Message({
    conversation: conversation._id,
    language: conversation.language,
    userMessage: {
      type: USER_MESSAGE_TYPE.INITIATE,
    },
    input: {
      type: INPUT_TYPE.DEFAULT,
    },
    buttons: selectRandomButtons(3),
    receivedAt: new Date(),
    repliedAt: new Date(Date.now() + 20),
    questionId: QUESTION_ID.Q_INITIATE,
    responseId: RESPONSE_ID.R_FIRST_WELCOME,
    responses: getResponse(RESPONSE_ID.R_FIRST_WELCOME)(conversation.language),
  });
  initiateMessage.createdAt = date;
  initiateMessage.updatedAt = date;
  await initiateMessage.save();
  conversation.messages.push(initiateMessage._id);
  await conversation.save();

  const messages = [
    {
      payload: PAYLOADS.HOBBIES,
      userTextEn: 'What are your hobbies?',
      userTextFr: 'Quels sont vos loisirs ?',
      questionId: QUESTION_ID.Q_HOBBIES,
      responseId: RESPONSE_ID.R_HOBBIES,
      responsesFunction: getResponse(RESPONSE_ID.HOBBIES),
    },
    {
      payload: PAYLOADS.SUMMARY,
      userTextEn: 'Can you give me a summary?',
      userTextFr: 'Pouvez-vous me donner un résumé ?',
      questionId: QUESTION_ID.Q_SUMMARY,
      responseId: RESPONSE_ID.R_SUMMARY,
      responsesFunction: getResponse(RESPONSE_ID.SUMMARY),
    },
    {
      payload: PAYLOADS.ALL_POSSIBILITIES,
      userTextEn: 'What are all the possibilities?',
      userTextFr: 'Quelles sont toutes les possibilités ?',
      questionId: QUESTION_ID.Q_ALL_POSSIBILITIES,
      responseId: RESPONSE_ID.R_ALL_POSSIBILITIES,
      responsesFunction: getResponse(RESPONSE_ID.ALL_POSSIBILITIES),
    },
    {
      payload: PAYLOADS.WORKING_CONDITIONS,
      userTextEn: 'What are the working conditions?',
      userTextFr: 'Quelles sont les conditions de travail ?',
      questionId: QUESTION_ID.Q_WORKING_CONDITIONS,
      responseId: RESPONSE_ID.R_WORKING_CONDITIONS,
      responsesFunction: getResponse(RESPONSE_ID.WORKING_CONDITIONS),
    },
    {
      payload: PAYLOADS.TIMELINE,
      userTextEn: 'Can you show me the timeline?',
      userTextFr: 'Pouvez-vous me montrer la chronologie ?',
      questionId: QUESTION_ID.Q_TIMELINE,
      responseId: RESPONSE_ID.R_TIMELINE,
      responsesFunction: getResponse(RESPONSE_ID.TIMELINE),
    },
    {
      payload: PAYLOADS.SKILLS,
      userTextEn: 'What are your skills?',
      userTextFr: 'Quelles sont vos compétences ?',
      questionId: QUESTION_ID.Q_SKILLS,
      responseId: RESPONSE_ID.R_SKILLS,
      responsesFunction: getResponse(RESPONSE_ID.SKILLS),
    },
    {
      payload: PAYLOADS.WHO_IS_EDEN,
      userTextEn: 'Who are you?',
      userTextFr: 'Qui êtes-vous ?',
      questionId: QUESTION_ID.Q_WHO_ARE_YOU,
      responseId: RESPONSE_ID.R_WHO_ARE_YOU,
      responsesFunction: getResponse(RESPONSE_ID.WHO_ARE_YOU),
    },
    {
      payload: PAYLOADS.HELLO,
      userTextEn: 'Hello',
      userTextFr: 'Bonjour',
      questionId: QUESTION_ID.Q_WELCOME,
      responseId: RESPONSE_ID.R_HELLO,
      responsesFunction: getResponse(RESPONSE_ID.HELLO),
    },
  ];

  for (let i = 0; i < numMessages; i++) {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomTimeIncrement = Math.floor(Math.random() * 3000) + 2000; // Random time increment between 2sec to 5sec
    const messageDate = new Date(date.getTime() + randomTimeIncrement * (i + 1));

    await createMessage({
      conversation,
      date: messageDate,
      payload: randomMessage.payload,
      userTextEn: randomMessage.userTextEn,
      userTextFr: randomMessage.userTextFr,
      questionId: randomMessage.questionId,
      responseId: randomMessage.responseId,
      responsesFunction: randomMessage.responsesFunction,
    });
  }

  // Randomly add 0 to 3 LLM messages
  for (let j = 0; j < numLLMMessages; j++) {
    const randomTimeIncrement = Math.floor(Math.random() * 3000) + 2000; // Random time increment between 2sec to 5sec
    const messageDate = new Date(date.getTime() + randomTimeIncrement * (numMessages + j + 1));

    await createLLMMessage({
      conversation,
      date: messageDate,
      userText: 'Random user question',
      responseText: 'llm response',
    });
  }

  conversation.updatedAt = date;
  await conversation.save();

  console.log(`Created ${numMessages + numLLMMessages} messages on ${date.toISOString()}`);
}

async function populateDb() {
  await initI18n();

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const currentDate = new Date(oneYearAgo);
  while (currentDate <= yesterday) {
    const numChats = _.random(0, 10); // Random number of chats between 0 and 10
    for (let j = 0; j < numChats; j++) {
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      const randomSecond = Math.floor(Math.random() * 60);
      const randomDate = new Date(currentDate);
      randomDate.setHours(randomHour, randomMinute, randomSecond);
      await createRandomChat(randomDate);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  mongoose.connection.close();
}

populateDb().catch(console.error);
