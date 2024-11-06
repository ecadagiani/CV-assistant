import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logInfo } from './utils/logger.js';

class RateLimiterSocketConnectionPerIp {
  constructor() {
    // 10 connections per second per IP, with no block
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'socketConnectionPerIp',
      points: 10,
      duration: 1,
      blockDuration: 0,
      inMemoryBlockOnConsumed: 10,
    });
  }

  async consume(socket) {
    return this.rateLimiter.consume(socket.handshake.address);
  }
}
class RateLimiterStartPerIp {
  constructor() {
    // 3 connections per second per IP, with 5 seconds block
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'StartPerIp',
      points: 3,
      duration: 1,
      blockDuration: 5,
      inMemoryBlockOnConsumed: 10,
    });
  }

  async consume(request) {
    return this.rateLimiter.consume(request.ip);
  }
}

class RateLimiterReplyPerUser {
  constructor() {
    // 2 message per 4 seconds per user, with 5 seconds block
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'replyPerUser',
      points: 3,
      duration: 4,
      blockDuration: 5,
      inMemoryBlockOnConsumed: 5,
    });
  }

  async consume(user) {
    try {
      return await this.rateLimiter.consume(user._id.toString());
    } catch (err) {
      if (err instanceof Error) throw err;
      err.isFirstBlock = err.consumedPoints === this.rateLimiter.points + 1;
      throw err;
    }
  }
}

class RateLimiterOneReplyAtTimePerUser {
  constructor() {
    // 1 message per 6 seconds per user, with 6 seconds block. But reward at response
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'oneReplyAtTimePerUser',
      points: 1,
      duration: 6,
      blockDuration: 6,
      inMemoryBlockOnConsumed: 6,
    });
  }

  async consume(user) {
    return this.rateLimiter.consume(user._id.toString());
  }

  async reward(user) {
    return this.rateLimiter.reward(user._id.toString(), 1);
  }
}

class RateLimiterSimpleContactPerUser {
  constructor() {
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'UserSimpleContact',
      points: 1, // 1 contact
      duration: 30, // per 20 seconds
      blockDuration: 0, // do not block user for sending too many emails
    });
  }

  async consume(user) {
    return this.rateLimiter.consume(user._id.toString());
  }

  async reward(user) {
    return this.rateLimiter.reward(user._id.toString(), 1);
  }
}

class RateLimiterSendEmail {
  constructor() {
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'sendEmail',
      points: 5, // 5 emails
      duration: 1, // per 1 second
      blockDuration: 0, // do not block
    });
  }

  async consume() {
    return this.rateLimiter.consume('sendEmail');
  }
}

class RateLimiters {
  constructor() {
    this.init();
  }

  async init() {
    logInfo({}, 'Creating rate limiters');
    this.startPerIp = new RateLimiterStartPerIp();
    this.socketConnectionPerIp = new RateLimiterSocketConnectionPerIp();
    this.replyPerUser = new RateLimiterReplyPerUser();
    this.oneReplyAtTimePerUser = new RateLimiterOneReplyAtTimePerUser();
    this.simpleContactPerUser = new RateLimiterSimpleContactPerUser();
    this.sendEmail = new RateLimiterSendEmail();
  }
}

const rateLimiters = new RateLimiters();

export default rateLimiters;
