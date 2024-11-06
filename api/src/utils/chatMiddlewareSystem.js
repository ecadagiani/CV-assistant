import { logError } from './logger.js';

function compose(middlewares, handleError) {
  if (middlewares.length === 0) {
    return (arg) => arg;
  }

  if (middlewares.length === 1) {
    return middlewares[0];
  }

  // return a function, who call the first middleware with the next function and the arg
  return middlewares.reduce((acc, middleware) => (nextMiddleware) => {
    // loop throught each middleware and create a new function, with all previous encapsuled in it
    const middlewareWithNext = middleware(nextMiddleware);
    return acc(async (...args) => {
      // Create a new function who encapsuled actual middleware with try catch block
      try {
        await middlewareWithNext(...args);
      } catch (err) {
        handleError(err, args);
      }
    });
  }); // no initial value, acc is the first middleware, and reduce start to loop from the second middleware
}

class ChatMiddlewareSystem {
  constructor(socket, conversation) {
    this.errorMiddlewares = [];
    this.middlewares = [];
    this.socket = socket;
    this.conversation = conversation;
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  onError(errorMiddleware) {
    this.errorMiddlewares.push(errorMiddleware);
  }

  setSocket(socket) {
    this.socket = socket;
  }

  setConversation(conversation) {
    this.conversation = conversation;
  }

  async execute(sessionArgs) {
    try {
      const middlewaresWithSocket = this.middlewares.map((middleware) => middleware(this.socket, this.conversation));
      const res = await (new Promise((resolve) => {
        try {
          const chainedMiddlewares = compose(
            middlewaresWithSocket,
            this.#handleError.bind(this),
          )(resolve);
          chainedMiddlewares(sessionArgs).catch((err) => this.#handleError(err));
        } catch (err) {
          this.#handleError(err);
        }
      }));
      return res;
    } catch (err) {
      return this.#handleError(err);
    }
  }

  #handleError(err, args) {
    if (this.errorMiddlewares.length === 0) {
      logError({}, 'ChatMiddlewareSystem, ERROR on handleError: 0 ErrorMiddleware', err);
    }
    try {
      const errorMiddlewaresWithSocket = this.errorMiddlewares.map((middleware) => middleware(this.socket, this.conversation));
      const chainedErrorMiddleware = compose(
        errorMiddlewaresWithSocket,
        this.#onErrorInErrorMiddleware.bind(this),
      )(this.#lastErrorMiddleware.bind(this));
      chainedErrorMiddleware(err, args);
    } catch (errorInMiddleware) {
      this.#onErrorInErrorMiddleware(errorInMiddleware);
    }
  }

  #lastErrorMiddleware(err) {
  }

  #onErrorInErrorMiddleware(err, args) {
    logError({}, 'ChatMiddlewareSystem: ERROR on ErrorMiddleware:', err, args);
  }
}

export default ChatMiddlewareSystem;
