const fs = require("fs");

const LOG_FILE = 'server.log';
fs.writeFileSync(LOG_FILE, '');

const originalLog = console.log;
const originalError = console.error;

function formatLogMessage(type, category, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  const categoryPrefix = category ? `[${category}] ` : '';
  const message = args.join(' ');
  return `[${timestamp}] ${categoryPrefix}${type ? `[${type}] ` : ''}${message}`;
}

const createLogger = (originalConsoleMethod, type, defaultCategory = '') => (...args) => {
  let category = defaultCategory;
  let messageArgs = args;
  
  if (typeof args[0] === 'string' && args[0].match(/^[A-Z_]+$/)) {
    category = args[0];
    messageArgs = args.slice(1);
  }

  const formattedMessage = formatLogMessage(type, category, ...messageArgs);
  originalConsoleMethod(formattedMessage);
  fs.appendFileSync(LOG_FILE, formattedMessage + '\n');
};

const customConsole = {};

customConsole.log = createLogger(originalLog, '', '');
customConsole.error = createLogger(originalError, 'ERROR', '');

customConsole.log.user = createLogger(originalLog, '', 'USER');
customConsole.log.server = createLogger(originalLog, '', 'SERVER');
customConsole.log.api = createLogger(originalLog, '', 'API');

customConsole.error.os = createLogger(originalError, 'ERROR', 'OS');
customConsole.error.shutdown = createLogger(originalError, 'ERROR', 'SHUTDOWN');

global.console = customConsole;

exports.LOG_FILE = LOG_FILE;