import { html } from "../setup/dom.js";

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
          <button id="refresh_btn" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Aktualisieren
          </button>
          <button id="auto_refresh_btn" class="btn btn-secondary" data-active="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Automatisch aktualisieren
          </button>
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

    <style>
      .log-viewer {
        padding: var(--space-xl) 0;
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
        padding: var(--space-md);
      }
      
      .log-entry {
        display: flex;
        gap: var(--space-sm);
        margin-bottom: var(--space-xs);
        padding: var(--space-xs) 0;
        border-left: 3px solid transparent;
        padding-left: var(--space-sm);
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

  const logOutput = page.querySelector('#log_output');
  const levelFilter = page.querySelector('#level_filter');
  const moduleFilter = page.querySelector('#module_filter');
  const searchInput = page.querySelector('#search_input');
  const refreshBtn = page.querySelector('#refresh_btn');
  const autoRefreshBtn = page.querySelector('#auto_refresh_btn');
  const clearBtn = page.querySelector('#clear_btn');
  const exportBtn = page.querySelector('#export_btn');
  
  
  const errorCount = page.querySelector('#error_count');
  const warnCount = page.querySelector('#warn_count');
  const infoCount = page.querySelector('#info_count');
  const debugCount = page.querySelector('#debug_count');

  let logs = [];
  let filteredLogs = [];
  let autoRefreshInterval = null;
  let isAutoRefreshActive = true;

  function formatTimestampText(text) {
    
    return text || '';
  }

  function updateStats() {
    const stats = filteredLogs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});
    
    errorCount.textContent = stats.error || 0;
    warnCount.textContent = stats.warn || 0;
    infoCount.textContent = stats.info || 0;
    debugCount.textContent = stats.debug || 0;
  }

  function filterLogs() {
    const levelValue = levelFilter.value;
    const moduleValue = moduleFilter.value;
    const searchValue = searchInput.value.toLowerCase();

    filteredLogs = logs.filter(log => {
      const levelMatch = levelValue === 'all' || log.level === levelValue;
      const moduleMatch = moduleValue === 'all' || log.module === moduleValue;
      const searchMatch = !searchValue || 
        log.message.toLowerCase().includes(searchValue) ||
        log.module.toLowerCase().includes(searchValue);
      
      return levelMatch && moduleMatch && searchMatch;
    });

    renderLogs();
    updateStats();
  }

  function renderLogs() {
    const logsHTML = filteredLogs
      .sort((a, b) => b.index - a.index)
      .map(log => `
        <div class="log-entry ${log.level}">
          <span class="log-timestamp">${formatTimestampText(log.timestampText)}</span>
          <span class="log-level ${log.level}">${log.level}</span>
          <span class="log-module">[${log.module}]</span>
          <span class="log-message">${log.message}</span>
        </div>
      `).join('');

    logOutput.innerHTML = logsHTML || '<div class="log-entry info"><span class="log-message">Keine Protokolle entsprechen den aktuellen Filtern</span></div>';
  }

  function parseLogLine(line, index) {
    
    
    const m = line.match(/^\[(.*?)\]\s+\[(.*?)\]\s+(?:\[(.*?)\]\s+)?(.*)$/);
    if (!m) {
      return { index, timestampText: '', level: 'info', module: 'general', message: line };
    }
    const timestampText = m[1] || '';
    const levelRaw = (m[2] || '').toLowerCase();
    const category = (m[3] || '').toLowerCase();
    const message = (m[4] || '').trim();

    let level = 'info';
    if (levelRaw === 'error') level = 'error';
    else if (levelRaw === 'warn') level = 'warn';
    else if (levelRaw === 'debug') level = 'debug';
    
    const module = category || 'general';
    return { index, timestampText, level, module, message };
  }

  
  async function fetchLogs() {
    try {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<div class="loading" style="width: 16px; height: 16px;"></div> Wird aktualisiert...';

      const res = await fetch('/api/v1/logs', { credentials: 'same-origin', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const lines = Array.isArray(data.logs) ? data.logs : [];
        logs = lines.map((line, idx) => parseLogLine(line, idx));
        if (logs.length > 1000) logs = logs.slice(-1000).map((l, i) => ({ ...l, index: i }));
        filterLogs();
      }

      refreshBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Aktualisieren
      `;
    } catch (err) {
      console.error('Fehler beim Abrufen der Protokolle:', err);
    } finally {
      refreshBtn.disabled = false;
    }
  }

  function toggleAutoRefresh() {
    isAutoRefreshActive = !isAutoRefreshActive;
    autoRefreshBtn.dataset.active = isAutoRefreshActive;
    
    if (isAutoRefreshActive) {
      autoRefreshInterval = setInterval(() => {
        fetchLogs();
      }, 5000);
    } else {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
      }
    }
  }

  
  levelFilter.addEventListener('change', filterLogs);
  moduleFilter.addEventListener('change', filterLogs);
  searchInput.addEventListener('input', filterLogs);
  
  refreshBtn.addEventListener('click', fetchLogs);
  autoRefreshBtn.addEventListener('click', toggleAutoRefresh);
  
  clearBtn.addEventListener('click', () => {
    logs = [];
    filterLogs();
  });
  
  exportBtn.addEventListener('click', () => {
    const logData = filteredLogs.map(log => 
      `${formatTimestamp(log.timestamp)} [${log.level.toUpperCase()}] [${log.module}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  
  fetchLogs();
  toggleAutoRefresh(); 
  
  page.addEventListener('unload', () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
  });

  return page;
}
