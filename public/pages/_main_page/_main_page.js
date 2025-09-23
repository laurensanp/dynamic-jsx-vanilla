import { html } from "../../setup/dom.js";
import { updateStat } from "./dashboardUtils.js";
import { updateAllStats } from "./dashboardService.js";
import * as MainPageSettings from "../../settings/_main_pageSettings.js";

let dynamicStats = {
  apiEndpoints: 0,
  recentLogs: 0,
  systemStatus: 'Startet…',
  logFileSize: 0
};

export function App() {
  const getStats = () => [
    { id: 'api-endpoints', label: 'API-Endpunkte', value: dynamicStats.apiEndpoints, icon: '📡', color: 'var(--primary)' },
    { id: 'recent-logs', label: 'Neueste Protokolle', value: dynamicStats.recentLogs, icon: '📋', color: 'var(--info)' },
    { id: 'system-status', label: 'Systemstatus', value: dynamicStats.systemStatus, icon: '🟢', color: 'var(--success)' },
    { id: 'log-file-size', label: 'Log Dateigröße', value: dynamicStats.logFileSize, icon: '📦', color: 'var(--warning)' }
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
  `;

  return pageContent;
}

export function onMount(rootElement) {
  let dashboardInterval = null;
  const statsGrid = rootElement.querySelector('.stats-grid');
  const cardsGrid = rootElement.querySelector('.cards-grid');

  const stopDashboardRefresh = () => {
    if (dashboardInterval) {
      clearInterval(dashboardInterval);
      dashboardInterval = null;
    }
    statsGrid.classList.add('hidden');
    cardsGrid.classList.add('hidden');
  };

  const startDashboardRefresh = (interval) => {
    if (dashboardInterval) clearInterval(dashboardInterval);
    dashboardInterval = setInterval(fetchDashboardStats, interval);
    statsGrid.classList.remove('hidden');
    cardsGrid.classList.remove('hidden');
  };

  const fetchDashboardStats = async () => {
    const result = await updateAllStats(dynamicStats);
    if (!result.success) {
      stopDashboardRefresh();
    }
  };

  setTimeout(fetchDashboardStats, MainPageSettings.DASHBOARD_INITIAL_FETCH_DELAY_MS);
  startDashboardRefresh(MainPageSettings.DASHBOARD_REFRESH_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) fetchDashboardStats(); });
  window.addEventListener('beforeunload', () => { if (dashboardInterval) clearInterval(dashboardInterval); });
}
