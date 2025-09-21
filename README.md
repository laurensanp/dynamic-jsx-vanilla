# ts – API Konsole (aktueller Stand)

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

## Verzeichnisstruktur (vereinfacht)

- `main.js` – Express-Server: Middleware, Routen, Logging, statische Auslieferung unter `/public`.
- `public/` – Client-Code und Assets
  - `index.html` – Einstieg, lädt `app.js`
  - `global.css` – globales Styling (schwarzes Theme via CSS-Variablen)
  - `app.js` – Layout/Navi, Seitenwechsel-Setup
  - `setup/`
    - `dom.js` – Hilfen für Template/Render/DOM-Utilities
    - `pageSwitch.js` – Lazy-Load und Rendering der Seitenmodule
  - `pages/`
    - `_main_page.js` – Übersicht/Dashboard
    - `api_page.js` – API-Konsole zum Testen von Endpunkten
    - `log_page.js` – Log-Ansicht
    - `test_page.js` – Demo-Tests
  - `utils/` (neu)
    - `api.js` – fetch-Hilfsfunktionen (request/get/post/put/del)
    - `theme.js` – stellt sicher, dass das Dark Theme aktiv ist
- `private/` – Server-interne Module
  - `middleware/auth.js` – IP-Erfassung und Cookie-basierte Auth
  - `routes/index.js` – Alle Routen (Web + API)
  - `utils/logger.js` – Konsolen-Wrapper, schreibt in `server.log`

## Theme (schwarz/dunkel)

- CSS-Variablen sind in `public/global.css` definiert (schwarzer Hintergrund, dunkle Flächen, helle Schrift).
- Der Client erzwingt beim Start ein dunkles Theme über `utils/theme.js`.

## Wichtige Skripte

- `npm run dev` – Startet den Express-Server (Port 8000)

## Authentifizierung

- Login: `GET /api/v1/login` (setzt Cookie `authenticated=true` und leitet auf `/`)
- Logout: `GET /api/v1/logout` (löscht Cookie und leitet auf `/`)
- Geschützte Endpunkte liefern 403 ohne gültigen Cookie.

## API (Auszug)

- `GET /api/v1/hello` – einfache JSON-Antwort
- `GET /api/v1/health` – Health-Check
- `GET /api/v1/logs` – Server-Logs (aus `server.log`)
- `GET /api/v1/meta/endpoints` – listet registrierte API-Endpunkte
- CRUD-Dummies unter `/api/v1/users` (in-Memory)
- `GET /api/v1/shut` – Shutdown-Endpunkt (mit Testmodus über Header `x-test-mode: true`)

## Logging

Ein Konsolen-Wrapper schreibt sämtliche Logs (inkl. Kategorien) nach `server.log` und spiegelt sie in der Konsole. Kategorien u. a.: `console.log.user`, `console.log.server`, `console.log.api`, `console.error.os`, `console.error.shutdown`.

## Änderungen in diesem Stand

- Client-Utils hinzugefügt: `public/utils/api.js` (einheitliche Fetch-Handhabung), `public/utils/theme.js` (Dark Theme erzwingen)
- Pages teilweise auf `utils/api` umgestellt (`_main_page.js`, `api_page.js`)
- Sicherstellung des Dark Themes beim App-Start (Import in `public/app.js`)

## Hinweise zur Weiterentwicklung

- Weitere gemeinsame Logik aus `pages/*` nach `public/utils/*` auslagern (z. B. Formatierung, UI-Helfer)
- Falls nötig, Tests/CI hinzufügen und Linting/Formatting etablieren

