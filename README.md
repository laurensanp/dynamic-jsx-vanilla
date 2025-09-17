# TS Anwendung

Dies ist eine einfache Node.js-Anwendung, die mit Express erstellt wurde. Sie dient statische Dateien aus, verarbeitet API-Anfragen und implementiert einen grundlegenden Seitenwechselmechanismus auf der Client-Seite.

## Installation

1.  **Repository klonen:**
    ```bash
    git clone <Ihre-Repository-URL>
    cd ts
    ```
2.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    # oder
    # yarn install
    # oder
    # pnpm install
    ```

## Verwendung

1.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    ```
2.  **Anwendung aufrufen:**
    Öffnen Sie Ihren Webbrowser und navigieren Sie zu `http://localhost:8000` oder mittels der IP vom Server.

    *   Die Hauptseite (`_main_page.js`) wird standardmäßig geladen.
    *   Sie können zur "API-Seite" (`api_page.js`) navigieren, um mit den Endpunkten `/api/v1/hello` und `/api/v1/shut` zu interagieren.
    *   Die "Testseite" (`test_page.js`) ist ebenfalls verfügbar.
    *   Sie können sich über `/api/v1/login` anmelden (wodurch ein authentifizierter Cookie gesetzt wird) und sich über die Schaltfläche "Logout" abmelden.

## Projektstruktur

*   `main.js`: Der Haupt-Einstiegspunkt des Node.js Express-Servers.
*   `public/`: Enthält statische Assets wie `index.html` und `global.css`.
*   `private/`: Enthält clientseitiges JavaScript für die Anwendungslogik, Seitenverwaltung und individuelle Seitenmodule.
    *   `private/app.js`: Initialisiert die clientseitige Anwendung und richtet den Seitenwechsel ein.
    *   `private/pages/`: Enthält individuelle Seitenmodule (z.B. `_main_page.js`, `api_page.js`, `test_page.js`).
    *   `private/setup/`: Enthält Dienstprogramme für die DOM-Manipulation (`dom.js`) und die Seitenwechsellogik (`pageSwitch.js`).

## API-Endpunkte

*   `GET /`: Liefert `public/index.html` nach einer Authentifizierungsprüfung aus.
*   `GET /api/v1/login`: Setzt einen authentifizierten Cookie und leitet zu `/` weiter.
*   `GET /api/v1/logout`: Löscht den authentifizierten Cookie und leitet zu `/` weiter.
*   `GET /api/v1/hello`: Gibt eine JSON-Nachricht zurück.
*   `GET /api/v1/shut`: Gibt eine Nachricht zurück, die eine vorübergehende Deaktivierung anzeigt (Herunterfahrfunktion ist auskommentiert).

