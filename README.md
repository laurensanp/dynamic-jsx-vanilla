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
Die Anwendung ist in zwei Hauptbereiche unterteilt: `private/` für serverseitige Logik und `public/` für clientseitige Assets.

*   `main.js`: Der Haupteinstiegspunkt der Anwendung, der den Express-Server initialisiert und Middleware und Routen einrichtet.
*   `private/`:
    *   `middleware/`: Enthält Middleware-Funktionen wie Authentifizierung (`auth.js`) und IP-Erfassung.
    *   `routes/`: Definiert API-Routen für Authentifizierung (`authRoutes.js`), Benutzer (`users.js`), Metadaten (`meta.js`) und Testdaten (`data.js`). Die `index.js` konsolidiert diese Routen.
    *   `utils/`: Hilfsmodule für Cache-Verwaltung (`cache.js`), Endpunkt-Dienstprogramme (`endpointUtils.js`), benutzerdefiniertes Logging (`logger.js`) und Router-Dienstprogramme (`routerUtils.js`).
*   `public/`:
    *   `app.js`: Der Haupteinstiegspunkt der clientseitigen Anwendung, der das Layout rendert und das Seitenwechseln einrichtet.
    *   `css/`: Enthält modularisierte CSS-Dateien (`variables.css`, `base.css`, `components.css`, `utilities.css`, `animations.css`, `layout.css`, `media.css`), die über `global.css` importiert werden.
    *   `pages/`: Enthält JavaScript-Module für verschiedene Frontend-Seiten wie das Haupt-Dashboard (`_main_page.js`), die API-Konsole (`api_page.js`), die Protokollseite (`log_page.js`) und die Test-Suite (`test_page.js`).
    *   `setup/`: JavaScript-Dateien für DOM-Manipulation (`dom.js`), Layout-Struktur (`layout.js`), Navigationslogik (`navigation.js`) und Seitenwechselmechanismen (`pageSwitch.js`).
    *   `utils/`: Hilfs-JavaScript-Module für API-Aufrufe (`api.js`), Logout-Funktionalität (`logout.js`) und Theme-Management (`theme.js`).
*   `tests/`: Enthält Integrations- und Performance-Tests.
*   `scripts/`: Enthält Utility-Skripte (z.B. `remove_comments.js`, welches ich Ihnen gerade erstellt habe).
*   `server.log`: Die Protokolldatei, in die alle Server-Logs geschrieben werden.
*   `package.json`: Definiert Projektmetadaten und Abhängigkeiten.

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

