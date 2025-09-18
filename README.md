# ts 🥀🎋 anwendung

Dies ist eine einfache Node.js-Anwendung, die mit Express erstellt wurde. Sie dient statische Dateien aus, verarbeitet API-Anfragen und implementiert einen grundlegenden Seitenwechselmechanismus auf der Client-Seite.

## Installation

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/laurensanp/dynamic-jsx-vanilla
    cd dynamic-jsx-vanilla
    ```
2.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    # oder
    yarn install
    # oder
    pnpm install
    ```

## Verwendung

1.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    # oder
    yarn dev
    ```
2.  **Anwendung aufrufen:**
    Öffnen Sie Ihren Webbrowser und navigieren Sie zu `http://localhost:8000` oder mittels der IP4 vom Server.

    *   Die Hauptseite (`_main_page.js`) wird standardmäßig geladen.
    *   Sie können zur "API-Seite" (`api_page.js`) navigieren, um mit den Endpunkten `/api/v1/hello` und `/api/v1/shut` zu interagieren.
    *   Die "Testseite" (`test_page.js`) ist ebenfalls verfügbar.
    *   Die "Logs"-Seite (`log_page.js`) ist verfügbar, um die Server-Konsolenausgabe in Echtzeit mit automatischer Aktualisierung anzuzeigen.
    *   Sie können sich über `/api/v1/login` anmelden (wodurch ein authentifizierter Cookie gesetzt wird) und sich über die Schaltfläche "Logout" abmelden.

## Projektstruktur

*   `main.js`: Der Haupt-Einstiegspunkt des Node.js Express-Servers, der die Middleware, Logger und Routen importiert und verwendet.
*   `public/`: Enthält statische Assets wie `index.html` und `global.css`, sowie clientseitige Seitenmodule wie `log_page.js`.
*   `private/`: Enthält clientseitiges JavaScript für die Anwendungslogik sowie server-interne Module.
    *   `private/middleware/`: Enthält anwendungsspezifische Middleware (z.B. `auth.js` für IP-Erfassung und Authentifizierung).
    *   `private/routes/`: Definiert alle API- und Web-Routen der Anwendung (z.B. `index.js`).
    *   `private/utils/`: Enthält Hilfsprogramme (z.B. `logger.js` für das Protokollsystem).
    *   `private/pages/`: Enthält individuelle Seitenmodule (z.B. `_main_page.js`, `api_page.js`, `test_page.js`).

## API-Endpunkte

*   `GET /`: Liefert `public/index.html` nach einer Authentifizierungsprüfung aus.
*   `GET /api/v1/login`: Setzt einen authentifizierten Cookie und leitet zu `/` weiter.
*   `GET /api/v1/logout`: Löscht den authentifizierten Cookie und leitet zu `/` weiter.
*   `GET /api/v1/hello`: Gibt eine JSON-Nachricht zurück.
*   `GET /api/v1/shut`: Gibt eine Nachricht zurück, die eine vorübergehende Deaktivierung anzeigt (Herunterfahrfunktion ist auskommentiert).
*   `GET /api/v1/logs`: Gibt die gesammelten Server-Logs mit Zeitstempeln und Kategorien zurück.

## Logging-System

Die Anwendung verwendet ein benutzerdefiniertes Protokollsystem, das alle Konsolenausgaben in die Datei `server.log` schreibt. Diese Datei wird bei jedem Serverstart geleert und ist in `.gitignore` eingetragen.

Jeder Protokolleintrag enthält einen Zeitstempel und eine optionale Kategorie für eine bessere Organisation. Die Protokolle werden sowohl im Terminal als auch auf der "Logs"-Seite in der Anwendung angezeigt.

Verfügbare kategorisierte Protokollmethoden:
*   `console.log.user('Nachricht')`: Für benutzerbezogene Aktionen (z.B. Anmeldung, Abmeldung, Seitenzugriffe).
*   `console.log.server('Nachricht')`: Für Serverereignisse (z.B. Serverstart).
*   `console.log.api('Nachricht')`: Für API-Anfragen.
*   `console.error.os('Fehlernachricht')`: Für betriebssystembezogene Fehler.
*   `console.error.shutdown('Fehlernachricht')`: Für Fehler im Zusammenhang mit dem Herunterfahren des Servers.

Ein direkter Aufruf von `console.log('Nachricht')` wird ohne zusätzliche Kategorie protokolliert, während `console.error('Fehlernachricht')` die Kategorie `[ERROR]` erhält.

