module.exports = {
  INITIAL_TEST_USERS: [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" }
  ],
  INITIAL_NEXT_USER_ID: 3,
  INITIAL_TEST_DATA_RECORDS: [
    { id: 1, value: "test data 1" },
    { id: 2, value: "test data 2" }
  ],
  INITIAL_NEXT_DATA_ID: 3,

  HEALTH_API_RESPONDING: "API responding",
  HEALTH_DATABASE_UNAVAILABLE: "Unavailable",
  HEALTH_DATABASE_AVAILABLE: (count) => `In-memory data available (${count} users)`,
  HEALTH_DATABASE_MISSING: "In-memory data missing",
  HEALTH_CACHE_PING_FAILED: "Cache ping failed",
  HEALTH_CACHE_OK: "Cache OK",
  HEALTH_MONITORING_NOT_ACCESSIBLE: "Log file not accessible",
  HEALTH_MONITORING_AVAILABLE: (size) => `Log file size ${size} bytes`,
  HEALTH_MONITORING_MISSING: "Log file missing",
  HEALTH_OK_THRESHOLD: 4,
  HEALTH_DEGRADED_THRESHOLD: 2,
};
