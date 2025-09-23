# ts – API Konsole

Diese Anwendung ist eine kleine Node.js/Express-App mit einer Vanilla-JS-Frontend-Oberfläche. Sie liefert statische Dateien aus, bietet mehrere API-Endpunkte und eine modulare Client-Seite mit Seitenwechsel (SPA-ähnlich).

Der Standard ist ein schwarzes (Dark) Theme: Hintergrund ist schwarz, Oberflächen sind dunkel, Text ist hell. Das Theme wird zusätzlich beim Start im Client erzwungen.

## Schnellstart

- Voraussetzungen: Node.js 18+
- Installieren:
  ```bash
  npm install
  ```
- Starten (Entwicklung):
  ```bash
  npm run dev
  ```
- Aufrufen: http://localhost:8000

## Hinweise zur Weiterentwicklung

- Weitere gemeinsame Logik aus `pages/*` nach `public/utils/*` auslagern (z. B. Formatierung, UI-Helfer)
- Falls nötig, Tests/CI hinzufügen und Linting/Formatting etablieren

## Projektübersicht

Dieses Projekt `ts` ist eine Node.js-Anwendung, die einen Backend-API-Server mit einem einfachen Frontend für die Verwaltung und Überwachung der API-Endpunkte kombiniert.

### 1. Zweck des Projekts
Das Hauptziel des Projekts ist es, eine Plattform zum Testen und Überwachen von API-Endpunkten bereitzustellen. Es beinhaltet grundlegende Authentifizierungs-, Benutzer- und Datenverwaltungsfunktionen sowie ein robustes Logging-System. Unteranderem soll es einm React-Like Syntax entsprechen.

### 2. Schlüsseltechnologien
*   **Backend**: Node.js mit dem Express.js-Framework für den API-Server.
*   **Frontend**: Reines HTML, CSS und JavaScript für eine clientseitige Anwendung, die die API-Konsole, die Test-Suite und die Systemprotokolle anzeigt.
*   **Styling**: Modernes CSS mit Variablen für Design-Tokens und einer modularen Struktur.
*   **Testing**: Jest für Unit- und Integrationstests.

