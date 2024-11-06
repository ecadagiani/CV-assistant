/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import { RESPONSE_ID } from '../../../resources/constants/responseId.js';
import { MODEL_SIZE } from '../../constants.js';
import Conversation from '../../models/conversation.js';
import Message from '../../models/message.js';
import User from '../../models/user.js';
import { getTokenConsumedForMonth } from '../llmController/limiter.js';
import { getSettings } from '../settingController.js';

export async function getStats() {
  const {
    PRICE_LLM_SLIM_MODEL_M_TOKEN,
    PRICE_LLM_LARGE_MODEL_M_TOKEN,
    PRICE_LLM_EMBEDDING_M_TOKEN,
    PRICE_INTENT_REQUEST,
    LLM_LARGE_MODEL_GLOBAL_LIMIT,
    LLM_SLIM_MODEL_GLOBAL_LIMIT,
  } = await getSettings('PRICE_LLM_SLIM_MODEL_M_TOKEN', 'PRICE_LLM_LARGE_MODEL_M_TOKEN', 'PRICE_LLM_EMBEDDING_M_TOKEN', 'PRICE_INTENT_REQUEST', 'LLM_LARGE_MODEL_GLOBAL_LIMIT', 'LLM_SLIM_MODEL_GLOBAL_LIMIT');

  const nowDate = new Date();
  const oneYearPastDate = new Date(nowDate.getFullYear() - 1, nowDate.getMonth(), nowDate.getDate());
  // const sixMonthPastDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 6, nowDate.getDate());
  const threeMonthPastDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 3, nowDate.getDate());
  const oneMonthPastDate = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, nowDate.getDate());

  // get average number of messages per conversation
  const promiseAverageConversationLength = Conversation.aggregate([
    {
      $project: {
        length: { $size: '$messages' },
      },
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$length' },
      },
    },
    {
      $project: {
        _id: 0,
        average: 1,
      },
    },
  ]);

  // get evolution of average number of messages per conversation
  const promiseAverageConversationLengthPerDayEvolution = Conversation.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
        },
        average: { $avg: { $size: '$messages' } },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [oneYearPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        average: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // get repartition of ip country
  const promiseIpCountryRepartition = Conversation.aggregate([
    {
      $group: {
        _id: '$ip.country',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        country: { $ifNull: ['$_id', 'Unspecified'] },
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // get repartition of origin
  const promiseOriginRepartition = Conversation.aggregate([
    {
      $group: {
        _id: '$origin',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        origin: { $ifNull: ['$_id', 'Unspecified'] },
        count: 1,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // get repartition of origin per day
  /*
    [
      {date: '2021-01-01', linkedin: 10, github: 7},
      {date: '2021-01-02', linkedin: 20, google: 5},
      ...
    ]
   */
  const promiseOriginPerDayEvolution = Conversation.aggregate([
    {
      $group: {
        _id: {
          origin: '$origin',
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        data: {
          $push: {
            k: { $ifNull: ['$_id.origin', 'Unspecified'] },
            v: '$count',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
        origins: { $arrayToObject: '$data' },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [threeMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        origins: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  const promiseNbFallbackNErrorPerDayEvolution = Message.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
        isFallback: {
          $sum: { $cond: [{ $eq: ['$responseId', RESPONSE_ID.R_FALLBACK] }, 1, 0] },
        },
        isLlmTimeout: {
          $sum: { $cond: [{ $eq: ['$responseId', RESPONSE_ID.R_LLM_TIMEOUT] }, 1, 0] },
        },
        isError: {
          $sum: { $cond: [{ $eq: ['$responseId', RESPONSE_ID.R_ERROR] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [oneMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        isFallback: { $ifNull: ['$isFallback', 0] },
        isLlmTimeout: { $ifNull: ['$isLlmTimeout', 0] },
        isError: { $ifNull: ['$isError', 0] },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  const promiseNbUserAskContactPerDayEvolution = Message.aggregate([
    {
      $match: { responseId: RESPONSE_ID.R_CONTACT_SIMPLE },
    },
    {
      $group: {
        _id: {
          user: '$conversation.user',
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        count: { $sum: 1 },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [threeMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $ifNull: ['$count', 0] },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  const promiseNbNewUserPerDayEvolution = User.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [oneYearPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // each day, number of conversations having at least one message during the day
  // group messages per conversation and createdAt
  const getNbLiveConversationPerDayEvolution = (pastBound = oneYearPastDate) => Message.aggregate([
    {
      $group: {
        _id: {
          conversation: '$conversation',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        count: { $sum: 1 },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [pastBound, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $ifNull: ['$count', 0] },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // nb of each questionId per day
  /*
    [
      {date: '2021-01-01', Q_WHO_ARE_YOU: 10, Q_SUMMARY: 7},
      {date: '2021-01-02', Q_WHO_ARE_EDEN: 20, Q_SUMMARY: 5},
      ...
    ]
   */
  const promiseNbQuestionIdPerDayEvolution = Message.aggregate([
    {
      $match: {
        questionId: { $ne: null },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          questionId: '$questionId',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        data: { $push: { k: '$_id.questionId', v: '$count' } },
      },
    },
    {
      $project: {
        _id: 0,
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
        ids: { $arrayToObject: '$data' },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [threeMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        ids: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // nb of each responseId per day
  const promiseNbResponseIdPerDayEvolution = Message.aggregate([
    {
      $match: {
        responseId: { $ne: null },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          responseId: '$responseId',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        data: { $push: { k: '$_id.responseId', v: '$count' } },
      },
    },
    {
      $project: {
        _id: 0,
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
        ids: { $arrayToObject: '$data' },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [threeMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        ids: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // nb of each responseId per day
  const promiseNbLlmResponsePerDayEvolution = Message.aggregate([
    {
      $match: {
        responseId: RESPONSE_ID.R_LLM,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
        isLargeGenerated: {
          $sum: { $cond: [{ $eq: ['$modelSize', MODEL_SIZE.LARGE] }, 1, 0] },
        },
        isSlimGenerated: {
          $sum: { $cond: [{ $eq: ['$modelSize', MODEL_SIZE.SLIM] }, 1, 0] },
        },
        isCached: {
          $sum: { $cond: [{ $eq: ['$generated', false] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [threeMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        isLargeGenerated: { $ifNull: ['$isLargeGenerated', 0] },
        isSlimGenerated: { $ifNull: ['$isSlimGenerated', 0] },
        isCached: { $ifNull: ['$isCached', 0] },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  const promiseMessageProcessDurationPerDayEvolution = Message.aggregate([
    {
      $match: {
        responseId: { $not: { $eq: RESPONSE_ID.R_SEND_CONTACT_SIMPLE } },
      },
    },
    {
      $addFields: {
        processDuration: { $subtract: ['$repliedAt', '$receivedAt'] },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        processDurationPercentile: { $percentile: { input: '$processDuration', p: [0.25, 0.5, 0.75], method: 'approximate' } },
        processDurationAvg: { $avg: '$processDuration' },
        processDurationMin: { $min: '$processDuration' },
        processDurationMax: { $max: '$processDuration' },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [oneMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        processDurationPercentile: 1,
        processDurationAvg: 1,
        processDurationMin: 1,
        processDurationMax: 1,
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);
  const promisePricePerDayEvolution = Message.aggregate([
    {
      $match: {
        'intent.displayName': { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        embeddingTokens: { $sum: '$tokens.embedding' },
        largeCompletionTokens: {
          $sum: {
            $cond: [
              { $eq: ['$modelSize', MODEL_SIZE.LARGE] },
              '$tokens.completion',
              0,
            ],
          },
        },
        slimCompletionTokens: {
          $sum: {
            $cond: [
              { $eq: ['$modelSize', MODEL_SIZE.SLIM] },
              '$tokens.completion',
              0,
            ],
          },
        },
        nbIntentRequest: {
          $sum: {
            $cond: [
              { $ifNull: ['$intent.displayName', false] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        timestamp: { $dateFromString: { dateString: '$_id', format: '%Y-%m-%d' } },
      },
    },
    {
      $sort: { timestamp: 1 },
    },
    {
      $densify: {
        field: 'timestamp',
        range: {
          step: 1,
          unit: 'day',
          bounds: [oneMonthPastDate, nowDate],
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        embeddingTokens: { $ifNull: ['$embeddingTokens', 0] },
        largeCompletionTokens: { $ifNull: ['$largeCompletionTokens', 0] },
        slimCompletionTokens: { $ifNull: ['$slimCompletionTokens', 0] },
        nbIntentRequest: { $ifNull: ['$nbIntentRequest', 0] },
        price: {
          $add: [
            { $multiply: [{ $toDouble: '$embeddingTokens' }, (PRICE_LLM_EMBEDDING_M_TOKEN / 1000000)] },
            { $multiply: [{ $toDouble: '$largeCompletionTokens' }, (PRICE_LLM_LARGE_MODEL_M_TOKEN / 1000000)] },
            { $multiply: [{ $toDouble: '$slimCompletionTokens' }, (PRICE_LLM_SLIM_MODEL_M_TOKEN / 1000000)] },
            { $multiply: [{ $toDouble: '$nbIntentRequest' }, PRICE_INTENT_REQUEST] },
          ],
        },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  const { totalLarge, totalSlim } = await getTokenConsumedForMonth();
  const nbLlmLargeGenerationRemaining = LLM_LARGE_MODEL_GLOBAL_LIMIT - totalLarge;
  const nbLlmSlimGenerationRemaining = LLM_SLIM_MODEL_GLOBAL_LIMIT - totalSlim;

  const [
    nbUsers,
    nbConversations,
    nbMessages,
    averageConversationLength,
    averageConversationLengthPerDayEvolution,
    ipCountryRepartition,
    originRepartition,
    originPerDayEvolution,
    nbFallbackNErrorPerDayEvolution,
    nbUserAskContactPerDayEvolution,
    nbNewUserPerDayEvolution,
    nbLiveConversationPerDayEvolutionLastYear,
    nbLiveConversationPerDayEvolutionLastMonth,
    nbQuestionIdPerDayEvolution,
    nbResponseIdPerDayEvolution,
    messageProcessDurationPerDayEvolution,
    nbLlmResponsePerDayEvolution,
    pricePerDayEvolution,
  ] = await Promise.all([
    User.countDocuments(),
    Conversation.countDocuments(),
    Message.countDocuments(),
    promiseAverageConversationLength,
    promiseAverageConversationLengthPerDayEvolution,
    promiseIpCountryRepartition,
    promiseOriginRepartition,
    promiseOriginPerDayEvolution,
    promiseNbFallbackNErrorPerDayEvolution,
    promiseNbUserAskContactPerDayEvolution,
    promiseNbNewUserPerDayEvolution,
    getNbLiveConversationPerDayEvolution(oneYearPastDate),
    getNbLiveConversationPerDayEvolution(oneMonthPastDate),
    promiseNbQuestionIdPerDayEvolution,
    promiseNbResponseIdPerDayEvolution,
    promiseMessageProcessDurationPerDayEvolution,
    promiseNbLlmResponsePerDayEvolution,
    promisePricePerDayEvolution,
  ]);
  return {
    nbUsers,
    nbConversations,
    nbMessages,
    nbLlmLargeGenerationRemaining,
    nbLlmSlimGenerationRemaining,
    averageConversationLength: _.get(averageConversationLength, '[0].average', 0),
    averageConversationLengthPerDayEvolution,
    ipCountryRepartition,
    originRepartition,
    originPerDayEvolution,
    nbFallbackNErrorPerDayEvolution,
    nbUserAskContactPerDayEvolution,
    nbNewUserPerDayEvolution,
    nbLiveConversationPerDayEvolutionLastYear,
    nbLiveConversationPerDayEvolutionLastMonth,
    nbQuestionIdPerDayEvolution,
    nbResponseIdPerDayEvolution,
    messageProcessDurationPerDayEvolution,
    nbLlmResponsePerDayEvolution,
    pricePerDayEvolution,
  };
}
