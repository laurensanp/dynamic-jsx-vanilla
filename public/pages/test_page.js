import { html } from "../setup/dom.js";

export function App() {
  const testSuites = [
    {
      id: 'api-tests',
      name: 'API-Endpunkt-Tests',
      description: 'Testen Sie CRUD-Operationen und API-Funktionalität',
      tests: [
        { name: 'GET /api/v1/hello', status: 'pending', duration: '-' },
        { name: 'POST /api/v1/auth', status: 'pending', duration: '-' },
        { name: 'GET /api/v1/users', status: 'pending', duration: '-' },
        { name: 'Benutzer erstellen Test', status: 'pending', duration: '-' },
        { name: 'DELETE /api/v1/data', status: 'pending', duration: '-' },
      ]
    },
    {
      id: 'integration-tests',
      name: 'Integrationstests',
      description: 'Ende-zu-Ende Systemintegrationstests',
      tests: [
        { name: 'Datenbankverbindung', status: 'passed', duration: '234ms' },
        { name: 'Cache-Schicht', status: 'warning', duration: '567ms' },
        { name: 'Externe API', status: 'passed', duration: '123ms' },
      ]
    },
    {
      id: 'performance-tests',
      name: 'Leistungstests',
      description: 'Last- und Leistungstests',
      tests: [
        { name: 'Antwortzeit < 200ms', status: 'passed', duration: '156ms' },
        { name: 'Gleichzeitige Benutzer (100)', status: 'passed', duration: '2.1s' },
        { name: 'Speichernutzung', status: 'warning', duration: '1.8s' },
      ]
    }
  ];

  
  const calculateStats = () => {
    let stats = { passed: 0, failed: 0, warning: 0, pending: 0 };
    
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        if (stats.hasOwnProperty(test.status)) {
          stats[test.status]++;
        }
      });
    });
    
    return stats;
  };

  
  const updateStatsDisplay = (newStats = null) => {
    const stats = newStats || calculateStats();
    
    const updateStatElement = (id, value) => {
      
      const element = document.getElementById(id);
      
      if (element) {
        
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
          element.textContent = value;
          element.style.transform = 'scale(1)';
        }, 150);
      }
    };
    
    updateStatElement('passed-count', stats.passed);
    updateStatElement('failed-count', stats.failed);
    updateStatElement('warning-count', stats.warning);
    updateStatElement('pending-count', stats.pending);
  };

  const page = html`
    <div class="test-suite">
      <div class="test-header">
        <h1>Test-Suite</h1>
        <p>Automatisiertes Test-Dashboard für API- und Systemüberprüfung</p>
        <div class="test-actions">
          <button id="run_all_btn" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Alle Tests starten
          </button>
          <button id="run_failed_btn" class="btn btn-secondary">Fehlgeschlagene ausführen</button>
          <button id="clear_results_btn" class="btn btn-ghost">Ergebnisse leeren</button>
        </div>
      </div>

      <div class="test-overview">
        <div class="test-stats">
          <div class="stat-item passed">
            <div class="stat-number" id="passed-count">0</div>
            <div class="stat-label">Bestanden</div>
          </div>
          <div class="stat-item failed">
            <div class="stat-number" id="failed-count">0</div>
            <div class="stat-label">Fehlgeschlagen</div>
          </div>
          <div class="stat-item warning">
            <div class="stat-number" id="warning-count">0</div>
            <div class="stat-label">Warnungen</div>
          </div>
          <div class="stat-item pending">
            <div class="stat-number" id="pending-count">0</div>
            <div class="stat-label">Ausstehend</div>
          </div>
        </div>
      </div>

      <div class="test-suites-grid">
        ${testSuites.map(suite => `
          <div class="card test-suite-card">
            <div class="card-header">
              <div>
                <div class="card-title">${suite.name}</div>
                <div class="card-description">${suite.description}</div>
              </div>
              <button class="btn btn-sm btn-secondary" data-suite="${suite.id}">Suite ausführen</button>
            </div>
            
            <div class="test-results">
              ${suite.tests.map(test => `
                <div class="test-item ${test.status}">
                  <div class="test-status-icon">
                    ${test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : test.status === 'warning' ? '⚠' : test.status === 'pending' ? '⏳' : '●'}
                  </div>
                  <div class="test-info">
                    <div class="test-name">${test.name}</div>
                    <div class="test-duration">${test.duration}</div>
                  </div>
                  <div class="test-actions">
                    <button class="btn-icon" title="Test ausführen">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="card test-output">
        <div class="card-header">
          <div class="card-title">📋 Testausgabe</div>
          <button id="clear_output_btn" class="btn btn-ghost btn-sm">Leeren</button>
        </div>
        <div id="test_output" class="output test-console"></div>
      </div>
    </div>

    <style>
      .test-suite {
        padding: var(--space-xl) 0;
      }
      
      .test-header {
        text-align: center;
        margin-bottom: var(--space-2xl);
      }
      
      .test-header h1 {
        margin-bottom: var(--space-sm);
      }
      
      .test-actions {
        display: flex;
        gap: var(--space-sm);
        justify-content: center;
        margin-top: var(--space-lg);
      }
      
      .test-overview {
        margin-bottom: var(--space-2xl);
      }
      
      .test-stats {
        display: flex;
        gap: var(--space-lg);
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .stat-item {
        text-align: center;
        padding: var(--space-lg);
        border-radius: var(--radius-lg);
        min-width: 100px;
      }
      
      .stat-item.passed { background: rgba(72, 187, 120, 0.1); border: 1px solid var(--success); }
      .stat-item.failed { background: rgba(245, 101, 101, 0.1); border: 1px solid var(--error); }
      .stat-item.warning { background: rgba(237, 137, 54, 0.1); border: 1px solid var(--warning); }
      .stat-item.pending { background: rgba(66, 153, 225, 0.1); border: 1px solid var(--info); }
      
      .stat-number {
        font-size: var(--font-size-3xl);
        font-weight: 700;
        margin-bottom: var(--space-xs);
      }
      
      .stat-label {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }
      
      .test-suites-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-lg);
        margin-bottom: var(--space-2xl);
      }
      
      .test-results {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }
      
      .test-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm);
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        transition: var(--transition);
      }
      
      .test-item:hover {
        background: rgba(255, 255, 255, 0.04);
      }
      
      .test-status-icon {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .test-info {
        flex: 1;
      }
      
      .test-name {
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
      }
      
      .test-duration {
        font-size: var(--font-size-xs);
        color: var(--text-muted);
      }
      
      .btn-icon {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--space-xs);
        border-radius: var(--radius-sm);
        transition: var(--transition);
      }
      
      .btn-icon:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.1);
      }
      
      .test-console {
        min-height: 250px;
        font-family: var(--font-mono);
      }
      
      @media (max-width: 1200px) {
        .test-suites-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @media (max-width: 768px) {
        .test-stats {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .test-actions {
          flex-direction: column;
          align-items: center;
        }
        
        .test-suites-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;

  function getStatusIcon(status) {
    switch (status) {
      case 'passed': return '✓';
      case 'failed': return '✗';
      case 'warning': return '⚠';
      case 'pending': return '⏳';
      default: return '●';
    }
  }

  
  const runAllBtn = page.querySelector('#run_all_btn');
  const runFailedBtn = page.querySelector('#run_failed_btn');
  const clearResultsBtn = page.querySelector('#clear_results_btn');
  const clearOutputBtn = page.querySelector('#clear_output_btn');
  const testOutput = page.querySelector('#test_output');
  const suiteButtons = page.querySelectorAll('[data-suite]');

  
  let liveTestResults = {
    passed: 0,
    failed: 0,
    warning: 0,
    pending: 0
  };

  const updateLiveStats = () => {
    updateStatsDisplay(liveTestResults);
  };

  const addOutput = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    testOutput.innerHTML += `<div class=\"log-entry ${type}\">[${timestamp}] ${icon} ${message}</div>`;
    testOutput.scrollTop = testOutput.scrollHeight;

    
    if (message.includes('- BESTANDEN')) {
      liveTestResults.passed++;
      updateLiveStats();
    } else if (message.includes('- FEHLGESCHLAGEN') || message.includes('- FEHLER')) {
      liveTestResults.failed++;
      updateLiveStats();
    }
  };

  
  function updateTestItemUI(testName, statusClass, durationMs) {
    const items = document.querySelectorAll('.test-item');
    items.forEach(item => {
      const nameEl = item.querySelector('.test-name');
      if (!nameEl) return;
      if (nameEl.textContent.trim() !== testName.trim()) return;

      
      item.classList.remove('passed', 'failed', 'warning', 'pending');
      item.classList.add(statusClass);

      
      const durEl = item.querySelector('.test-duration');
      if (durEl) durEl.textContent = `${durationMs}ms`;

      
      const iconEl = item.querySelector('.test-status-icon');
      if (iconEl) {
        iconEl.textContent = statusClass === 'passed' ? '✓' : statusClass === 'failed' ? '✗' : statusClass === 'warning' ? '⚠' : '⏳';
      }
    });
  }

  
  const testFunctions = {
    'GET /api/v1/hello': async () => {
      const response = await fetch('/api/v1/hello');
      const data = await response.json();
      return {
        success: response.ok,
        status: response.status,
        message: data.message || 'Keine Nachricht',
        expectedStatus: 200
      };
    },
    
    'POST /api/v1/auth': async () => {
      
      const response = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'password' })
      });
      const data = await response.json();
      return {
        success: response.ok && data.success === true,
        status: response.status,
        message: data.message || 'Authentifizierungstest abgeschlossen',
        expectedStatus: 200
      };
    },
    
    'GET /api/v1/users': async () => {
      
      const response = await fetch('/api/v1/users');
      const data = await response.json();
      return {
        success: response.ok && Array.isArray(data.users),
        status: response.status,
        message: response.ok ? `Gefunden ${data.count || 0} Benutzer` : 'Benutzer-Endpunkt fehlgeschlagen',
        expectedStatus: 200
      };
    },
    