### 3. Dateistruktur
```
.
├── public/                 # Client-side (Frontend) code - served to the browser
│   ├── index.html          # Main HTML file, the entry point for the SPA
│   ├── app.js              # Core client-side application logic, orchestrates page loading
│   ├── css/                # Global and component-specific stylesheets
│   ├── setup/              # Core client-side utilities for application setup
│   │   ├── dom.js          # DOM manipulation helpers (modals, toasts)
│   │   ├── layout.js       # Renders overall page layout (header, navigation)
│   │   ├── navigation.js   # Handles navigation button active states
│   │   └── pageSwitch.js   # Manages dynamic loading and switching of pages
│   ├── pages/              # Individual page modules, dynamically loaded by pageSwitch.js
│   │   ├── _main_page/     # Dashboard page
│   │   │   ├── _main_page.css
│   │   │   ├── _main_page.js   # Page-specific App and onMount functions
│   │   │   ├── dashboardService.js # Data fetching for the dashboard
│   │   │   └── dashboardUtils.js   # Utility functions for dashboard UI
│   │   ├── api_console/    # API Console page
│   │   │   ├── api_console.css
│   │   │   ├── api_page.js
│   │   │   ├── apiService.js   # API call execution
│   │   │   └── apiUtils.js     # Utilities for API console UI (e.g., output formatting)
│   │   ├── log_viewer/     # System Logs viewer page
│   │   │   ├── log_page.js
│   │   │   ├── log_viewer.css
│   │   │   ├── logService.js   # Log fetching and clearing
│   │   │   └── logUtils.js     # Utilities for log parsing, filtering, and rendering
│   │   └── test_suite/     # Test Suite page
│   │       ├── test_page.js
│   │       ├── test_suite.css
│   │       ├── testData.js     # Test-specific data
│   │       └── testFunctions.js  # Functions to execute tests
│   ├── settings/           # Centralized client-side configuration files
│   │   ├── settings.js     # General client-side settings
│   │   ├── appSettings.js  # Settings for app.js (e.g., pages configuration)
│   │   ├── apiSettings.js  # Settings for public/utils/api.js (e.g., default fetch options)
│   │   ├── authSettings.js # Client-side authentication-related settings (e.g., logout messages, endpoints)
│   │   ├── domSettings.js  # Settings for public/setup/dom.js (e.g., modal/toast defaults)
│   │   ├── layoutSettings.js # Settings for public/setup/layout.js and navigation.js (e.g., brand text, nav links)
│   │   ├── _main_pageSettings.js # Settings specific to the dashboard page
│   │   ├── pageSwitchSettings.js # Settings for public/setup/pageSwitch.js (e.g., page module base path)
│   │   └── testSettings.js # Settings specific to the test suite page
│   └── utils/              # General client-side utility functions
│       ├── api.js          # Generic API interaction functions
│       └── logout.js       # Logout functionality
│       └── theme.js        # Theme switching logic
│
├── private/                # Server-side (Backend) code - Node.js
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # Authentication middleware
│   ├── routes/             # API route definitions for Express
│   │   ├── authRoutes.js   # Authentication-related endpoints (login, logout)
│   │   ├── data.js         # Data management endpoints
│   │   ├── index.js        # Server root route (serves index.html)
│   │   ├── meta.js         # Metadata and server control endpoints (e.g., shutdown)
│   │   └── users.js        # User management endpoints
│   ├── settings/           # Centralized server-side configuration files
│   │   ├── serverAuthSettings.js   # Server-side authentication settings
│   │   ├── serverCacheSettings.js  # Server-side cache settings
│   │   ├── serverDataSettings.js   # Server-side data management settings
│   │   ├── serverEndpointSettings.js # Server-side endpoint utility settings
│   │   ├── serverLoggerSettings.js # Server-side logger settings
│   │   ├── serverMetaSettings.js   # Server-side meta/test settings
│   │   ├── serverPathsSettings.js  # Server-side path settings (e.g., to public/index.html)
│   │   └── serverUsersSettings.js  # Server-side user management settings
│   └── utils/              # Server-side utility functions
│       ├── authUtils.js    # Authentication-related helpers
│       ├── cache.js        # Caching mechanisms
│       ├── endpointUtils.js  # Helpers for endpoint management (e.g., initial data)
│       ├── logger.js       # Server-side logging utility
│       └── routerUtils.js  # Utilities for Express router setup
│
├── tests/                  # Application tests
│   ├── integration.test.js # Integration tests
│   ├── performance.test.js # Performance tests
│   └── testConfig.js       # Test-specific configuration (was moved from public/utils/testConfig.js)
│
├── jest.config.js          # Jest test runner configuration
├── main.js                 # Main server entry point (starts Express app)
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```

**Key Principles of the Structure:**

*   **Separation of Concerns:** Client-side and server-side codebases are distinct, interacting primarily via API calls.
*   **Modular Pages:** Each page in `public/pages/` is a self-contained module, typically including its own CSS, JavaScript logic (`_page.js`), data services (`*Service.js`), and utility functions (`*Utils.js`). This promotes reusability and maintainability.
*   **Centralized Configuration:** The `settings/` directories (both `public` and `private`) house all configurable values, making it easy to manage and update application parameters without digging through business logic.
*   **Clear Routing:** `private/routes/` defines server API endpoints, while `public/setup/pageSwitch.js` handles client-side routing and dynamic page loading.
*   **Utility Functions:** Shared functionalities are organized into `utils/` directories, reducing code duplication.

This structure allows for easier development, debugging, and future expansion, as different parts of the application can be worked on independently.

### 4. Kernfunktionalitäten
*   **API-Endpunkte**:
    *   `GET /api/v1/hello`: Ein einfacher Endpunkt, der eine Begrüßungsnachricht zurückgibt.
    *   `GET /api/v1/health` & `GET /api/v1/health/full`: Endpunkte zur Überprüfung des Systemzustands.
    *   `GET /api/v1/meta/active-tests` & `POST /api/v1/meta/active-tests`: Verwalten der Anzahl der aktiven Tests.
    *   `GET /api/v1/meta/test-error`: Ein Endpunkt zur Simulation eines Fehlers.
    *   `GET /api/v1/shut`: Ein Endpunkt zum Herunterfahren des Servers (mit Testmodus).
    *   `GET /api/v1/logs`: Ruft die Serverprotokolle ab.
    *   `GET /api/v1/login` & `GET /api/v1/logout`: Authentifizierungs-Flow.
    *   `GET /api/v1/users`, `POST /api/v1/users`, `GET /api/v1/users/:id`, `DELETE /api/v1/users/:id`: CRUD-Operationen für Benutzer.
    *   `GET /api/v1/data`, `DELETE /api/v1/data`: Verwaltung von Testdaten.
