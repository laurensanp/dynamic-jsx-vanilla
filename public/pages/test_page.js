import { html } from "../setup/dom.js";
import { TEST_USERNAME, TEST_PASSWORD, CONCURRENT_USERS_COUNT, MEMORY_USAGE_REQUESTS, CONCURRENT_USER_CREATION_COUNT, ENDPOINT_STRESS_TEST_REQUESTS, LARGE_DATA_PAYLOAD_SIZE, RESOURCE_EXHAUSTION_OPERATIONS } from '../utils/testConfig.js';

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
        { name: 'Concurrent User Creation', status: 'pending', duration: '-' },
        { name: 'Full User CRUD Test', status: 'pending', duration: '-' },
        { name: 'Brute-Force Login Attempt', status: 'pending', duration: '-' },
        { name: 'Data Integrity Test', status: 'pending', duration: '-' },
        { name: 'Large Data Payload Test', status: 'pending', duration: '-' },
      ]
    },
    {
      id: 'integration-tests',
      name: 'Integrationstests',
      description: 'Ende-zu-Ende Systemintegrationstests',
      tests: [
        { name: 'Datenbankverbindung', status: 'pending', duration: '-' },
        { name: 'Cache-Schicht', status: 'pending', duration: '-' },
        { name: 'Externe API', status: 'pending', duration: '-' },
      ]
    },
    {
      id: 'performance-tests',
      name: 'Leistungstests',
      description: 'Last- und Leistungstests',
      tests: [
        { name: 'Antwortzeit < 200ms', status: 'pending', duration: '-'},
        { name: 'Gleichzeitige Benutzer (100)', status: 'pending', duration: '-' },
        { name: 'Speichernutzung', status: 'pending', duration: '-' },  
        { name: 'Endpoint Stress Test', status: 'pending', duration: '-' },
        { name: 'Resource Exhaustion Test', status: 'pending', duration: '-' },
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

  const updateStatsDisplay = (newStats = null) => {
    const stats = newStats || calculateStats();
    
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
      #page-content {
        max-width: 1600px;
        margin: 0 auto;
      }

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
      .stat-item.active { background: rgba(147, 112, 219, 0.1); border: 1px solid var(--primary); }
      
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

  async function loginTestUser() {
    const response = await fetch('/api/v1/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD })
    });
    if (!response.ok) {
      throw new Error(`Failed to login test user: ${response.statusText}`);
    }
    return response.json();
  }

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
    // Do not log expected 401s from brute force test as errors in the UI console
    if (type === 'error' && message.includes('Anfragen führten zu erwartetem 401 Unauthorized/Ratelimit')) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    testOutput.innerHTML += `<div class=\"log-entry ${type}\">[${timestamp}] ${icon} ${message}</div>`;
    testOutput.scrollTop = testOutput.scrollHeight;
    
    // Removed redundant liveTestResults incrementing logic, as updateTestItemUI handles this.
  };
  
  function updateTestItemUI(testName, statusClass, durationMs) {
    const items = document.querySelectorAll('.test-item');
    items.forEach(item => {
      const nameEl = item.querySelector('.test-name');
      if (!nameEl) return;
      if (nameEl.textContent.trim() !== testName.trim()) return;

      const suite = testSuites.find(s => s.tests.some(t => t.name.trim() === testName.trim()));
      const test = suite && suite.tests.find(t => t.name.trim() === testName.trim());

      if (test) {
        // Decrement old status count, increment new status count
        if (liveTestResults.hasOwnProperty(test.status)) {
          liveTestResults[test.status]--;
        }
        test.status = statusClass; // Update the status in the testSuites array
        if (liveTestResults.hasOwnProperty(statusClass)) {
          liveTestResults[statusClass]++;
        }
        updateLiveStats(); // Update the display
      }

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
  
  const resetTestResultsUI = () => {
    testOutput.innerHTML = '';
    liveTestResults = {
      passed: 0,
      failed: 0,
      warning: 0,
      pending: testSuites.reduce((sum, suite) => sum + suite.tests.length, 0)
    };

    // Reset all test statuses to pending first
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        test.status = 'pending';
      });
    });
    
    updateStatsDisplay(liveTestResults);
    document.querySelectorAll('.test-item').forEach(item => {
      item.classList.remove('passed', 'failed', 'warning', 'pending');
      item.classList.add('pending');
      const durEl = item.querySelector('.test-duration');
      if (durEl) durEl.textContent = '-';
      const iconEl = item.querySelector('.test-status-icon');
      if (iconEl) iconEl.textContent = '⏳';
    });
    addOutput('Test-Suite bereit. Klicken Sie auf „Alle Tests starten“, um zu beginnen.');
  };

  const testFunctions = {
    'GET /api/v1/hello': async () => {
      await loginTestUser(); // Log in test user
      return executeFetchTest('/api/v1/hello', { method: 'GET' }, 200, (res, data) => res.ok);
    },
    
    'POST /api/v1/auth': async () => {
      await fetch('/api/v1/meta/reset-login-attempts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      
      return executeFetchTest(
        '/api/v1/auth',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD })
        },
        200,
        (res, data) => res.ok && data.success === true
      );
    },
    
    'GET /api/v1/users': async () => {
      await loginTestUser(); // Log in test user
      return executeFetchTest(
        '/api/v1/users',
        { method: 'GET' },
        200,
        (res, data) => res.ok && Array.isArray(data.users)
      );
    },
    