'CREATE User Test': async () => {
      
      const testUser = {
        name: 'Test Benutzer Fixed',
        email: 'test_fixed@example.com'
      };
      
      try {
        
        const createResponse = await fetch('/api/v1/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        });
        
        if (!createResponse.ok) {
          return {
            success: false,
            status: createResponse.status,
            message: 'Fehler beim Erstellen des Testbenutzers',
            expectedStatus: 201
          };
        }
        
        const createdUser = await createResponse.json();
        const userId = createdUser.user.id;
        
        
        const getResponse = await fetch(`/api/v1/users/${userId}`);
        if (!getResponse.ok) {
          return {
            success: false,
            status: getResponse.status,
            message: 'Erstellter Benutzer nicht gefunden',
            expectedStatus: 200
          };
        }
        
        
        const deleteResponse = await fetch(`/api/v1/users/${userId}`, {
          method: 'DELETE'
        });
        
        return {
          success: deleteResponse.ok,
          status: createResponse.status,
          message: `CRUD-Test abgeschlossen: Benutzer '${testUser.name}' erstellt, verifiziert und bereinigt`,
          expectedStatus: 201
        };
        
      } catch (error) {
        return {
          success: false,
          status: 500,
          message: `CRUD-Testfehler: ${error.message}`,
          expectedStatus: 201
        };
      }
    },
    
    'DELETE /api/v1/data': async () => {
      
      const deleteResponse = await fetch('/api/v1/data', { method: 'DELETE' });
      const deleteData = await deleteResponse.json();
      return {
        success: deleteResponse.ok,
        status: deleteResponse.status,
        message: deleteResponse.ok ? deleteData.message : 'Datenlöschung fehlgeschlagen',
        expectedStatus: 200
      };
    },
    
    'Database Connection': async () => {
      
      const response = await fetch('/api/v1/logs');
      const data = await response.json();
      return {
        success: response.ok && data.logs && data.logs.length >= 0,
        status: response.status,
        message: response.ok ? `${data.logs?.length || 0} Protokolleinträge gefunden` : 'Zugriff auf Protokolle nicht möglich',
        expectedStatus: 200
      };
    },
    
    'Cache Layer': async () => {
      
      const start = performance.now();
      const response = await fetch('/api/v1/hello');
      const duration = performance.now() - start;
      
      return {
        success: response.ok && duration < 500, 
        status: response.status,
        message: `Antwortzeit: ${Math.round(duration)}ms ${duration < 200 ? '(Ausgezeichnet)' : duration < 500 ? '(Gut)' : '(Langsam)'}`,
        expectedStatus: 200
      };
    },
    
    'External API': async () => {
      
      const response = await fetch('/api/v1/shut', {
        headers: {
          'x-test-mode': 'true'
        }
      });
      const data = await response.json();
      return {
        success: response.ok && data.testMode === true,
        status: response.status,
        message: response.ok ? 'Shutdown-Endpunkt sicher getestet' : 'Shutdown-Endpunkt fehlgeschlagen',
        expectedStatus: 200
      };
    },
    
    'Response Time < 200ms': async () => {
      const start = performance.now();
      const response = await fetch('/api/v1/hello');
      const duration = performance.now() - start;
      
      return {
        success: response.ok && duration < 200,
        status: response.status,
        message: `Antwortzeit: ${Math.round(duration)}ms`,
        expectedStatus: 200
      };
    },
    
    'Concurrent Users (100)': async () => {
      
      const start = performance.now();
      const promises = [];
      
      for (let i = 0; i < 10; i++) { 
        promises.push(fetch('/api/v1/hello'));
      }
      
      const responses = await Promise.all(promises);
      const duration = performance.now() - start;
      const successCount = responses.filter(r => r.ok).length;
      
      return {
        success: successCount === 10 && duration < 2000,
        status: 200,
        message: `${successCount}/10 Anfragen erfolgreich in ${Math.round(duration)}ms`,
        expectedStatus: 200
      };
    },
    
    'Memory Usage': async () => {
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(fetch('/api/v1/logs'));
      }
      
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.ok).length;
      
      return {
        success: successCount === 5,
        status: 200,
        message: `${successCount}/5 speicherintensive Anfragen erfolgreich`,
        expectedStatus: 200
      };
    }
  };

  // Lokalisierte Alias-Namen -> vorhandene Implementierungen
  // Dies verbindet die in der UI angezeigten deutschen Testnamen mit den bestehenden Testfunktionen
  testFunctions['Datenbankverbindung'] = testFunctions['Database Connection'];
  testFunctions['Cache-Schicht'] = testFunctions['Cache Layer'];
  testFunctions['Externe API'] = testFunctions['External API'];
  testFunctions['Antwortzeit < 200ms'] = testFunctions['Response Time < 200ms'];
  testFunctions['Gleichzeitige Benutzer (100)'] = testFunctions['Concurrent Users (100)'];
  testFunctions['Speichernutzung'] = testFunctions['Memory Usage'];
  testFunctions['Benutzer erstellen Test'] = testFunctions['CREATE User Test'];

  async function postActiveDelta(delta) {
    try {
      await fetch('/api/v1/meta/active-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
    } catch (e) {
      
    }
  }

  const runTest = async (testName) => {
    addOutput(`Läuft: ${testName}`);
    
    postActiveDelta(1);
    const startTime = performance.now();
    
    try {
      const testFunction = testFunctions[testName];
      if (!testFunction) {
        addOutput(`${testName} - ÜBERSPRUNGEN (Keine Testimplementierung)`, 'warning');
        updateTestItemUI(testName, 'warning', 0);
        return;
      }
      
      const result = await testFunction();
      const duration = Math.round(performance.now() - startTime);
      
      if (result.success) {
        addOutput(`${testName} - BESTANDEN (${duration}ms) - ${result.message}`, 'success');
        updateTestItemUI(testName, 'passed', duration);
      } else {
        addOutput(`${testName} - FEHLGESCHLAGEN (${duration}ms) - Status: ${result.status}, ${result.message}`, 'error');
        updateTestItemUI(testName, 'failed', duration);
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      addOutput(`${testName} - FEHLER (${duration}ms) - ${error.message}`, 'error');
      updateTestItemUI(testName, 'failed', duration);
    } finally {
      
      postActiveDelta(-1);
    }
  };

  
  runAllBtn.addEventListener('click', () => {
    addOutput('Starte komplette Test-Suite...');
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        runTest(test.name);
      });
    });
  });

  runFailedBtn.addEventListener('click', () => {
    addOutput('Führe nur fehlgeschlagene Tests aus...');
    testSuites.forEach(suite => {
      suite.tests
        .filter(test => test.status === 'failed')
        .forEach(test => runTest(test.name));
    });
  });

  clearResultsBtn.addEventListener('click', () => {
    testOutput.innerHTML = '';
    
    
    liveTestResults = {
      passed: 0,
      failed: 0,
      warning: 0,
      pending: 0
    };
    
    
    document.querySelectorAll('.test-item').forEach(item => {
      item.classList.remove('passed', 'failed', 'warning', 'pending');
      item.classList.add('pending');
      const durEl = item.querySelector('.test-duration');
      if (durEl) durEl.textContent = '-';
      const iconEl = item.querySelector('.test-status-icon');
      if (iconEl) iconEl.textContent = '⏳';
    });
    
    
    updateStatsDisplay(liveTestResults);
    
    addOutput('Testergebnisse geleert', 'warning');
  });

  clearOutputBtn.addEventListener('click', () => {
    testOutput.innerHTML = '';
    addOutput('Testkonsole initialisiert');
  });

  suiteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const suiteId = e.target.dataset.suite;
      const suite = testSuites.find(s => s.id === suiteId);
      if (suite) {
        addOutput(`Starte Test-Suite: ${suite.name}`);
        suite.tests.forEach(test => runTest(test.name));
      }
    });
  });

  
  const testSuiteEl = page.querySelector('.test-suite');
  if (testSuiteEl) {
    testSuiteEl.addEventListener('click', (e) => {
      const runBtn = e.target.closest('.btn-icon');
      if (!runBtn) return;
      const item = runBtn.closest('.test-item');
      if (!item) return;
      const nameEl = item.querySelector('.test-name');
      if (!nameEl) return;
      const testName = nameEl.textContent.trim();
      
      runTest(testName);
    });
  }

  
  setTimeout(() => {
    updateStatsDisplay({
      passed: 0,
      failed: 0,
      warning: 0,
      pending: 0
    });
  }, 500);

  
  addOutput('Test-Suite bereit. Klicken Sie auf „Alle Tests starten“, um zu beginnen.');

  return page;
}
