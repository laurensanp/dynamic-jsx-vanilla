export const INITIAL_TEST_USERS = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" }
];
export const INITIAL_NEXT_USER_ID = 3;
export const INITIAL_TEST_DATA_RECORDS = [
  { id: 1, value: "test data 1" },
  { id: 2, value: "test data 2" }
];
export const INITIAL_NEXT_DATA_ID = 3;

export const HEALTH_API_RESPONDING = "API responding";
export const HEALTH_DATABASE_UNAVAILABLE = "Unavailable";
export const HEALTH_DATABASE_AVAILABLE = (count) => `In-memory data available (${count} users)`;
export const HEALTH_DATABASE_MISSING = "In-memory data missing";
export const HEALTH_CACHE_PING_FAILED = "Cache ping failed";
export const HEALTH_CACHE_OK = "Cache OK";
export const HEALTH_MONITORING_NOT_ACCESSIBLE = "Log file not accessible";
export const HEALTH_MONITORING_AVAILABLE = (size) => `Log file size ${size} bytes`;
export const HEALTH_MONITORING_MISSING = "Log file missing";
export const HEALTH_OK_THRESHOLD = 4;
export const HEALTH_DEGRADED_THRESHOLD = 2;
