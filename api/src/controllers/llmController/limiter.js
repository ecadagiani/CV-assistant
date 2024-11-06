import { MODEL_SIZE } from '../../constants.js';
import LlmLimiterModel from '../../models/llmLimiter.js';
import { getDaysUntilEndOfMonth } from '../../utils/date.js';
import { getSetting, getSettings } from '../settingController.js';

export async function getAverageLlmUserPerDay(date = new Date()) {
  // the correct way, is to match message with responseId=R_LLM, and group by user
  // but to avoid to query message, for better performance, we use the createdAt of the llmLimiter, it's not perfect, but it's a good approximation
  const nbDays = 14;
  const twoWeekPastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - nbDays);
  const nbUsersUsingLlm = await LlmLimiterModel.aggregate([
    {
      $match: {
        createdAt: { $gte: twoWeekPastDate },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ]);

  const count = nbUsersUsingLlm.length === 0 ? 0 : nbUsersUsingLlm[0].count;
  return count / nbDays;
}

export async function getTokenConsumedForMonth(date = new Date()) {
  const firstAtMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  const result = await LlmLimiterModel.aggregate([
    {
      $match: {
        updatedAt: { $gte: firstAtMonth },
      },
    },
    {
      $group: {
        _id: null,
        totalLarge: { $sum: '$largeModelCount' },
        totalSlim: { $sum: '$slimModelCount' },
      },
    },
  ]);
  if (result.length === 0) {
    return {
      totalLarge: 0,
      totalSlim: 0,
    };
  }
  return {
    totalLarge: result[0].totalLarge,
    totalSlim: result[0].totalSlim,
  };
}

export async function getLlmUserLimit(date = new Date()) {
  const {
    LLM_LARGE_MODEL_USER_LIMIT,
    LLM_SLIM_MODEL_USER_LIMIT,
    LLM_LARGE_MODEL_USER_MIN,
    LLM_SLIM_MODEL_USER_MIN,
    LLM_LARGE_MODEL_GLOBAL_LIMIT,
    LLM_SLIM_MODEL_GLOBAL_LIMIT,
  } = await getSettings(
    'LLM_LARGE_MODEL_USER_LIMIT',
    'LLM_SLIM_MODEL_USER_LIMIT',
    'LLM_LARGE_MODEL_USER_MIN',
    'LLM_SLIM_MODEL_USER_MIN',
    'LLM_LARGE_MODEL_GLOBAL_LIMIT',
    'LLM_SLIM_MODEL_GLOBAL_LIMIT',
  );

  let largeModelLimit = LLM_LARGE_MODEL_USER_LIMIT;
  let slimModelLimit = LLM_SLIM_MODEL_USER_LIMIT;

  const averageLlmUserPerDay = await getAverageLlmUserPerDay(date);
  if (!averageLlmUserPerDay) {
    return { largeModelLimit, slimModelLimit };
  }

  const daysUnitEndOfMonth = getDaysUntilEndOfMonth();
  const estimatedUsersMonthEnd = Math.ceil(averageLlmUserPerDay * daysUnitEndOfMonth);
  const estimatedLargeModelUsage = estimatedUsersMonthEnd * LLM_LARGE_MODEL_USER_LIMIT;
  const estimatedSlimModelUsage = estimatedUsersMonthEnd * LLM_SLIM_MODEL_USER_LIMIT;

  const { totalLarge, totalSlim } = await getTokenConsumedForMonth(date);

  if (estimatedLargeModelUsage + totalLarge > LLM_LARGE_MODEL_GLOBAL_LIMIT) {
    if (totalLarge >= LLM_LARGE_MODEL_GLOBAL_LIMIT) {
      largeModelLimit = 0;
    } else {
      // the number of use of large model redistributed to all the remaining users
      const largeModelLimitRedistributed = Math.round((LLM_LARGE_MODEL_GLOBAL_LIMIT - totalLarge) / estimatedUsersMonthEnd);
      // to avoid to go under the min_limit, we get the max between the redistributed_value and the min_limit
      largeModelLimit = Math.max(
        Math.min(largeModelLimitRedistributed, LLM_LARGE_MODEL_USER_LIMIT), // security - in case of bug, we don't want to go over LLM_LARGE_MODEL_USER_LIMIT
        LLM_LARGE_MODEL_USER_MIN,
      );
    }
  }

  if (estimatedSlimModelUsage + totalSlim > LLM_SLIM_MODEL_GLOBAL_LIMIT) {
    if (totalSlim >= LLM_SLIM_MODEL_GLOBAL_LIMIT) {
      slimModelLimit = 0;
    } else {
      // the number of use of slim model redistributed to all the remaining users
      const slimModelLimitRedistributed = Math.round((LLM_SLIM_MODEL_GLOBAL_LIMIT - totalSlim) / estimatedUsersMonthEnd);
      // to avoid to go under the min_limit, we get the max between the redistributed_value and the min_limit
      slimModelLimit = Math.max(
        Math.min(slimModelLimitRedistributed, LLM_SLIM_MODEL_USER_LIMIT), // security - in case of bug, we don't want to go over LLM_SLIM_MODEL_USER_LIMIT
        LLM_SLIM_MODEL_USER_MIN,
      );
    }
  }
  return { largeModelLimit, slimModelLimit };
}

export async function getLlmLimiterForConversation(conversation) {
  const { user } = conversation;
  const ipAddress = conversation.ip.address;

  // find llmLimiter by user or ipAdress
  let llmLimiter = await LlmLimiterModel.findOne({
    $or: [{ user }, { ipAddress }],
  });

  // if too old, reinit limit
  if (llmLimiter && llmLimiter.isTooOld()) {
    const { largeModelLimit, slimModelLimit } = await getLlmUserLimit();
    llmLimiter.largeModelLimit = largeModelLimit;
    llmLimiter.slimModelLimit = slimModelLimit;
    llmLimiter.largeModelCount = 0;
    llmLimiter.slimModelCount = 0;
    await llmLimiter.save();
  }

  if (!llmLimiter) {
    const { largeModelLimit, slimModelLimit } = await getLlmUserLimit();

    llmLimiter = await LlmLimiterModel.create({
      user,
      ipAddress,
      largeModelLimit,
      slimModelLimit,
    });
  }
  return llmLimiter;
}

export async function getModelFromLimiter(llmLimiter) {
  const OPENAI_SLIM_MODEL = await getSetting('OPENAI_SLIM_MODEL');
  const OPENAI_LARGE_MODEL = await getSetting('OPENAI_LARGE_MODEL');
  const modelSize = llmLimiter.whichModelToUse();
  switch (modelSize) {
    case MODEL_SIZE.LARGE:
      return { modelSize, model: OPENAI_LARGE_MODEL };
    case MODEL_SIZE.SLIM:
      return { modelSize, model: OPENAI_SLIM_MODEL };
    default:
      return { modelSize: null, model: null };
  }
}

export async function incrementModelCount(llmLimiter, modelSize) {
  llmLimiter.incrementModelCount(modelSize);
  await llmLimiter.save();
}
