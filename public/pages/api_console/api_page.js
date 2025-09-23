import { html } from "../../setup/dom.js";
import { appendOutput, makeRequest } from "./apiUtils.js";
import { fetchEndpoints } from "./apiService.js";
import { API_CONSOLE_TEXTAREA_DEFAULT_ROWS } from "../../settings/api_consoleSettings.js";

export function App() {
  const page = html`
    <link rel="stylesheet" href="/public/pages/api_console/api_console.css">
    <div class="api-console">
      <div class="api-header">
        <h1>API-Konsole</h1>
        <p>Testen und überwachen Sie Ihre API-Endpunkte</p>
      </div>

      <div class="api-grid">
        <div class="card api-controls">
          <div class="card-header">
            <div class="card-title">🌐 API-Endpunkte</div>
            <div class="card-description">Testen Sie verfügbare API-Endpunkte</div>
          </div>

          <div class="endpoint-group">
            <h3>Benutzerdefinierte Anfrage</h3>
            <div class="custom-request">
              <div class="request-builder">
                <select id="method_select" class="method-select">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input id="url_input" type="text" placeholder="/api/v1/endpoint" class="url-input" />
                <button id="custom_send_btn" class="btn btn-secondary">Senden</button>
              </div>
              <textarea id="body_input" placeholder="Anfragetext (JSON)" rows="${API_CONSOLE_TEXTAREA_DEFAULT_ROWS}" style="margin-top: var(--space-sm); width: 100%;"></textarea>
            </div>
          </div>

          <div class="endpoint-group">
            <h3>Systemprüfung</h3>
            <div class="endpoint-item">
              <div class="endpoint-info">
                <span class="method-badge get">GET</span>
                <code>/api/v1/hello</code>
              </div>
              <button id="send_btn" class="btn btn-primary">Testen</button>
            </div>
          </div>

          <div class="endpoint-group">
            <h3>Fehler-Simulation</h3>
            <div class="endpoint-item">
              <div class="endpoint-info">
                <span class="method-badge get">GET</span>
                <code>/api/v1/meta/test-error</code>
              </div>
              <button id="test_error_btn" class="btn btn-danger">Fehler auslösen</button>
            </div>
          </div>

          <div class="endpoint-group">
            <h3>Systemsteuerung</h3>
            <div class="endpoint-item">
              <div class="endpoint-info">
                <span class="method-badge post">POST</span>
                <code>/api/v1/shut</code>
              </div>
              <button id="shut_btn" class="btn btn-danger">Herunterfahren</button>
            </div>
          </div>

          <div class="endpoint-group">
            <div style="display:flex; align-items:center; justify-content:space-between; gap: var(--space-sm);">
              <h3>Entdeckte Endpunkte</h3>
              <button id="refresh_endpoints_btn" class="btn btn-secondary btn-sm">Aktualisieren</button>
            </div>
            <div id="endpoints_list" class="endpoints-list"></div>
          </div>
        </div>

        <div class="card api-output">
          <div class="card-header">
            <div class="card-title">📊 Antwort</div>
            <div class="card-description">API-Antwort und Protokolle</div>
            <button id="clear_btn" class="btn btn-ghost btn-sm">Leeren</button>
          </div>
          <div id="output" class="output api-response"></div>
        </div>
      </div>
    </div>
  `;

  return page;
}

export function onMount(rootElement) {
  const output = rootElement.querySelector("#output");
  const methodSelect = rootElement.querySelector("#method_select");
  const urlInput = rootElement.querySelector("#url_input");
  const bodyInput = rootElement.querySelector("#body_input");
  const endpointsList = rootElement.querySelector('#endpoints_list');
  const refreshEndpointsBtn = rootElement.querySelector('#refresh_endpoints_btn');
  const testErrorBtn = rootElement.querySelector("#test_error_btn");
  const sendBtn = rootElement.querySelector("#send_btn");
  const shutBtn = rootElement.querySelector("#shut_btn");
  const customSendBtn = rootElement.querySelector("#custom_send_btn");
  const clearBtn = rootElement.querySelector("#clear_btn");

  appendOutput(output, 'API-Konsole bereit. Wählen Sie einen Endpunkt zum Testen aus.', 'info');

  sendBtn.addEventListener("click", () => {
    makeRequest(output, 'GET', '/api/v1/hello');
  });

  testErrorBtn.addEventListener("click", () => {
    makeRequest(output, 'GET', '/api/v1/meta/test-error');
  });

  shutBtn.addEventListener("click", async () => {
    const confirmed = window.confirm("Möchten Sie den Server wirklich herunterfahren?");
    if (!confirmed) return;
    makeRequest(output, 'POST', '/api/v1/shut');
  });
  
  customSendBtn.addEventListener("click", () => {
    const method = methodSelect.value;
    const url = urlInput.value.trim();
    const body = bodyInput.value.trim();
    
    if (!url) {
      appendOutput(output, 'Bitte geben Sie eine URL ein', 'error');
      return;
    }
    
    makeRequest(output, method, url, body || null);
  });
  
  clearBtn.addEventListener("click", () => {
    output.innerHTML = '';
    appendOutput(output, 'Ausgabe geleert', 'info');
  });

  const loadEndpoints = async (outputElement) => {
    const endpoints = await fetchEndpoints((msg, type) => appendOutput(outputElement, msg, type));

    endpoints.sort((a, b) => (a.path.localeCompare(b.path)) || (a.method.localeCompare(b.method)));

    endpointsList.innerHTML = endpoints.map(ep => `
      <div class="endpoint-item">
        <div class="endpoint-info">
          <span class="method-badge ${ep.method.toLowerCase()}">${ep.method}</span>
          <code>${ep.path}</code>
        </div>
        <div class="endpoint-actions">
          <button class="btn btn-secondary btn-sm ep-fill" data-method="${ep.method}" data-path="${ep.path}">Füllen</button>
          <button class="btn btn-primary btn-sm ep-run" data-method="${ep.method}" data-path="${ep.path}">Ausführen</button>
        </div>
      </div>
    `).join('');
  };

  endpointsList.addEventListener('click', (e) => {
    const runBtn = e.target.closest('.ep-run');
    const fillBtn = e.target.closest('.ep-fill');
    const targetBtn = runBtn || fillBtn;
    if (!targetBtn) return;

    const method = targetBtn.getAttribute('data-method');
    const path = targetBtn.getAttribute('data-path');

    if (fillBtn) {
      methodSelect.value = method.toUpperCase();
      urlInput.value = path;
      appendOutput(output, `Anfrage-Builder mit ${method} ${path} gefüllt`, 'info');
      return;
    }

    if (runBtn) {
      const body = bodyInput.value.trim();
      makeRequest(output, method.toUpperCase(), path, body || null);
    }
  });

  refreshEndpointsBtn.addEventListener('click', () => loadEndpoints(output));
  
  loadEndpoints(output);
}
