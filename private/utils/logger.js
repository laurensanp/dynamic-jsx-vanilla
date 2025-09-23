const fs = require("fs");
const { LOG_FILENAME, LOG_FILE_DELETE_ERROR, LOG_FILE_WRITE_ERROR } = require("../settings/serverLoggerSettings");

const LOG_FILE = LOG_FILENAME;
try {
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }
} catch (err) {
  console.error(`${LOG_FILE_DELETE_ERROR} ${err.message}`);
}
// The log file will now persist across server restarts.

const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);
const originalDebug = console.debug.bind(console);

function formatLogMessage(type, category, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  const categoryPrefix = category ? `[${category}] ` : '';
  const message = args.join(' ');
  return `[${timestamp}] ${type ? `[${type}] ` : ''}${categoryPrefix}${message}`;
}

const createLogger = (originalConsoleMethod, type, category = '') => (...args) => {
  // Old dynamic category parsing removed as it was not being used as intended
  // and could cause issues if messages started with all-caps words.
  // All categories are now explicitly set during customConsole definition.
  const formattedMessage = formatLogMessage(type, category, ...args);
  originalConsoleMethod(formattedMessage);
  fs.appendFile(LOG_FILE, formattedMessage + '\n', (err) => {
    if (err) {
      originalError(`${LOG_FILE_WRITE_ERROR} ${err.message}`);
    }
  });
};

const customConsole = {};

customConsole.log = createLogger(originalLog, '', '');
customConsole.error = createLogger(originalError, 'ERROR', '');
customConsole.warn = createLogger(originalWarn, 'WARN', ''); 
customConsole.debug = createLogger(originalDebug, 'DEBUG', ''); 

customConsole.log.user = createLogger(originalLog, '', 'USER');
customConsole.log.server = createLogger(originalLog, '', 'SERVER');
customConsole.log.api = createLogger(originalLog, '', 'API');

customConsole.error.os = createLogger(originalError, 'ERROR', 'OS');
customConsole.error.shutdown = createLogger(originalError, 'ERROR', 'SHUTDOWN');

global.console = customConsole;

exports.LOG_FILE = LOG_FILE;