import _ from 'lodash';
import { formatConversationToFront } from '../controllers/formatController.js';
import { getIpData, isCountryBanned, isIpBanned } from '../controllers/ipController.js';
import { getSetting } from '../controllers/settingController.js';
import Conversation from '../models/conversation.js';
import User from '../models/user.js';
import rateLimiters from '../rateLimiters.js';
import { logError, logInfo } from '../utils/logger.js';

async function start(req, res) {
  try {
    let user;
    let conversation;
    let ipData;

    // RATE LIMIT PER IP
    try {
      await rateLimiters.startPerIp.consume(req);
    } catch (err) {
      if (err instanceof Error) {
        logError({}, 'on consume startPerIp rateLimiter', req.ip, err);
      }
      return res.status(429).json('Too Many Requests');
    }

    // CHECK IF IP IS BANNED
    try {
      const isIpBan = await isIpBanned(req.ip);
      if (isIpBan) {
        logInfo(
          { userId: req.body?.userId, conversationId: req.body?.conversationId },
          `Banned IP detected - ${req.ip}`,
        );
        return res.status(403).json('Forbidden');
      }
    } catch (err) {
      logError({}, 'isIpBanned error', req.ip, err);
      return res.status(403).json('Forbidden');
    }

    // FIND USER AND CONVERSATION
    const userId = req.body?.userId;
    const conversationId = req.body?.conversationId;
    const allConversations = req.body?.allConversations || false;
    if (userId) {
      user = await User.findById(req.body.userId)
        .populate({ path: 'conversations', populate: { path: 'messages', options: { sort: { createdAt: -1 } } } });
      if (conversationId && user) {
        conversation = await Conversation.findOneWithPopulate({ _id: conversationId, user: userId });
      } else if (user && allConversations) {
        conversation = _.last(user.conversations);
      }
    } else if (conversationId) {
      conversation = await Conversation.findByIdWithPopulate(req.body.conversationId);
      if (conversation) {
        user = await User.findById(conversation.user)
          .populate({ path: 'conversations', populate: { path: 'messages', options: { sort: { createdAt: -1 } } } });
      }
    }

    // CHECK IF IP COUNTRY IS BANNED
    if (conversation) {
      const isCountryBan = await isCountryBanned(conversation?.ip?.country);
      if (isCountryBan) {
        return res.status(403).json('Forbidden');
      }
    } else {
      try {
        ipData = await getIpData(req.ip);
        const isCountryBan = await isCountryBanned(ipData.country);
        if (isCountryBan) {
          return res.status(403).json('Forbidden');
        }
      } catch (err) {
        logError({ userId: req.body?.userId, conversationId: req.body?.conversationId }, 'start - getIpData error', err);
        // do not return error, or block user
      }
    }

    // CHECK IF LANGUAGE IS PROVIDED
    if (!req.body?.language) {
      return res.status(400).json('Missing language');
    }

    logInfo({ userId: req.body.userId, conversationId: req.body.conversationId }, 'start');

    // CREATE USER
    if (!user) {
      user = await User.create({});
      logInfo({ userId: user._id }, 'start - user created');
    }

    // CREATE CONVERSATION
    if (!conversation) {
      const ORIGIN_QUERY_MAX_LENGTH = await getSetting('ORIGIN_QUERY_MAX_LENGTH');
      const origin = typeof req.body.origin === 'string' ? req.body.origin : '';
      conversation = await Conversation.create({
        user: user._id,
        ip: {
          address: req.ip,
          country: ipData?.country,
          region: ipData?.region,
          city: ipData?.city,
        },
        userAgent: req.get('User-Agent'),
        origin: origin.trim().slice(0, ORIGIN_QUERY_MAX_LENGTH),
        language: req.body.language,
      });

      user.conversations.push(conversation._id);
      await user.save();
      logInfo({ userId: user._id, conversationId: conversation._id }, 'start - conversation created');
    }

    // send olds messages from all previous conversations
    if (allConversations && user.conversations.length > 0) {
      const conversations = user.conversations.map(formatConversationToFront);
      const { input, buttons } = _.last(conversations);
      const responses = _.flatten(conversations.map((conv) => conv.responses));
      logInfo({ userId: user._id, conversationId: conversation._id }, 'start - send all conversations');
      return res.json({
        userId: user._id,
        conversationId: conversation._id,
        responses,
        input,
        buttons,
      });
    }

    const { responses, input, buttons } = formatConversationToFront(conversation);
    logInfo({ userId: user._id, conversationId: conversation._id }, 'start - send previous conversation');
    return res.json({
      userId: user._id,
      conversationId: conversation._id,
      responses,
      input,
      buttons,
    });
  } catch (error) {
    logError({ userId: req.body.userId, conversationId: req.body.conversationId }, 'start route error', error);
    return res.status(500).json(error.toString());
  }
}

export default start;
