const fs = require("fs");

const LOG_FILE = 'server.log';
fs.writeFileSync(LOG_FILE, '');

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  originalLog(...args);
  const timestamp = new Date().toLocaleTimeString();
  const message = `[${timestamp}] ${args.join(' ')}`;
  fs.appendFileSync(LOG_FILE, message + '\n');
};

console.error = (...args) => {
  originalError(...args);
  const timestamp = new Date().toLocaleTimeString();
  const message = `[${timestamp}] ERROR: ${args.join(' ')}`;
  fs.appendFileSync(LOG_FILE, message + '\n');
};

exports.LOG_FILE = LOG_FILE;
