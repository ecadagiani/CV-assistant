import BPromise from 'bluebird';
import { MAX_DB_SIZE_GB } from '../../config.js';
import Conversation from '../../models/conversation.js';
import LlmLimiterModel from '../../models/llmLimiter.js';
import Message from '../../models/message.js';
import User from '../../models/user.js';
import { getDataSizeGB } from './dbSize.js';

export async function cleanEmptyConversations() {
  // delete conversation from two days ago for user with only conversations with no message or only one
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const users = await User.aggregate([
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversations',
        foreignField: '_id',
        as: 'conversations',
      },
    },
    {
      $match: {
        updatedAt: { $lte: twoDaysAgo },
        $or: [
          { 'conversations.messages': { $exists: false } },
          { 'conversations.messages': { $size: 0 } },
          { 'conversations.messages': { $size: 1 } },
        ],
      },
    },
    {
      $addFields: {
        // add a messagesLength inside conversations to store the number of messages
        conversations: {
          $map: {
            input: '$conversations',
            as: 'conversation',
            in: {
              _id: '$$conversation._id',
              messagesLength: { $size: { $ifNull: ['$$conversation.messages', []] } },
            },
          },
        },
      },
    },
    {
      // filter user that have only conversations with no message or only one
      $match: {
        'conversations.messagesLength': { $not: { $gt: 1 } },
      },
    },
  ]);

  let deletedMessages = 0;
  let deletedConversations = 0;
  let deletedUsers = 0;

  await BPromise.map(users, async (user) => {
    await BPromise.map(user.conversations, async (conversation) => {
      // delete messages
      const resMessages = await Message.deleteMany({ conversation: conversation._id });
      deletedMessages += resMessages.deletedCount;
    });
    // delete conversations
    const resConversations = await Conversation.deleteMany({ user: user._id });
    deletedConversations += resConversations.deletedCount;
    // delete user
    const resUsers = await User.deleteOne({ _id: user._id });
    deletedUsers += resUsers.deletedCount;
  });
  return {
    deletedMessages,
    deletedConversations,
    deletedUsers,
  };
}

export async function cleanOlderThanDate(date) {
  // delete old message
  const resMessages = await Message.deleteMany({ updatedAt: { $lte: date } });

  // delete old conversation without message
  let deletedConversations = 0;
  const conversations = await Conversation.find({ updatedAt: { $lte: date } });
  await BPromise.map(conversations, async (conversation) => {
    if (await Message.exists({ conversation: conversation._id })) {
      const res = await Conversation.deleteOne({ _id: conversation._id });
      deletedConversations += res.deletedCount;
    }
  });

  // delete old user without conversation
  let deletedUsers = 0;
  const users = await User.find({ updatedAt: { $lte: date } });
  await BPromise.map(users, async (user) => {
    if (await Conversation.exists({ user: user._id })) {
      const res = await User.deleteOne({ _id: user._id });
      deletedUsers += res.deletedCount;
    }
  });

  let deletedLlmLimiter = 0;
  const llmLimiter = await LlmLimiterModel.find({ updatedAt: { $lte: date } });
  await BPromise.map(llmLimiter, async (limiter) => {
    const res = await LlmLimiterModel.deleteOne({ _id: limiter._id });
    deletedLlmLimiter += res.deletedCount;
  });

  return {
    deletedMessages: resMessages.deletedCount,
    deletedConversations,
    deletedUsers,
    deletedLlmLimiter,
  };
}

export async function cleanDb() {
  // last year date at midnight
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastYearDate = new Date();
  lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
  lastYearDate.setHours(0, 0, 0, 0);
  const emptyDelete = await cleanEmptyConversations();
  const lastYearDelete = await cleanOlderThanDate(lastYearDate);

  let accDeletedMessages = emptyDelete.deletedMessages + lastYearDelete.deletedMessages;
  let accDeletedConversations = emptyDelete.deletedConversations + lastYearDelete.deletedConversations;
  let accDeletedUsers = emptyDelete.deletedUsers + lastYearDelete.deletedUsers;
  let accDeletedLlmLimiter = lastYearDelete.deletedLlmLimiter;

  let dataSizeGB = await getDataSizeGB();
  const date = new Date(lastYearDate);
  while (dataSizeGB > MAX_DB_SIZE_GB && date < lastWeek) {
    // add 1 week to date, and clean
    date.setDate(date.getDate() + 7);
    // eslint-disable-next-line no-await-in-loop
    const cleanedRes = await cleanOlderThanDate(date);
    accDeletedMessages += cleanedRes.deletedMessages;
    accDeletedConversations += cleanedRes.deletedConversations;
    accDeletedUsers += cleanedRes.deletedUsers;
    accDeletedLlmLimiter += cleanedRes.deletedLlmLimiter;
    // eslint-disable-next-line no-await-in-loop
    dataSizeGB = await getDataSizeGB();
  }

  return {
    deletedMessages: accDeletedMessages,
    deletedConversations: accDeletedConversations,
    deletedUsers: accDeletedUsers,
    deletedLlmLimiter: accDeletedLlmLimiter,
    dataSizeGB,
  };
}
