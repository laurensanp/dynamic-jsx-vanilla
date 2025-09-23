import { request } from "../../utils/api.js";

export const appendOutput = (outputElement, msg, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const typeIcon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  outputElement.innerHTML += `<div class="log-entry ${type}">[${timestamp}] ${typeIcon} ${msg}</div>`;
  outputElement.scrollTop = outputElement.scrollHeight;
};

export const makeRequest = async (outputElement, method, url, body = null) => {
  appendOutput(outputElement, `${method} ${url}`, 'info');
  const res = await request(method, url, { body });
  const statusText = res.ok ? 'success' : 'error';
  const dataOut = typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data;
  appendOutput(outputElement, `Status: ${res.status} ${res.statusText}`, statusText);
  appendOutput(outputElement, `Response: ${dataOut}`, statusText);
};
