import { html } from "../setup/dom.js";
import { get } from "../utils/api.js";

export function App() {
  let dynamicStats = {
    apiEndpoints: 0,
    activeTests: 0,
    recentLogs: 0,
    systemStatus: 'Startet…'
  };

  const getStats = () => [
    { id: 'api-endpoints', label: 'API-Endpunkte', value: dynamicStats.apiEndpoints, icon: '📡', color: 'var(--primary)' },
    { id: 'active-tests', label: 'Aktive Tests', value: dynamicStats.activeTests, icon: '✅', color: 'var(--success)' },
    { id: 'recent-logs', label: 'Neueste Protokolle', value: dynamicStats.recentLogs, icon: '📋', color: 'var(--info)' },
    { id: 'system-status', label: 'Systemstatus', value: dynamicStats.systemStatus, icon: '🟢', color: 'var(--success)' }
  ];

  const pageContent = html`
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Willkommen zur API-Konsole</h1>
        <p>Überwachen und testen Sie Ihre APIs von diesem zentralen Dashboard aus</p>
      </div>

      <div class="stats-grid">
        ${getStats().map(stat => `
          <div class="stat-card card">
            <div class="stat-icon" style="color:${stat.color}">${stat.icon}</div>
            <div class="stat-content">
              <div class="stat-label">${stat.label}</div>
              <div class="stat-value" id="${stat.id}-value">${stat.value}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="cards-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-title">🚀 Schnellaktionen</div>
            <div class="card-description">Beginnen Sie mit gängigen Aufgaben</div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="document.getElementById('api_page_btn').click()">API-Endpunkte testen</button>
            <button class="btn btn-secondary" onclick="document.getElementById('test_page_btn').click()">Test-Suite ausführen</button>
            <button class="btn btn-secondary" onclick="document.getElementById('log_page_btn').click()">Systemprotokolle anzeigen</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">📊 Systemintegrität</div>
            <div class="card-description">Übersicht über den Systemstatus</div>
          </div>
          <div class="health-indicators">
            <div class="health-item" id="health-item-api">
              <span class="health-dot" id="health-dot-api" style="background: var(--surface)"></span>
              <span>API-Server</span>
              <span class="health-status" id="health-status-api">Wird überprüft…</span>
            </div>
            <div class="health-item" id="health-item-db">
              <span class="health-dot" id="health-dot-db" style="background: var(--surface)"></span>
              <span>Datenbank</span>
              <span class="health-status" id="health-status-db">Wird überprüft…</span>
            </div>
            <div class="health-item" id="health-item-cache">
              <span class="health-dot" id="health-dot-cache" style="background: var(--surface)"></span>
              <span>Cache</span>
              <span class="health-status" id="health-status-cache">Wird überprüft…</span>
            </div>
            <div class="health-item" id="health-item-monitor">
              <span class="health-dot" id="health-dot-monitor" style="background: var(--surface)"></span>
              <span>Überwachung</span>
              <span class="health-status" id="health-status-monitor">Wird überprüft…</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">📈 Letzte Aktivitäten</div>
            <div class="card-description">Neueste API-Aufrufe und Ereignisse</div>
          </div>
          <div class="activity-feed" id="activity_feed">
            <div class="activity-item">
              <div class="activity-time">–</div>
              <div class="activity-text">Keine Einträge</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .dashboard { padding: var(--space-xl) 0; }
      .dashboard-header { text-align: center; margin-bottom: var(--space-2xl); }
      .dashboard-header h1 { margin-bottom: var(--space-sm); }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(200px, 1fr));
        gap: var(--space-lg);
        margin-bottom: var(--space-2xl);
        max-width: 1100px;
        margin-left: auto; margin-right: auto;
      }
      .stat-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); padding: var(--space-lg); }
      .stat-icon { font-size: 1.5rem; }
      .stat-content { display: flex; flex-direction: column; align-items: center; gap: var(--space-xxs, 0.25rem); }
      .stat-label { font-size: var(--font-size-sm); color: var(--text-muted); white-space: nowrap; }
      .stat-value { font-size: var(--font-size-2xl); font-weight: 700; line-height: 1; }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--space-lg);
        max-width: 1100px;
        margin: 0 auto;
      }

      .action-buttons { display: flex; flex-direction: column; gap: var(--space-sm); }

      .health-indicators { display: flex; flex-direction: column; gap: var(--space-md); }
      .health-item { display: flex; align-items: center; gap: var(--space-sm); }
      .health-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .health-status { margin-left: auto; font-size: var(--font-size-sm); color: var(--text-muted); }

      .activity-feed { display: flex; flex-direction: column; gap: var(--space-md); }
      .activity-item { display: flex; flex-direction: column; gap: var(--space-xs); padding: var(--space-sm); background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border-left: 3px solid var(--border); }
      .activity-time { font-size: var(--font-size-xs); color: var(--text-muted); }
      .activity-text { font-size: var(--font-size-sm); font-family: var(--font-mono); }

      @media (max-width: 1024px) {
        .stats-grid { grid-template-columns: repeat(2, minmax(200px, 1fr)); }
        .cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .stats-grid { grid-template-columns: 1fr; }
        .cards-grid { grid-template-columns: 1fr; }
      }
    </style>
  `;

  const updateStat = (statId, value) => {
    const element = document.getElementById(`${statId}-value`);
    if (element) {
      element.style.transform = 'scale(1.1)';
      element.style.transition = 'transform 0.2s ease';
      setTimeout(() => {
        element.textContent = value;
        element.style.transform = 'scale(1)';
      }, 100);
    }
  };

  const fetchApiEndpoints = async () => {
    try {
      const res = await get('/api/v1/meta/endpoints');
      if (res.ok) {
        const data = res.data;
        const count = (typeof data.count === 'number') ? data.count : (Array.isArray(data.endpoints) ? data.endpoints.length : 0);
        dynamicStats.apiEndpoints = count;
      } else {
        console.warn('Fehler beim Abrufen der Endpunkt-Metadaten:', res.status, res.statusText);
        dynamicStats.apiEndpoints = 0;
      }
    } catch (error) {
      console.warn('Fehler beim Abrufen der Endpunkt-Metadaten:', error);
      dynamicStats.apiEndpoints = 0;
    }
  };

  const fetchLogsCount = async () => {
    try {
      const res = await get('/api/v1/logs');
      if (res.ok) {
        const data = res.data;
        dynamicStats.recentLogs = data.logs ? data.logs.length : 0;
      } else {
        dynamicStats.recentLogs = 0;
      }
    } catch (error) {
      dynamicStats.recentLogs = 0;
    }
  };

  const checkSystemStatus = async () => {
    try {
      const res = await get('/api/v1/health');
      if (res.ok) {
        dynamicStats.systemStatus = 'Online';
      } else {
        dynamicStats.systemStatus = 'Probleme';
      }
    } catch (error) {
      dynamicStats.systemStatus = 'Offline';
    }
  };

  const updateActiveTests = async () => {
    try {
      const res = await get('/api/v1/meta/active-tests');
      if (res.ok) {
        const data = res.data;
        dynamicStats.activeTests = typeof data.active === 'number' ? data.active : 0;
      } else {
        console.warn('Fehler beim Abrufen der aktiven Tests-Metadaten:', res.status, res.statusText);
        dynamicStats.activeTests = 0;
      }
    } catch (error) {
      console.warn('Fehler beim Abrufen der aktiven Tests-Metadaten:', error);
      dynamicStats.activeTests = 0;
    }
  };

  async function updateHealthCard() {
    try {
      const res = await get('/api/v1/health/full');
      if (!res.ok) return;
      const checks = res.data?.checks || {};
      const setStatus = (key, ok, message) => {
        const dot = document.getElementById(`health-dot-${key}`);
        const txt = document.getElementById(`health-status-${key}`);
        if (!dot || !txt) return;
        const color = ok ? 'var(--success)' : (message?.toLowerCase().includes('warn') || message?.toLowerCase().includes('degrad') ? 'var(--warning)' : 'var(--error)');
        dot.style.background = color;
        if (key === 'api') txt.textContent = ok ? 'Gut' : 'Schlecht';
        else if (key === 'db') txt.textContent = ok ? 'Verbunden' : 'Nicht verbunden';
        else if (key === 'cache') txt.textContent = ok ? 'Gut' : 'Warnung';
        else if (key === 'monitor') txt.textContent = ok ? 'Aktiv' : 'Inaktiv';
      };
      setStatus('api', !!checks.api?.ok, checks.api?.message || '');
      setStatus('db', !!checks.database?.ok, checks.database?.message || '');
      setStatus('cache', !!checks.cache?.ok, checks.cache?.message || '');
      setStatus('monitor', !!checks.monitoring?.ok, checks.monitoring?.message || '');
    } catch (e) {
      ['api','db','cache','monitor'].forEach(k => {
        const dot = document.getElementById(`health-dot-${k}`);
        const txt = document.getElementById(`health-status-${k}`);
        if (dot) dot.style.background = 'var(--error)';
        if (txt) txt.textContent = 'Offline';
      });
    }
  }

  async function updateActivityFeed() {
    try {
      const res = await get('/api/v1/logs');
      const container = document.getElementById('activity_feed');
      if (!container) return;
      if (!res.ok) { container.innerHTML = '<div class="activity-item"><div class="activity-text">Fehler beim Laden der Aktivitäten</div></div>'; return; }
      const lines = Array.isArray(res.data?.logs) ? res.data.logs : [];
      const last = lines.slice(-4).reverse();

      const items = last.map(line => {
        const m = line.match(/^\[(.*?)\]\s+\[(.*?)\]\s+(?:\[(.*?)\]\s+)?(.*)$/);
        const t = m?.[1] || '';
        const levelRaw = (m?.[2] || '').toUpperCase();
        const cat = (m?.[3] || '').toUpperCase();
        const msg = m?.[4] || line;
        const color = levelRaw === 'ERROR' ? 'var(--error)' : 'var(--success)';
        return `<div class="activity-item">
          <div class="activity-time">${t}</div>
          <div class="activity-text">${cat ? `[${cat}] ` : ''}${msg}</div>
        </div>`;
      }).join('');

      container.innerHTML = items || '<div class="activity-item"><div class="activity-time">–</div><div class="activity-text">Keine Einträge</div></div>';
    } catch (e) {
      const container = document.getElementById('activity_feed');
      if (container) container.innerHTML = '<div class="activity-item"><div class="activity-text">Fehler beim Laden der Aktivitäten</div></div>';
    }
  }

  const updateAllStats = async () => {
    await Promise.all([
      fetchApiEndpoints(),
      fetchLogsCount(),
      checkSystemStatus(),
      updateActiveTests(),
      updateHealthCard(),
      updateActivityFeed()
    ]);

    updateStat('api-endpoints', dynamicStats.apiEndpoints);
    updateStat('active-tests', dynamicStats.activeTests);
    updateStat('recent-logs', dynamicStats.recentLogs);
    updateStat('system-status', dynamicStats.systemStatus);
  };

  setTimeout(() => { updateAllStats(); }, 500);
  const statsInterval = setInterval(updateAllStats, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateAllStats(); });
  window.addEventListener('beforeunload', () => { if (statsInterval) clearInterval(statsInterval); });

  return pageContent;
}
