import express from 'express';
import basicAuth from 'express-basic-auth';
import { ADMIN_PASSWORD, ADMIN_USER } from './config.js';
import { cleanDb } from './controllers/dbController/cleanDb.js';
import { testMail } from './controllers/emailController.js';
import routerLLM from './route/llmRoute.js';
import start from './route/startRoute.js';

const router = express.Router();

router.get('/ping', (req, res) => {
  res.send('pong');
});

router.get('/test_mail', basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASSWORD },
}), async (req, res) => {
  try {
    await testMail();
    res.send({
      message: 'success',
    });
  } catch (e) {
    res.status(500).send({
      message: 'error',
      error: e.message,
    });
  }
});

router.post('/clean_db', basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASSWORD },
}), async (req, res) => {
  try {
    const {
      deletedMessages,
      deletedConversations,
      deletedUsers,
      deletedLlmLimiter,
      dataSizeGB,
    } = await cleanDb();
    res.send({
      message: 'success',
      deletedMessages,
      deletedConversations,
      deletedUsers,
      deletedLlmLimiter,
      dataSizeGB,
    });
  } catch (e) {
    res.status(500).send({
      message: 'error',
      error: e.message,
    });
  }
});

router.post('/start', start);

router.use('/llm', routerLLM);

export default router;
