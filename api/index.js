import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';

import { startAdminJS } from './src/admin/admin.js';
import {
  ADMIN_ROOT_PATH, FRONT_URL, IS_PRODUCTION, PORT,
} from './src/config.js';
import connectToMongo from './src/db.js';
import initI18n from './src/i18n.js';
import { initRedis } from './src/redisClient.js';
import router from './src/router.js';
import createSocket from './src/socket.js';
import { logError, logInfo } from './src/utils/logger.js';

dotenv.config();

// file deepcode ignore UseCsurfForExpress: We don't have login, so we don't need csrf
// file deepcode ignore HttpToHttps: in prod, we have nginx to handle https

async function main() {
  const app = express();
  const server = createServer(app);
  createSocket(server);

  if (IS_PRODUCTION) {
    // in production, we use nginx as a reverse proxy, put true to use X-Forwarded-For to get the real IP
    app.set('trust proxy', true);
  }

  await initI18n();
  await connectToMongo();
  await initRedis();

  app.use(`${ADMIN_ROOT_PATH}-static`, express.static('src/admin/static'));
  if (IS_PRODUCTION) {
    // in production, we use bin/bundle-admin.js to bundle the adminjs assets, and serve them from the API
    app.use(`${ADMIN_ROOT_PATH}-bundle`, express.static('.adminjs'));
  }
  const { adminRouter } = startAdminJS();
  app.use(ADMIN_ROOT_PATH, adminRouter);

  app.use(helmet({
    crossOriginResourcePolicy: {
      policy: 'same-site',
    },
  }));

  app.use(cors({
    origin: [FRONT_URL],
  }));

  app.use(express.json());

  app.use('/api', router);

  app.use('/images', express.static('resources/images'));
  app.use('/documents', express.static('resources/documents'));
  app.use('/', express.static('client-build'));

  // Handle SIGINT and SIGTERM signals (usually sent by the 'kill' command)
  function gracefulShutdown() {
    logInfo({ withStdOut: true }, 'Received kill signal, shutting down gracefully...');
    server.close(() => {
      logInfo({ withStdOut: true }, 'Closed out remaining connections.');
      process.exit();
    });

    // Force shutdown after 5 seconds
    setTimeout(() => {
      logError({ withStdOut: true }, 'Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  }
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  server.listen(PORT, () => {
    logInfo({withStdOut: true}, `Server listening on port ${PORT}`);
  });
}

main();
