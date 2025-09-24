
import * as TestSettings from "/public/settings/testSettings.js";

export const testSuites = [
  {
    id: "api-tests",
    name: "API-Endpunkt-Tests",
    description: "Testen Sie CRUD-Operationen und API-Funktionalität",
    tests: [
      { name: "GET /api/v1/hello", status: "pending", duration: "-" },
      { name: "POST /api/v1/auth", status: "pending", duration: "-" },
      { name: "GET /api/v1/users", status: "pending", duration: "-" },
      { name: "CREATE User Test", status: "pending", duration: "-" },
      { name: "Concurrent User Creation", status: "pending", duration: "-" },
      { name: "Full User CRUD Test", status: "pending", duration: "-" },
      { name: "Brute-Force Login Attempt", status: "pending", duration: "-" },
      { name: "Data Integrity Test", status: "pending", duration: "-" },
      { name: "Large Data Payload Test", status: "pending", duration: "-" },
    ],
  },
  {
    id: "integration-tests",
    name: "Integrationstests",
    description: "Ende-zu-Ende Systemintegrationstests",
    tests: [
      { name: "Database Connection", status: "pending", duration: "-" },
      { name: "Cache Layer", status: "pending", duration: "-" },
      { name: "External API", status: "pending", duration: "-" },
    ],
  },
  {
    id: "performance-tests",
    name: "Leistungstests",
    description: "Last- und Leistungstests",
    tests: [
      { name: "Response Time < 200ms", status: "pending", duration: "-" },
      {
        name: "Concurrent Users (20)",
        status: "pending",
        duration: "-",
      },
      { name: "Memory Usage", status: "pending", duration: "-" },
      { name: "Endpoint Stress Test", status: "pending", duration: "-" },
      { name: "Resource Exhaustion Test", status: "pending", duration: "-" },
    ],
  },
];
