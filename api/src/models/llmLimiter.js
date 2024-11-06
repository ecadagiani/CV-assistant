import mongoose from 'mongoose';
import { MODEL_SIZE } from '../constants.js';

const { Schema } = mongoose;

const LlmLimiter = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ipAddress: { type: String, required: true },
  largeModelLimit: { type: Number, required: true },
  slimModelLimit: { type: Number, required: true },
  largeModelCount: { type: Number, default: 0 },
  slimModelCount: { type: Number, default: 0 },
}, { timestamps: true, strict: false });

LlmLimiter.index({ user: 1, ipAddress: 1 }); // can be unique, but it's not necessary, and it will cost some performance
LlmLimiter.index({ updatedAt: 1 });

function isLargeModelLimitReached() {
  return this.largeModelCount >= this.largeModelLimit;
}
function isSlimModelLimitReached() {
  return this.slimModelCount >= this.slimModelLimit;
}
function isLimitReached() {
  return this.isLargeModelLimitReached() || this.isSlimModelLimitReached();
}
function whichModelToUse() {
  if (!this.isLargeModelLimitReached()) {
    return MODEL_SIZE.LARGE;
  }
  if (!this.isSlimModelLimitReached()) {
    return MODEL_SIZE.SLIM;
  }
  return null;
}
function incrementModelCount(modelSize) {
  if (modelSize === MODEL_SIZE.LARGE) {
    this.largeModelCount += 1;
  } else if (modelSize === MODEL_SIZE.SLIM) {
    this.slimModelCount += 1;
  } else {
    throw new Error('Invalid model size: ', modelSize);
  }
}

function isTooOld(date = new Date()) {
  const updatedAt = new Date(this.updatedAt);
  const firstAtMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  // Check if it's from last month
  const isLastMonthOlder = updatedAt < firstAtMonth;

  // Check if it's more than 15 days ago
  const fifteenDaysAgo = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 15);
  const isOver15DaysAgo = updatedAt < fifteenDaysAgo;

  return isLastMonthOlder && isOver15DaysAgo;
}

LlmLimiter.methods.isLargeModelLimitReached = isLargeModelLimitReached;
LlmLimiter.methods.isSlimModelLimitReached = isSlimModelLimitReached;
LlmLimiter.methods.isLimitReached = isLimitReached;
LlmLimiter.methods.whichModelToUse = whichModelToUse;
LlmLimiter.methods.incrementModelCount = incrementModelCount;
LlmLimiter.methods.isTooOld = isTooOld;

const LlmLimiterModel = mongoose.model('LlmLimiter', LlmLimiter);

export default LlmLimiterModel;
