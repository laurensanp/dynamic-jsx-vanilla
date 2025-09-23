export const testSuites = [
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
