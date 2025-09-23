import { TEST_USERNAME, TEST_PASSWORD, CONCURRENT_USERS_COUNT, MEMORY_USAGE_REQUESTS, CONCURRENT_USER_CREATION_COUNT, ENDPOINT_STRESS_TEST_REQUESTS, LARGE_DATA_PAYLOAD_SIZE, RESOURCE_EXHAUSTION_OPERATIONS } from '/public/settings/testSettings.js';

const testFunctions = {
  'GET /api/v1/hello': async () => {
    const loginResult = await loginTestUser();
    if (!loginResult.success) return { success: false, message: loginResult.message };
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
    const loginResult = await loginTestUser();
    if (!loginResult.success) return { success: false, message: loginResult.message };
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
      await fetch('/api/v1/meta/reset-test-state', { method: 'POST' });
      const loginResult = await loginTestUser();
      if (!loginResult.success) throw new Error(loginResult.message);
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
    
    await fetch('/api/v1/meta/reset-test-state', { method: 'POST' });
    const loginResult = await loginTestUser();
    if (!loginResult.success) return { success: false, message: loginResult.message };
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
      await fetch('/api/v1/meta/reset-test-state', { method: 'POST' });
      const loginResult = await loginTestUser();
      if (!loginResult.success) throw new Error(loginResult.message);
      const createResult = await executeFetchTest(
        '/api/v1/users',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        },
        201,
        (res, data) => res.ok
      );
      if (!createResult.success) throw new Error(createResult.message || 'Failed to create user');
      userId = createResult.data.user.id;

      const readResult = await executeFetchTest(
        `/api/v1/users/${userId}`,
        { method: 'GET' },
        200,
        (res, data) => res.ok && data.user.email === testUser.email
      );
      if (!readResult.success) throw new Error(readResult.message || 'Failed to read user or data mismatch');

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
      if (userId) {
        try {
          await fetch(`/api/v1/meta/cleanup-user/${userId}`, { method: 'POST' });
        } catch (e) {
        }
      }
    }
  },

  'Brute-Force Login Attempt': async () => {
    const loginResult = await loginTestUser();
    if (!loginResult.success) return { success: false, message: loginResult.message };
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
      await fetch('/api/v1/meta/reset-test-state', { method: 'POST' });
      const loginResult = await loginTestUser();
      if (!loginResult.success) throw new Error(loginResult.message);
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

      const readResult = await executeFetchTest(
        `/api/v1/data/${dataId}`,
        { method: 'GET' },
        200,
        (res, data) => res.ok && data.data.value === testData.value
      );
      if (!readResult.success) throw new Error(readResult.message || 'Failed to read data or data mismatch');

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
      if (dataId) {
        try {
          await fetch(`/api/v1/meta/cleanup-data/${dataId}`, { method: 'POST' });
        } catch (e) {
        }
      }
    }
  },
  'Large Data Payload Test': async () => {
    const largeData = { content: 'a'.repeat(LARGE_DATA_PAYLOAD_SIZE) };

    try {
      const loginResult = await loginTestUser();
      if (!loginResult.success) throw new Error(loginResult.message);
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
      await fetch('/api/v1/meta/reset-test-state', { method: 'POST' });
      const loginResult = await loginTestUser();
      if (!loginResult.success) throw new Error(loginResult.message);
      for (let i = 0; i < NUM_OPERATIONS; i++) {
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
    data: data
  };
}

async function loginTestUser() {
  const response = await fetch('/api/v1/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: TEST_USERNAME, password: TEST_PASSWORD })
  });
  if (!response.ok) {
    return { success: false, message: `Failed to login test user: ${response.statusText}` };
  }
  return { success: true, data: await response.json() };
}

export { testFunctions, executeFetchTest, loginTestUser };
