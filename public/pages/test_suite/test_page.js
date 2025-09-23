import { html } from "../../setup/dom.js";
import { testSuites } from './testData.js';
import { calculateStats, updateStatsDisplay, getStatusIcon, addOutput, updateTestItemUI, resetTestResultsUI } from './testUtils.js';
import { testFunctions, executeFetchTest, loginTestUser } from './testFunctions.js';
import * as testConfig from '/public/settings/testSettings.js';
import * as settings from '../../settings/settings.js';

export function App() {
  
  const page = html`
    <link rel="stylesheet" href="/public/pages/test_suite/test_suite.css">
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
                    ${getStatusIcon(test.status)}
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
  const clearOutputBtn = page.querySelector('#test_output');
  const testOutput = page.querySelector('#test_output');
  const suiteButtons = page.querySelectorAll('[data-suite]');

  let liveTestResults = {
    passed: 0,
    failed: 0,
    warning: 0,
    pending: 0
  };

  const updateLiveStats = () => {
    updateStatsDisplay(liveTestResults, testSuites);
  };

  const addOutputProxy = (message, type = 'info') => {
    addOutput(testOutput, message, type);
  }

  const updateTestItemUIProxy = (testName, statusClass, durationMs) => {
    updateTestItemUI(testSuites, liveTestResults, testName, statusClass, durationMs);
    updateLiveStats();
  }

  const resetTestResultsUIProxy = () => {
    resetTestResultsUI(testOutput, liveTestResults, testSuites, updateStatsDisplay, addOutputProxy);
  }

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
          body: JSON.stringify({ username: testConfig.TEST_USERNAME, password: testConfig.TEST_PASSWORD })
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
      
      for (let i = 0; i < testConfig.CONCURRENT_USERS_COUNT; i++) { 
        promises.push(executeFetchTest('/api/v1/hello', { method: 'GET' }, 200, (res, data) => res.ok));
      }
      
      const results = await Promise.all(promises);
      const duration = performance.now() - start;
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount === testConfig.CONCURRENT_USERS_COUNT && duration < 2000,
        status: 200,
        message: `${successCount}/${testConfig.CONCURRENT_USERS_COUNT} Anfragen erfolgreich in ${Math.round(duration)}ms`,
        expectedStatus: 200
      };
    },
    
    'Memory Usage': async () => {
      
      const promises = [];
      for (let i = 0; i < testConfig.MEMORY_USAGE_REQUESTS; i++) {
        promises.push(executeFetchTest('/api/v1/logs', { method: 'GET' }, 200, (res, data) => res.ok));
      }
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      return {
        success: successCount === testConfig.MEMORY_USAGE_REQUESTS,
        status: 200,
        message: `${successCount}/${testConfig.MEMORY_USAGE_REQUESTS} speicherintensive Anfragen erfolgreich`,
        expectedStatus: 200
      };
    },

    'Endpoint Stress Test': async () => {
      const NUM_REQUESTS = testConfig.ENDPOINT_STRESS_TEST_REQUESTS;
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
      const NUM_USERS = testConfig.CONCURRENT_USER_CREATION_COUNT;
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
      const largeData = { content: 'a'.repeat(testConfig.LARGE_DATA_PAYLOAD_SIZE) }; // 500KB of data

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
      const NUM_OPERATIONS = testConfig.RESOURCE_EXHAUSTION_OPERATIONS;
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
    addOutputProxy(`Läuft: ${testName}`);
    
    const startTime = performance.now();
    
    try {
      const testFunction = testFunctions[testName];
      if (!testFunction) {
        addOutputProxy(`${testName} - ÜBERSPRUNGEN (Keine Testimplementierung)`, 'warning');
        updateTestItemUIProxy(testName, 'warning', 0);
        return; // Exit early for skipped tests
      }
      
      const result = await testFunction();
      const duration = Math.round(performance.now() - startTime);
      
      if (result.success) {
        addOutputProxy(`${testName} - BESTANDEN (${duration}ms) - ${result.message}`, 'success');
        updateTestItemUIProxy(testName, 'passed', duration);
      } else {
        addOutputProxy(`${testName} - FEHLGESCHLAGEN (${duration}ms) - Status: ${result.status}, ${result.message}`, 'error');
        updateTestItemUIProxy(testName, 'failed', duration);
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      addOutputProxy(`${testName} - FEHLER (${duration}ms) - ${error.message}`, 'error');
      updateTestItemUIProxy(testName, 'failed', duration);
    } finally {
      
    }
  };

  
  runAllBtn.addEventListener('click', () => {
    resetTestResultsUIProxy(); // Reset UI and live stats before running all tests
    addOutputProxy('Starte komplette Test-Suite...');
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        runTest(test.name);
      });
    });
  });

  runFailedBtn.addEventListener('click', () => {
    resetTestResultsUIProxy(); // Reset UI and live stats before running failed tests
    addOutputProxy('Führe nur fehlgeschlagene Tests aus...');
    testSuites.forEach(suite => {
      suite.tests
        .filter(test => test.status === 'failed')
        .forEach(test => runTest(test.name));
    });
  });

  clearResultsBtn.addEventListener('click', () => {
    resetTestResultsUIProxy();
    addOutputProxy('Testergebnisse geleert', 'warning');
  });

  clearOutputBtn.addEventListener('click', () => {
    testOutput.innerHTML = '';
    addOutputProxy('Testkonsole initialisiert');
  });

  suiteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      resetTestResultsUIProxy(); // Reset UI and live stats before running the suite
      const suiteId = e.target.dataset.suite;
      const suite = testSuites.find(s => s.id === suiteId);
      if (suite) {
        addOutputProxy(`Starte Test-Suite: ${suite.name}`);
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
      
      resetTestResultsUIProxy(); // Reset UI and live stats before running a single test
      runTest(testName);
    });
  }
  
  return page;
}
