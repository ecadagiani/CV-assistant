import BPromise from 'bluebird';
import express from 'express';
import basicAuth from 'express-basic-auth';
import {
  ADMIN_PASSWORD, ADMIN_USER,
} from '../config.js';
import {
  createPrompt, getKnowledges,
  getLlmResponse,
  populateKnowledgeBase,
} from '../controllers/llmController/index.js';
import { getSettings } from '../controllers/settingController.js';
import { readJson } from '../utils/files.js';
import { logError, logInfo } from '../utils/logger.js';

const routerLLM = express.Router();

routerLLM.post('/populate_knowledges', basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASSWORD },
}), async (req, res) => {
  try {
    const knowledges = req.body?.knowledges;

    if (!knowledges || !Array.isArray(knowledges) || knowledges.length === 0) {
      res.status(400).send({
        message: 'error',
        error: 'Invalid knowledges',
      });
      return;
    }
    for (let i = 0; i < knowledges.length; i++) {
      const knowledge = knowledges[i];
      if (!knowledge.key || !knowledge.text) {
        res.status(400).send({
          message: 'error',
          error: `Invalid knowledge, at index: ${i}`,
        });
        return;
      }
    }

    const updateIfTextChanged = req.body?.updateIfTextChanged || false;
    const forceEmbedding = req.body?.forceEmbedding || false;
    const result = await populateKnowledgeBase(knowledges, { updateIfTextChanged, forceEmbedding });

    res.send({
      message: 'success',
      result,
    });
  } catch (e) {
    logError({ withStdOut: true }, 'llm_populate_knowledges error:', e);
    res.status(500).send({
      message: 'error',
      error: e.message,
    });
  }
});

routerLLM.get('/response', basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASSWORD },
}), async (req, res) => {
  const { OPENAI_SLIM_MODEL, LLM_KNOWLEDGE_COUNT, LLM_PROMPT } = await getSettings(
    'OPENAI_SLIM_MODEL',
    'LLM_KNOWLEDGE_COUNT',
    'LLM_PROMPT',
  );

  try {
    // get query text
    const question = req.query?.question;
    const knowledgeCount = Number(req.query?.knowledgeCount || LLM_KNOWLEDGE_COUNT);
    const promptTemplate = req.query?.prompt || LLM_PROMPT;
    const model = req.query?.model || OPENAI_SLIM_MODEL;

    if (!question) {
      res.status(400).send({
        message: 'error',
        error: 'Invalid text',
      });
      return;
    }

    const { knowledges, totalTokens: embeddingTokens } = await getKnowledges({ question, resultCount: knowledgeCount });
    const prompt = await createPrompt(knowledges, question, promptTemplate);

    const { response, totalTokens } = await getLlmResponse(prompt, question, 'test', [], { model });
    res.send({
      message: 'success',
      tokens: embeddingTokens + totalTokens,
      response,
      prompt,
      knowledges,
      model,
    });
  } catch (e) {
    logError({ withStdOut: true }, 'llm_response error:', e);
    res.status(500).send({
      message: 'error',
      error: e.message,
    });
  }
});

routerLLM.post('/get_finetune', basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASSWORD },
}), async (req, res) => {
  const fineTune = [];
  let totalTokens = 0;

  try {
    let fineTuneData = req.body?.data;
    if (!fineTuneData) {
      fineTuneData = readJson('/resources/LLM/fine_tune.json');
    }

    // validate fineTuneData
    if (!fineTuneData || !Array.isArray(fineTuneData) || fineTuneData.length === 0) {
      res.status(400).send({
        message: 'error',
        error: 'Invalid fineTuneData',
      });
      return;
    }
    for (let i = 0; i < fineTuneData.length; i++) {
      if (!fineTuneData[i].user || !fineTuneData[i].assistant) {
        res.status(400).send({
          message: 'error',
          error: `Invalid fineTuneData, at index: ${i}`,
        });
        return;
      }
    }

    logInfo({}, 'Start creating fine_tune.jsonl, total length:', fineTuneData.length);
    await BPromise.map(fineTuneData, async ({ user, assistant }) => {
      const { knowledges, totalTokens: tokens } = await getKnowledges({ question: user });
      const prompt = await createPrompt(knowledges, user);

      fineTune.push({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: user },
          { role: 'assistant', content: assistant },
        ],
      });
      totalTokens += tokens;
    }, { concurrency: 2 });

    // write to jsonl file
    const jsonlData = fineTune.map((item) => JSON.stringify(item)).join('\n');

    // set headers to indicate file attachment
    res.setHeader('Content-Disposition', 'attachment; filename="fine_tune.jsonl"');
    res.setHeader('Content-Type', 'application/jsonl');

    // send jsonl file as response, without saving it
    res.send(jsonlData);
    logInfo({}, 'Successfully created fine_tune.jsonl, total tokens:', totalTokens);
  } catch (err) {
    logError({ withStdOut: true }, 'llm_get_finetune error:', err);
    res.status(500).send({
      message: 'error',
      error: err.message,
    });
  }
});

export default routerLLM;
