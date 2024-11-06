import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';
import util from 'util';

import { AWS_CLOUDWATCH_GROUP, AWS_CLOUDWATCH_STREAM, IS_PRODUCTION } from '../config.js';

let cloudwatchClient;
export const LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

function parseObjectToLog(obj, { colors = true } = {}) {
  try {
    if (obj instanceof Error) {
      try {
        return util.inspect({
          name: obj.name,
          message: obj.message,
          stack: obj.stack,
          ...obj,
        }, { showHidden: false, depth: null, colors });
      } catch (err) {
        return util.inspect({
          name: obj.name,
          message: obj.message,
          stack: obj.stack,
        }, { showHidden: false, depth: null, colors });
      }
    }
    return util.inspect(obj, { showHidden: false, depth: null, colors });
  } catch (err) {
    return obj.toString();
  }
}

function generateLogEntry(
  {
    userId = null, conversationId = null, level = LEVELS.INFO, colors = true,
  },
  message,
  ...rest
) {
  let logMessage = '';
  if (userId && conversationId) {
    logMessage = `${level} - User[${userId}] Conversation[${conversationId}]: ${message}`;
  } else if (userId) {
    logMessage = `${level} - User[${userId}]: ${message}`;
  } else {
    logMessage = `${level} - ${message}`;
  }

  const parsedRest = (rest || []).map((item) => {
    try {
      if (typeof item === 'object') {
        return parseObjectToLog(item, { colors });
      }
      if (item === undefined) {
        return 'undefined';
      }
      if (item === null) {
        return 'null';
      }
      return item.toString();
    } catch (error) {
      return `[Error parsing log item: ${error.message}]`;
    }
  });
  if (parsedRest.length > 0) logMessage = `${logMessage}\n${parsedRest.join('\n')}`;

  return logMessage;
}

export async function log(
  {
    userId = null,
    conversationId = null,
    level = LEVELS.INFO,
    withStdOut = false,
  },
  message,
  ...rest
) {
  if (IS_PRODUCTION && !cloudwatchClient) {
    cloudwatchClient = new CloudWatchLogsClient({
      region: 'eu-west-3',
    });
  }

  if (IS_PRODUCTION) {
    const command = new PutLogEventsCommand({
      logGroupName: AWS_CLOUDWATCH_GROUP,
      logStreamName: AWS_CLOUDWATCH_STREAM,
      logEvents: [
        {
          message: generateLogEntry({
            userId, conversationId, level, colors: false,
          }, message, ...rest),
          timestamp: Date.now(),
        },
      ],
    });
    cloudwatchClient.send(command).catch((err) => {
      console.error('Error logging to Cloudwatch:', {
        userId, conversationId, level, message, rest,
      }, err);
    });
  }

  if (!IS_PRODUCTION || withStdOut) {
    const loggingFunc = (
      { [LEVELS.INFO]: console.info, [LEVELS.WARN]: console.warn, [LEVELS.ERROR]: console.error }[level]
      || console.info
    );
    loggingFunc(generateLogEntry({
      userId, conversationId, level, color: true,
    }, message, ...rest));
  }
}

export default log;

export async function logInfo(config, message, ...rest) {
  return log({ ...config, level: LEVELS.INFO }, message, ...rest);
}

export async function logWarn(config, message, ...rest) {
  return log({ ...config, level: LEVELS.WARN }, message, ...rest);
}

export async function logError(config, message, ...rest) {
  return log({ ...config, level: LEVELS.ERROR }, message, ...rest);
}
