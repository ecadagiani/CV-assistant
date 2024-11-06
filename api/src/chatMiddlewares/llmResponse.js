import BPromise from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { RESPONSE_ID } from '../../resources/constants/responseId.js';
import { RESPONSE_TYPE } from '../constants.js';
import { getMessageId } from '../controllers/formatController.js';
import {
  checkSemanticCache, createPrompt, getKnowledges, parsePreviousMessagesForLLM, streamLlmResponse,
} from '../controllers/llmController/index.js';
import { getLlmLimiterForConversation, getModelFromLimiter, incrementModelCount } from '../controllers/llmController/limiter.js';
import { addResponseToSemanticCache, createSemanticCache } from '../controllers/llmController/semanticCache.js';
import { getResponse } from '../controllers/responsesController/responses.js';
import { getSetting } from '../controllers/settingController.js';
import { logError, logInfo } from '../utils/logger.js';
import { handleError } from './errorChat.js';

const llmResponseMiddleware = (socket, conversation) => (next) => async (message) => {
  if (message.responseId !== RESPONSE_ID.R_FALLBACK) {
    await next(message);
    return;
  }

  // check limiter
  const llmLimiter = await getLlmLimiterForConversation(conversation);
  const { modelSize, model } = await getModelFromLimiter(llmLimiter);
  if (!modelSize || !model) {
    await next(message);
    return;
  }

  const questionLanguage = message.detectedLanguage || message.language;
  const question = message.userMessage.content.text;

  // Prepare message
  message.responseId = RESPONSE_ID.R_LLM;
  message.responses = [];

  // Check semantic cache
  const {
    questionEmbedding,
    totalTokens: embeddingTokens,
    semanticCache,
  } = await checkSemanticCache(question, message._id);
  const semanticCacheResponse = (semanticCache?.responses || []).find((r) => r.language === questionLanguage);
  if (semanticCache && semanticCache.shouldUseCache && semanticCacheResponse) {
    // Response already exists in cache, and can be used. So, send it
    logInfo(
      { userId: conversation.user._id, conversationId: conversation._id },
      'LLM Response - Semantic cache catch question',
      { question },
    );

    message.responses = [{
      type: RESPONSE_TYPE.LLM_RESPONSE,
      content: { text: semanticCacheResponse.response, isVerified: semanticCache.isVerified },
    }];
    message.tokens = { embedding: embeddingTokens, completion: 0 };
    message.model = semanticCache.model;
    message.modelSize = semanticCache.modelSize;
    message.semanticCache = semanticCache._id;
    message.semanticCacheCreated = false;
    message.generated = false;
    await next(message);
    return;
  }

  // Create prompt
  const { knowledges } = await getKnowledges({ questionEmbedding });
  const prompt = await createPrompt(knowledges, question);
  const previousMessages = await parsePreviousMessagesForLLM(conversation, message);

  // Create stream
  const LLM_TIMEOUT = await getSetting('LLM_TIMEOUT');
  const streamGenerator = streamLlmResponse(
    prompt,
    question,
    conversation.user._id,
    previousMessages,
    { model },
  );

  await incrementModelCount(llmLimiter, modelSize);

  try {
    // start the stream with a timeout
    logInfo({ userId: conversation.user._id, conversationId: conversation._id }, 'LLM Response - Start stream', { question });
    await (new BPromise((resolve, reject) => streamGenerator.next().then(resolve).catch(reject))).timeout(LLM_TIMEOUT);

    // add LLM message to responses
    message.responseId = RESPONSE_ID.R_LLM;
    message.model = model;
    message.modelSize = modelSize;
    message.generated = true;
    message.responses = [{ type: RESPONSE_TYPE.LLM_RESPONSE, content: { text: '', isVerified: false } }];

    logInfo({ userId: conversation.user._id, conversationId: conversation._id }, 'LLM Response - Stream started');

    // Pass to next middleware
    await next(message);

    const execStream = async () => {
      try {
        // eslint-disable-next-line no-restricted-syntax
        for await (const chunk of streamGenerator) {
          const {
            response, isDone, isStreamDone, totalTokens,
          } = chunk;
          // send stream update to client, with message id to update the correct message
          const messageId = getMessageId(message, 0);
          socket.sendStream(messageId, response, isStreamDone);

          // if stream is done, update message with final response
          if (isDone) {
            // clean response, to avoid XSS
            const cleanedResponse = sanitizeHtml(response);

            if (semanticCache && !semanticCache.shouldUseCache) {
              // if semantic cache exists but not used, it's because the question have shouldUseCache = false
              message.semanticCache = semanticCache._id;
              message.semanticCacheCreated = false;
            } else {
              // save response in cache
              let createdSemanticCache;
              if (semanticCache) {
                // save response with new language in cache
                createdSemanticCache = await addResponseToSemanticCache({
                  semanticCache,
                  language: questionLanguage,
                  response: cleanedResponse,
                });
              } else {
                // create cache
                createdSemanticCache = await createSemanticCache({
                  question,
                  questionEmbedding,
                  prompt,
                  language: questionLanguage,
                  response: cleanedResponse,
                  model,
                  modelSize,
                  messageId: message._id,
                });
              }
              message.semanticCache = createdSemanticCache._id;
              message.semanticCacheCreated = true;
            }

            // update message with final response
            message.responses[0].content.text = cleanedResponse;
            message.markModified('responses');
            message.tokens = { embedding: embeddingTokens, completion: totalTokens };
            await message.save();
            break;
          }
        }
      } catch (err) {
        logError(
          { userId: conversation.user._id, conversationId: conversation._id },
          'LLM Response - Error in execStream',
          { question, error: err },
        );
        await handleError(err, [message], socket, conversation);
      }
    };
    execStream(); // execute the stream, without waiting for it to finish
  } catch (error) {
    if (error instanceof BPromise.TimeoutError) {
      logInfo(
        { userId: conversation.user._id, conversationId: conversation._id },
        'LLM Response - Timeout error',
        { question },
      );
      message.responseId = RESPONSE_ID.R_LLM_TIMEOUT;
      message.responses = getResponse(RESPONSE_ID.R_LLM_TIMEOUT)(message.language);
      await next(message);
    } else {
      throw error;
    }
  }
};

export default llmResponseMiddleware;