*   **Benutzerdefiniertes Logging**: Das Projekt verwendet ein benutzerdefiniertes `console`-Objekt, das Log-Nachrichten mit Zeitstempel, Typ (INFO, ERROR, WARN, DEBUG) und optionaler Kategorie (z.B. USER, SERVER, API) formatiert und sie sowohl in der Konsole als auch in `server.log` ausgibt.
*   **Clientseitige Navigation**: Das Frontend ermöglicht das nahtlose Wechseln zwischen verschiedenen Seiten (Dashboard, API-Konsole, Test-Suite, Protokolle) ohne vollständiges Neuladen der Seite.
*   **API-Konsole**: Eine interaktive Oberfläche im Frontend, um API-Anfragen zu stellen und Antworten anzuzeigen.
*   **Test-Suite**: Ein Frontend-Dashboard zur Ausführung und Anzeige von API-, Integrations- und Leistungstests.
*   **Systemprotokolle**: Eine dedizierte Seite im Frontend, die Echtzeit-Serverprotokolle mit Filter- und Suchfunktionen anzeigt.

### 5. Kürzliche Änderungen
In unserer letzten Interaktion wurden folgende wichtige Änderungen vorgenommen:
*   **CSS-Restrukturierung**: Die ursprüngliche `public/global.css`-Datei wurde in einen `public/css`-Ordner aufgeteilt, um CSS-Variablen, Basisstile, Komponenten, Utilities, Animationen, Layout und Medientypen in separate Dateien zu gliedern. Leere Verzeichnisse und nicht verwendete CSS-Importe wurden entfernt.
*   **Logger-Korrekturen**: Es wurden Korrekturen am `private/utils/logger.js`-Modul vorgenommen, um sicherzustellen, dass die korrekten Log-Typen (z.B. DEBUG, ERROR) in den Serverprotokollen und auf der Frontend-Protokollseite korrekt angezeigt werden. Dies umfasste die Bindung nativer Konsolenmethoden und die Anpassung der Log-Parsing-Logik im Frontend.
*   **Fehlerbehebung**: Ein `SyntaxError` in `main.js` im Zusammenhang mit einem unvollständigen Template-Literal wurde behoben.
*   **Unnötigen Code entfernt**: Nicht verwendete Abhängigkeiten (z.B. `child_process` aus `package.json`, da es ein integriertes Node.js-Modul ist) und nicht verwendete Funktionen (z.B. `createComponent`, `$` und `$$` aus `public/setup/dom.js`) wurden entfernt.
*   **Standardisierung des Seitenexports**: `public/pages/_main_page.js` wurde geändert, um die `App`-Funktion zu exportieren, wodurch die Konsistenz mit anderen Seitenmodulen in `public/setup/pageSwitch.js` sichergestellt wird.
*   **Refaktorierung der Einstellungen**: Alle anwendungsweiten Einstellungen wurden in dedizierte `settings` Ordner sowohl im `public/` als auch im `private/` Verzeichnis verschoben und in modularen Dateien organisiert (z.B. `apiSettings.js`, `authSettings.js`, `_main_pageSettings.js`). Dies zentralisiert die Konfiguration und verbessert die Wartbarkeit.
*   **Verbesserte DOM-Interaktionen**: Die Logik für DOM-Elementabfragen und Event-Listener-Zuweisungen wurde in die `onMount` Funktionen der Seitenmodule (`api_page.js`, `log_page.js`) verschoben, um sicherzustellen, dass DOM-Elemente vor dem Zugriff vollständig gerendert sind. Dies behebt Fehler im Zusammenhang mit undefinierten Elementen.
*   **Konsistente Funktionsparameter**: Die Parameterübergabe an Utility-Funktionen, insbesondere in `logUtils.js`, wurde korrigiert, um die korrekte Übergabe von DOM-Elementen und anderen Werten sicherzustellen, wodurch `TypeError`-Fehler behoben wurden.

