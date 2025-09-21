import { html } from "../setup/dom.js";
import { request } from "../utils/api.js";

export function App() {
  const page = html`
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

          <!-- Custom Request FIRST -->
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
              <textarea id="body_input" placeholder="Anfragetext (JSON)" rows="4" style="margin-top: var(--space-sm); width: 100%;"></textarea>
            </div>
          </div>

          <!-- Quick predefined tests AFTER custom request -->
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
            <h3>Systemsteuerung</h3>
            <div class="endpoint-item">
              <div class="endpoint-info">
                <span class="method-badge post">POST</span>
                <code>/api/v1/shut</code>
              </div>
              <button id="shut_btn" class="btn btn-danger">Herunterfahren</button>
            </div>
          </div>

          <!-- Discovered endpoints remain at the bottom of this card -->
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

    <style>
      .api-console {
        padding: var(--space-xl) 0;
      }
      
      .api-header {
        text-align: center;
        margin-bottom: var(--space-2xl);
      }
      
      .api-header h1 {
        margin-bottom: var(--space-sm);
      }
      
      .api-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-xl);
        align-items: start; 
      }

      
      .api-output { 
        align-self: start; 
      }
      
      .endpoint-group {
        margin-bottom: var(--space-lg);
      }
      
      .endpoint-group h3 {
        font-size: var(--font-size-lg);
        margin-bottom: var(--space-md);
        color: var(--text-secondary);
      }
      
      .endpoint-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-sm);
      }
      
      .endpoint-info {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }
      
      .method-badge {
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        font-weight: 600;
        text-transform: uppercase;
      }
      
      .method-badge.get { background: var(--success); color: white; }
      .method-badge.post { background: var(--primary); color: white; }
      .method-badge.put { background: var(--warning); color: white; }
      .method-badge.delete { background: var(--error); color: white; }
      
      .custom-request {
        padding: var(--space-md);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
      }

      .endpoints-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }

      .endpoint-actions {
        display: flex;
        gap: var(--space-xs);
        align-items: center;
      }
      
      .request-builder {
        display: flex;
        gap: var(--space-sm);
        align-items: center;
      }
      
      .method-select {
        min-width: 80px;
      }
      
      .url-input {
        flex: 1;
      }
      
      .api-response {
        font-family: var(--font-mono);
        min-height: 300px;
        background: rgba(15, 15, 35, 0.8);
      }
      
      .btn-sm {
        padding: var(--space-xs) var(--space-sm);
        font-size: var(--font-size-xs);
      }
      
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .card-header .card-title {
        flex: 1;
      }
      
      @media (max-width: 768px) {
        .api-grid {
          grid-template-columns: 1fr;
        }
        
        .endpoint-item {
          flex-direction: column;
          gap: var(--space-sm);
          align-items: stretch;
        }
        
        .request-builder {
          flex-direction: column;
          align-items: stretch;
        }
      }
    </style>
  `;

  const sendBtn = page.querySelector("#send_btn");
  const shutBtn = page.querySelector("#shut_btn");
  const customSendBtn = page.querySelector("#custom_send_btn");
  const clearBtn = page.querySelector("#clear_btn");
  const output = page.querySelector("#output");
  const methodSelect = page.querySelector("#method_select");
  const urlInput = page.querySelector("#url_input");
  const bodyInput = page.querySelector("#body_input");
  const endpointsList = page.querySelector('#endpoints_list');
  const refreshEndpointsBtn = page.querySelector('#refresh_endpoints_btn');

  const appendOutput = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const typeIcon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    output.innerHTML += `<div class="log-entry ${type}">[${timestamp}] ${typeIcon} ${msg}</div>`;
    output.scrollTop = output.scrollHeight;
  };

  const makeRequest = async (method, url, body = null) => {
    try {
      appendOutput(`${method} ${url}`, 'info');
      const res = await request(method, url, { body });
      const statusText = res.ok ? 'success' : 'error';
      const dataOut = typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data;
      appendOutput(`Status: ${res.status} ${res.statusText}`, statusText);
      appendOutput(`Response: ${dataOut}`, statusText);
    } catch (err) {
      appendOutput(`Error: ${err.message}`, 'error');
    }
  };

  sendBtn.addEventListener("click", () => {
    makeRequest('GET', '/api/v1/hello');
  });

  shutBtn.addEventListener("click", async () => {
    const confirmed = window.confirm("Möchten Sie den Server wirklich herunterfahren?");
    if (!confirmed) return;
    makeRequest('POST', '/api/v1/shut');
  });
  
  customSendBtn.addEventListener("click", () => {
    const method = methodSelect.value;
    const url = urlInput.value.trim();
    const body = bodyInput.value.trim();
    
    if (!url) {
      appendOutput('Bitte geben Sie eine URL ein', 'error');
      return;
    }
    
    makeRequest(method, url, body || null);
  });
  
  clearBtn.addEventListener("click", () => {
    output.innerHTML = '';
    appendOutput('Ausgabe geleert', 'info');
  });

  
  async function loadEndpoints() {
    try {
      const res = await fetch('/api/v1/meta/endpoints', { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) {
        appendOutput(`Fehler beim Laden der Endpunkte: ${res.status} ${res.statusText}`, 'error');
        return;
      }
      const data = await res.json();
      const endpoints = Array.isArray(data.endpoints) ? data.endpoints : [];

      
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
    } catch (err) {
      appendOutput(`Fehler beim Laden der Endpunkte: ${err.message}`, 'error');
    }
  }

  
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
      appendOutput(`Anfrage-Builder mit ${method} ${path} gefüllt`, 'info');
      return;
    }

    if (runBtn) {
      const body = bodyInput.value.trim();
      makeRequest(method.toUpperCase(), path, body || null);
    }
  });

  refreshEndpointsBtn.addEventListener('click', loadEndpoints);

  
  appendOutput('API-Konsole bereit. Wählen Sie einen Endpunkt zum Testen aus.', 'info');
  loadEndpoints();

  return page;
}
