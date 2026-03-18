import _ from 'lodash';
import { OpenRouter } from '@openrouter/sdk';
import { OPENROUTER_API_KEY } from '../../config.js';
import { getSetting } from '../settingController.js';
import { getTokensLength } from './token.js';
// https://redis.io/learn/howtos/solutions/vector/getting-started-vector

export const llmClient = new OpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

/**
 * Creates a prompt by replacing placeholders in the prompt template with provided knowledge matches and user question.
 *
 * @param {Array} knowledgesMatch - An array of objects containing knowledge matches.
 * @param {string} knowledgesMatch[].knowledgeText - The knowledge text to be included in the prompt.
 * @param {string} userQuestion - The user's question to be included in the prompt.
 * @param {string} [promptTemplate=LLM_PROMPT] - The template for the prompt with placeholders for knowledges and user question.
 * @returns {string} The generated prompt with the placeholders replaced.
 */
export async function createPrompt(knowledgesMatch, userQuestion, promptTemplate = null) {
  const LLM_PROMPT = await getSetting('LLM_PROMPT');
  if (!promptTemplate) {
    promptTemplate = LLM_PROMPT;
  }
  const knowledges = knowledgesMatch.map((k) => k.knowledgeText).join('\n');
  let prompt = promptTemplate;
  if (promptTemplate.includes('{{knowledges}}')) {
    prompt = prompt.replace('{{knowledges}}', knowledges);
  }
  if (promptTemplate.includes('{{userQuestion}}')) {
    prompt = prompt.replace('{{userQuestion}}', userQuestion);
  }
  if (promptTemplate.includes('{{datetime}}')) {
    prompt = prompt.replace('{{datetime}}', `${new Date().toDateString()} ${new Date().toTimeString()}`);
  }
  return prompt;
}

/**
 * Fetches a response from the LLM based on the provided prompt and user settings.
 *
 * @param {string} prompt - The prompt to send to the LLM.
 * @param {string} userId - The ID of the user making the request.
 * @param {Object} options - Optional settings for the LLM.
 * @param {string} [options.model] - The model to use for generating the response.
 * @param {number} [options.frequencyPenalty=0] - Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
 * @param {number} [options.presencePenalty=0] - Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
 * @param {number} [options.temperature=1] - What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
 * @returns {Promise<Object>} The response from the LLM (chat completion or stream).
 * @throws Will throw an error if the API request fails.
 */
export async function fetchLlmResponse(prompt, userQuestion, userId, previousMessages = [], {
  model,
  frequencyPenalty = 0,
  presencePenalty = 0,
  temperature = 1,
  stream = false,
} = {}) {
  return llmClient.chat.send({
    chatGenerationParams: {
      model,
      frequencyPenalty,
      presencePenalty,
      temperature,
      user: userId?.toString(),
      stream,
      messages: [
        { role: 'system', content: prompt },
        ...(
          _.flatMap(previousMessages, ({ user, assistant }) => [
            { role: 'user', content: user },
            { role: 'assistant', content: assistant },
          ])
        ),
        { role: 'user', content: userQuestion },
      ],
    },
  });
}

/**
 * Fetches a response from the LLM based on the provided prompt and user settings.
 *
 * @param {string} prompt - The prompt to send to the LLM.
 * @param {string} userId - The ID of the user making the request.
 * @param {Object} options - Optional settings for the LLM.
 * @param {string} [options.model] - The model to use for generating the response.
 * @param {number} [options.frequencyPenalty=0] - Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
 * @param {number} [options.presencePenalty=0] - Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
 * @param {number} [options.temperature=1] - What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
 * @returns {Promise<{response: string, totalTokens: number}>} The response from the LLM.
 * @throws Will throw an error if the API request fails.
 */
export async function getLlmResponse(prompt, userQuestion, userId, previousMessages = [], options = {}) {
  const response = await fetchLlmResponse(prompt, userQuestion, userId, previousMessages, options);

  if (response?.choices?.length === 0) {
    return {};
  }

  return {
    response: response.choices[0].message.content,
    totalTokens: response.usage?.totalTokens,
  };
}

/**
 * Streams a response from the LLM based on the provided prompt and user settings.
 *
 * @param {string} prompt - The prompt to send to the LLM.
 * @param {string} userQuestion - The question asked by the user.
 * @param {string} userId - The ID of the user making the request.
 * @param {Object} options - Optional settings for the LLM.
 * @param {string} [options.model] - The model to use for generating the response.
 * @param {number} [options.frequencyPenalty=0] - Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
 * @param {number} [options.presencePenalty=0] - Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
 * @param {number} [options.temperature=1] - What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
 * @yields {Object} An object containing the current content, full response, and a boolean indicating if the stream is done.
 * @returns {Promise<{response: string, totalTokens: number}>} A promise that resolves when the streaming is complete.
 * @throws Will throw an error if the API request fails.
 */
export async function* streamLlmResponse(
  prompt,
  userQuestion,
  userId,
  previousMessages = [],
  options = {},
) {
  let response = '';

  const stream = await fetchLlmResponse(prompt, userQuestion, userId, previousMessages, {
    ...options,
    stream: true,
  });

  // eslint-disable-next-line no-restricted-syntax
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    response += content;
    yield {
      response,
      isDone: false,
      isStreamDone: !!chunk.choices[0]?.finishReason,
      content,
    };
  }

  const systemPromptToken = await getTokensLength(prompt, options.model);
  const questionToken = await getTokensLength(userQuestion, options.model);
  const promptToken = systemPromptToken + questionToken + 11;
  const responseToken = await getTokensLength(response, options.model);

  yield {
    response,
    isDone: true,
    isStreamDone: true,
    totalTokens: promptToken + responseToken,
  };
}