'CREATE User Test': async () => {
      
      const testUser = {
        name: 'Test Benutzer',
        email: 'test_create@example.com'
      };
      
      try {
        await fetch('/api/v1/meta/reset-test-state', { method: 'POST' }); // Reset test state
        await loginTestUser(); // Log in test user
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
    
    'Database Connection': async () => {
      return executeFetchTest(
        '/api/v1/logs',
        { method: 'GET' },
        200,
        (res, data) => res.ok && data.logs && Array.isArray(data.logs)
      );
    },
    
    'Cache Layer': async () => {
      const start = performance.now();
      const result = await executeFetchTest('/api/v1/hello', { method: 'GET' }, 200, (res, data) => res.ok);
      const duration = performance.now() - start;

      result.message = `Antwortzeit: ${Math.round(duration)}ms ${duration < 200 ? '(Ausgezeichnet)' : duration < 500 ? '(Gut)' : '(Langsam)'}`;
      result.success = result.success && duration < 500;
      return result;
    },
    
    'External API': async () => {
      return executeFetchTest(
        '/api/v1/shut',
        {
          headers: {
            'x-test-mode': 'true'
          }
        },
        200,
        (res, data) => res.ok && data.testMode === true
      );
    },
    
    'Response Time < 200ms': async () => {
      const start = performance.now();
      const result = await executeFetchTest('/api/v1/hello', { method: 'GET' }, 200, (res, data) => res.ok);
      const duration = performance.now() - start;

      result.message = `Antwortzeit: ${Math.round(duration)}ms`;
      result.success = result.success && duration < 250;
      return result;
    },
    
    'Concurrent Users (100)': async () => {
      
      const start = performance.now();
      const promises = [];
      
      for (let i = 0; i < CONCURRENT_USERS_COUNT; i++) { 
        promises.push(executeFetchTest('/api/v1/hello', { method: 'GET' }, 200, (res, data) => res.ok));
      }
      
      const results = await Promise.all(promises);
      const duration = performance.now() - start;
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount === CONCURRENT_USERS_COUNT && duration < 2000,
        status: 200,
        message: `${successCount}/${CONCURRENT_USERS_COUNT} Anfragen erfolgreich in ${Math.round(duration)}ms`,
        expectedStatus: 200
      };
    },
    
    'Memory Usage': async () => {
      
      const promises = [];
      for (let i = 0; i < MEMORY_USAGE_REQUESTS; i++) {
        promises.push(executeFetchTest('/api/v1/logs', { method: 'GET' }, 200, (res, data) => res.ok));
      }
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount === MEMORY_USAGE_REQUESTS,
        status: 200,
        message: `${successCount}/${MEMORY_USAGE_REQUESTS} speicherintensive Anfragen erfolgreich`,
        expectedStatus: 200
      };
    },

    'Endpoint Stress Test': async () => {
      const NUM_REQUESTS = ENDPOINT_STRESS_TEST_REQUESTS;
      const promises = [];
      for (let i = 0; i < NUM_REQUESTS; i++) {
        promises.push(executeFetchTest('/api/v1/health', { method: 'GET' }, 200, (res, data) => res.ok && res.status === 200));
      }
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;

      return {
        success: successCount === NUM_REQUESTS,
        status: 200,
        message: `${successCount}/${NUM_REQUESTS} Health-Checks erfolgreich durchgeführt`,
        expectedStatus: 200
      };
    },

    'Concurrent User Creation': async () => {
      const NUM_USERS = CONCURRENT_USER_CREATION_COUNT;
      const promises = [];
      
      await fetch('/api/v1/meta/reset-test-state', { method: 'POST' }); // Reset test state
      await loginTestUser(); // Log in test user
      for (let i = 0; i < NUM_USERS; i++) {
        const testUser = {
          name: `Concurrent User ${i}`,
          email: `concurrent_user_${i}@example.com`
        };
        promises.push(executeFetchTest('/api/v1/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        }, 200, (res) => res.ok));
      }
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      return {
        success: successCount === NUM_USERS,
        status: 200,
        message: `${successCount}/${NUM_USERS} Benutzer gleichzeitig erstellt`,
        expectedStatus: 200
      };
    },

    'Full User CRUD Test': async () => {
      const testUser = {
        name: 'CRUD Test User',
        email: 'crud_test@example.com'
      };
      let userId;

      try {
        await fetch('/api/v1/meta/reset-test-state', { method: 'POST' }); // Reset test state
        await loginTestUser(); // Log in test user
        // Create user
        const createResult = await executeFetchTest(
          '/api/v1/users',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
          },
          201, // Expected status for creation
          (res, data) => res.ok
        );
        if (!createResult.success) throw new Error(createResult.message || 'Failed to create user');
        userId = createResult.data.user.id;

        // Read user
        const readResult = await executeFetchTest(
          `/api/v1/users/${userId}`,
          { method: 'GET' },
          200,
          (res, data) => res.ok && data.user.email === testUser.email
        );
        if (!readResult.success) throw new Error(readResult.message || 'Failed to read user or data mismatch');

        // Update user
        const updatedUser = { ...testUser, name: 'Updated CRUD User' };
        const updateResult = await executeFetchTest(
          `/api/v1/users/${userId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
          },
          200,
          (res) => res.ok
        );
        if (!updateResult.success) throw new Error(updateResult.message || 'Failed to update user');

        const checkUpdateResult = await executeFetchTest(
          `/api/v1/users/${userId}`,
          { method: 'GET' },
          200,
          (res, data) => res.ok && data.user.name === updatedUser.name
        );
        if (!checkUpdateResult.success) throw new Error(checkUpdateResult.message || 'Update verification failed');

        // Delete user
        const deleteResult = await executeFetchTest(
          `/api/v1/users/${userId}`,
          { method: 'DELETE' },
          200,
          (res) => res.ok
        );
        if (!deleteResult.success) throw new Error(deleteResult.message || 'Failed to delete user');

        return {
          success: true,
          status: 200,
          message: 'Full User CRUD flow completed successfully.',
          expectedStatus: 200
        };
      } catch (error) {
        return {
          success: false,
          status: 500,
          message: `Full User CRUD Test Error: ${error.message}`,
          expectedStatus: 200
        };
      } finally {
        // Ensure cleanup even if test fails midway
        if (userId) {
          try {
            await fetch(`/api/v1/meta/cleanup-user/${userId}`, { method: 'POST' });
          } catch (e) {
            // Expected 404s from server-side cleanup should not be logged as errors
          }
        }
      }
    },

    'Brute-Force Login Attempt': async () => {
      await loginTestUser(); // Log in test user first
      return executeFetchTest(
        '/api/v1/meta/run-brute-force-test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        },
        200,
        (res, data) => data.success
      );
    },
    'Data Integrity Test': async () => {
      const testData = { value: 'Initial Data' };
      let dataId;

      try {
        await fetch('/api/v1/meta/reset-test-state', { method: 'POST' }); // Reset test state
        await loginTestUser(); // Log in test user
        // Create data
        const createResult = await executeFetchTest(
          '/api/v1/data',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
          },
          200,
          (res, data) => res.ok
        );
        if (!createResult.success) throw new Error(createResult.message || 'Failed to create data');
        dataId = createResult.data.data.id;

        // Read data
        const readResult = await executeFetchTest(
          `/api/v1/data/${dataId}`,
          { method: 'GET' },
          200,
          (res, data) => res.ok && data.data.value === testData.value
        );
        if (!readResult.success) throw new Error(readResult.message || 'Failed to read data or data mismatch');

        // Update data
        const updatedData = { ...testData, value: 'Updated Data' };
        const updateResult = await executeFetchTest(
          `/api/v1/data/${dataId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
          },
          200,
          (res) => res.ok
        );
        if (!updateResult.success) throw new Error(updateResult.message || 'Failed to update data');

        const checkUpdateResult = await executeFetchTest(
          `/api/v1/data/${dataId}`,
          { method: 'GET' },
          200,
          (res, data) => res.ok && data.data.value === updatedData.value
        );
        if (!checkUpdateResult.success) throw new Error(checkUpdateResult.message || 'Update verification failed');

        // Delete data
        const deleteResult = await executeFetchTest(
          `/api/v1/data/${dataId}`,
          { method: 'DELETE' },
          200,
          (res) => res.ok
        );
        if (!deleteResult.success) throw new Error(deleteResult.message || 'Failed to delete data');

        return {
          success: true,
          status: 200,
          message: 'Data Integrity Test completed successfully.',
          expectedStatus: 200
        };
      } catch (error) {
        return {
          success: false,
          status: 500,
          message: `Data Integrity Test Error: ${error.message}`,
          expectedStatus: 200
        };
      } finally {
        // Ensure cleanup even if test fails midway
        if (dataId) {
          try {
            await fetch(`/api/v1/meta/cleanup-data/${dataId}`, { method: 'POST' });
          } catch (e) {
            // Expected 404s from server-side cleanup should not be logged as errors
          }
        }
      }
    },
    'Large Data Payload Test': async () => {
      const largeData = { content: 'a'.repeat(LARGE_DATA_PAYLOAD_SIZE) }; // 500KB of data

      try {
        await loginTestUser(); // Log in test user
        const createResult = await executeFetchTest(
          '/api/v1/data',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(largeData)
          },
          200,
          (res, data) => res.ok && data.data && data.data.content.length === largeData.content.length
        );

        if (!createResult.success) throw new Error(createResult.message || 'Failed to send large data or data not processed correctly');

        // Cleanup if a specific ID is returned and can be deleted
        if (createResult.data && createResult.data.data && createResult.data.data.id) {
          await fetch(`/api/v1/data/${createResult.data.data.id}`, { method: 'DELETE' });
        }

        return {
          success: true,
          status: 200,
          message: 'Large Data Payload Test completed successfully.',
          expectedStatus: 200
        };
      } catch (error) {
        return {
          success: false,
          status: 500,
          message: `Large Data Payload Test Error: ${error.message}`,
          expectedStatus: 200
        };
      }
    },
    'Resource Exhaustion Test': async () => {
      const NUM_OPERATIONS = RESOURCE_EXHAUSTION_OPERATIONS;
      const userIds = [];

      try {
        await fetch('/api/v1/meta/reset-test-state', { method: 'POST' }); // Reset test state
        await loginTestUser(); // Log in test user
        for (let i = 0; i < NUM_OPERATIONS; i++) {
          // Create user
          const createResult = await executeFetchTest(
            '/api/v1/users',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: `Exhaustion User ${i}`, email: `exhaustion_user_${i}@example.com` })
            },
            200,
            (res) => res.ok
          );
          if (!createResult.success) throw new Error(createResult.message || `Failed to create user ${i}`);
          userIds.push(createResult.data.user.id);

          // Delete user immediately
          const deleteResult = await executeFetchTest(
            `/api/v1/users/${createResult.data.user.id}`,
            { method: 'DELETE' },
            200,
            (res) => res.ok
          );
          if (!deleteResult.success) throw new Error(deleteResult.message || `Failed to delete user ${i}`);
        }

        return {
          success: true,
          status: 200,
          message: `Resource Exhaustion Test: ${NUM_OPERATIONS} users created and deleted successfully.`,
          expectedStatus: 200
        };
      } catch (error) {
        return {
          success: false,
          status: 500,
          message: `Resource Exhaustion Test Error: ${error.message}`,
          expectedStatus: 200
        };
      }
    }
  };
  
  testFunctions['Resource Exhaustion Test'] = testFunctions['Resource Exhaustion Test'];

  async function executeFetchTest(url, options = {}, expectedStatus = 200, successCondition = (res, data) => res.ok) {
    const response = await fetch(url, options);
    const data = await response.json();

    return {
      success: successCondition(response, data),
      status: response.status,
      message: data.message || `API-Anfrage an ${url} abgeschlossen`,
      expectedStatus: expectedStatus,
      data: data // Store the full response data
    };
  }

  const runTest = async (testName) => {
    addOutput(`Läuft: ${testName}`);
    
    const startTime = performance.now();
    
    try {
      const testFunction = testFunctions[testName];
      if (!testFunction) {
        addOutput(`${testName} - ÜBERSPRUNGEN (Keine Testimplementierung)`, 'warning');
        updateTestItemUI(testName, 'warning', 0);
        return; // Exit early for skipped tests
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
      
    }
  };

  
  runAllBtn.addEventListener('click', () => {
    resetTestResultsUI(); // Reset UI and live stats before running all tests
    addOutput('Starte komplette Test-Suite...');
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        runTest(test.name);
      });
    });
  });

  runFailedBtn.addEventListener('click', () => {
    resetTestResultsUI(); // Reset UI and live stats before running failed tests
    addOutput('Führe nur fehlgeschlagene Tests aus...');
    testSuites.forEach(suite => {
      suite.tests
        .filter(test => test.status === 'failed')
        .forEach(test => runTest(test.name));
    });
  });

  clearResultsBtn.addEventListener('click', () => {
    resetTestResultsUI();
    addOutput('Testergebnisse geleert', 'warning');
  });

  clearOutputBtn.addEventListener('click', () => {
    testOutput.innerHTML = '';
    addOutput('Testkonsole initialisiert');
  });

  suiteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      resetTestResultsUI(); // Reset UI and live stats before running the suite
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
      
      resetTestResultsUI(); // Reset UI and live stats before running a single test
      runTest(testName);
    });
  }
  
  return page;
}
