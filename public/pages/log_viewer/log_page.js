import { html } from "../../setup/dom.js";
import { tailLogs, filterLogs, renderLogs, updateStats, formatTimestampText, downloadLogs } from "./logUtils.js";
import { fetchLogs, clearServerLogs } from "./logService.js";
import { LOG_REFRESH_INTERVAL_MS, LOG_MAX_LINES } from "../../settings/log_viewerSettings.js";

export function App() {
  
  
  const page = html`
    <div class="log-viewer">
      <div class="log-header">
        <h1>Systemprotokolle</h1>
        <p>Echtzeit-Überwachung und Protokollanalyse</p>
      </div>

      <div class="log-controls card">
        <div class="log-filters">
          <div class="filter-group">
            <label for="level_filter">Protokollstufe:</label>
            <select id="level_filter">
              <option value="all">Alle Stufen</option>
              <option value="error">Fehler</option>
              <option value="warn">Warnung</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="module_filter">Modul:</label>
            <select id="module_filter">
              <option value="all">Alle Module</option>
              <option value="server">Server</option>
              <option value="api">API</option>
              <option value="database">Datenbank</option>
              <option value="auth">Authentifizierung</option>
              <option value="cache">Cache</option>
              <option value="monitor">Überwachung</option>
              <option value="external">Extern</option>
            </select>
          </div>
          
        </div>

        <div class="log-actions">
          <input type="text" id="search_input" class="log-search" placeholder="Protokolle durchsuchen..." />
          
          <button id="clear_btn" class="btn btn-ghost">Leeren</button>
          <button id="export_btn" class="btn btn-ghost">Exportieren</button>
        </div>
      </div>

      <div class="log-stats">
        <div class="stat-badge error">
          <span class="stat-count" id="error_count">0</span>
          <span class="stat-label">Fehler</span>
        </div>
        <div class="stat-badge warning">
          <span class="stat-count" id="warn_count">0</span>
          <span class="stat-label">Warnungen</span>
        </div>
        <div class="stat-badge info">
          <span class="stat-count" id="info_count">0</span>
          <span class="stat-label">Infos</span>
        </div>
        <div class="stat-badge debug">
          <span class="stat-count" id="debug_count">0</span>
          <span class="stat-label">Debug</span>
        </div>
      </div>

      <div class="card log-container">
        <div class="card-header">
          <div class="card-title">📋 Live-Protokolle</div>
          <div class="log-status">
            <span class="status-indicator active"></span>
            <span>Live</span>
          </div>
        </div>
        <div id="log_output" class="log-output"></div>
      </div>
    </div>
  `;

  return page;
}

export function onMount(rootElement) {
  const logOutput = rootElement.querySelector('#log_output');
  const levelFilter = rootElement.querySelector('#level_filter');
  const moduleFilter = rootElement.querySelector('#module_filter');
  const searchInput = rootElement.querySelector('#search_input');
  const clearBtn = rootElement.querySelector('#clear_btn');
  const exportBtn = rootElement.querySelector('#export_btn');

  const errorCount = rootElement.querySelector('#error_count');
  const warnCount = rootElement.querySelector('#warn_count');
  const infoCount = rootElement.querySelector('#info_count');
  const debugCount = rootElement.querySelector('#debug_count');

  let logs = [];
  let filteredLogs = [];
  let logsInterval = null;
  const logStatusIndicator = rootElement.querySelector('.status-indicator');
  const logStatusText = rootElement.querySelector('.log-status span:last-child');

  const startLogRefresh = (interval) => {
    if (logsInterval) clearInterval(logsInterval);
    logsInterval = setInterval(fetchLogsProxy, interval);
    logStatusIndicator.classList.add('active');
    logStatusText.textContent = 'Live';
    logOutput.classList.remove('hidden');
  };

  const stopLogRefresh = () => {
    if (logsInterval) {
      clearInterval(logsInterval);
      logsInterval = null;
    }
    logStatusIndicator.classList.remove('active');
    logStatusText.textContent = 'Getrennt';
    logOutput.classList.add('hidden');
  };

  const filterLogsProxy = () => {
    filteredLogs = filterLogs(logs, logOutput, levelFilter, moduleFilter, searchInput, errorCount, warnCount, infoCount, debugCount, renderLogs);
  };

  const fetchLogsProxy = async () => {
    const result = await fetchLogs(logs, filterLogsProxy);
    logs = result.logs;
    if (!result.success) {
      stopLogRefresh();
    }
  };

  levelFilter.addEventListener('change', filterLogsProxy);
  moduleFilter.addEventListener('change', filterLogsProxy);
  searchInput.addEventListener('input', filterLogsProxy);
  
  clearBtn.addEventListener('click', async () => {
    logs = await clearServerLogs(logs, filterLogsProxy);
  });
  
  exportBtn.addEventListener('click', () => {
    downloadLogs(filteredLogs);
  });

  fetchLogsProxy();
  startLogRefresh(LOG_REFRESH_INTERVAL_MS);
  
  rootElement.addEventListener('unload', () => {
    if (logsInterval) {
      clearInterval(logsInterval);
    }
  });
}
