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

    <link rel="stylesheet" href="/public/pages/log_viewer/log_viewer.css">
    <style>
      #page-content {
        max-width: 1600px;
        margin: 0 auto;
      }

      .log-viewer {
        padding: var(--space-xl) 0;
        max-width: none;
        width: 100%;
        margin-left: auto;
        margin-right: auto;
      }
      
      .log-header {
        text-align: center;
        margin-bottom: var(--space-2xl);
      }
      
      .log-header h1 {
        margin-bottom: var(--space-sm);
      }
      
      .log-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-lg);
        flex-wrap: wrap;
        gap: var(--space-md);
      }
      
      .log-filters {
        display: flex;
        gap: var(--space-md);
        flex-wrap: wrap;
      }
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
      }
      
      .filter-group label {
        font-size: var(--font-size-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }
      
      .filter-group select,
      .filter-group input {
        min-width: 120px;
      }
      
      .log-actions {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        flex-wrap: wrap;
      }

      .log-actions .log-search {
        min-width: 220px;
        padding: var(--space-sm) var(--space-md);
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: var(--font-size-sm);
      }
      
      .log-stats {
        display: flex;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .stat-badge {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        padding: var(--space-sm) var(--space-md);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
      }
      
      .stat-badge.error { background: rgba(245, 101, 101, 0.1); color: var(--error); }
      .stat-badge.warning { background: rgba(237, 137, 54, 0.1); color: var(--warning); }
      .stat-badge.info { background: rgba(66, 153, 225, 0.1); color: var(--info); }
      .stat-badge.debug { background: rgba(160, 174, 192, 0.1); color: var(--text-muted); }
      
      .stat-count {
        font-weight: 700;
        font-size: var(--font-size-lg);
      }
      
      .stat-label {
        text-transform: uppercase;
        font-size: var(--font-size-xs);
        opacity: 0.8;
      }
      
      .log-container {
        margin-bottom: var(--space-lg);
        width: 100%;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .log-status {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
        font-size: var(--font-size-sm);
        color: var(--text-muted);
      }
      
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted);
      }
      
      .status-indicator.active {
        background: var(--success);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .log-output {
        font-family: var(--font-mono);
        font-size: var(--font-size-sm);
        line-height: 1.4;
        height: 400px;
        overflow-y: auto;
        background: rgba(15, 15, 35, 0.8);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
      }
      
      .log-entry {
        display: flex;
        gap: var(--space-sm);
        margin-bottom: var(--space-xs);
        padding: var(--space-xs) 0;
        border-left: 3px solid transparent;
      }
      
      .log-entry.error { border-left-color: var(--error); }
      .log-entry.warn { border-left-color: var(--warning); }
      .log-entry.info { border-left-color: var(--info); }
      .log-entry.debug { border-left-color: var(--text-muted); }
      
      .log-timestamp {
        color: var(--text-muted);
        font-size: var(--font-size-xs);
        min-width: 80px;
        flex-shrink: 0;
      }
      
      .log-level {
        min-width: 50px;
        text-transform: uppercase;
        font-weight: 600;
        font-size: var(--font-size-xs);
        flex-shrink: 0;
      }
      
      .log-level.error { color: var(--error); }
      .log-level.warn { color: var(--warning); }
      .log-level.info { color: var(--info); }
      .log-level.debug { color: var(--text-muted); }
      
      .log-module {
        color: var(--text-accent);
        font-size: var(--font-size-xs);
        min-width: 60px;
        flex-shrink: 0;
      }
      
      .log-message {
        flex: 1;
        word-break: break-word;
      }
      
      .btn[data-active="true"] {
        background: var(--primary);
        color: white;
      }
      
      @media (max-width: 768px) {
        .log-controls {
          flex-direction: column;
          align-items: stretch;
        }
        
        .log-filters,
        .log-actions {
          justify-content: center;
        }
        
        .log-stats {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .log-entry {
          flex-direction: column;
          gap: var(--space-xs);
        }
      }
    </style>
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

  const startLogRefresh = (interval) => {
    if (logsInterval) clearInterval(logsInterval);
    logsInterval = setInterval(fetchLogsProxy, interval);
  };

  const stopLogRefresh = () => {
    if (logsInterval) {
      clearInterval(logsInterval);
      logsInterval = null;
    }
  };

  const filterLogsProxy = () => {
    filteredLogs = filterLogs(logs, logOutput, levelFilter, moduleFilter, searchInput, errorCount, warnCount, infoCount, debugCount, renderLogs);
  };

  const fetchLogsProxy = async () => {
    logs = await fetchLogs(logs, filterLogsProxy);
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

  fetchLogsProxy(); // Initial fetch
  logsInterval = setInterval(fetchLogsProxy, LOG_REFRESH_INTERVAL_MS); // Continuous 1-second interval
  
  rootElement.addEventListener('unload', () => {
    if (logsInterval) {
      clearInterval(logsInterval);
    }
  });
}
