# dynamic-jsx-vanilla

## Inhaltsverzeichnis

*   [Über dieses Projekt](#über-dieses-projekt)
*   [Architektur und Funktionsweise](#architektur-und-funktionsweise)
*   [Funktionen](#funktionen)
*   [Installation](#installation)
*   [Ausführung](#ausführung)
*   [Verwendete Technologien](#verwendete-technologien)

## Über dieses Projekt

Dies ist eine einfache Webanwendung, die mit Node.js und Express erstellt wurde. Das Frontend ist von React JS inspiriert und verwendet einen benutzerdefinierten Mechanismus zur dynamischen JSX-ähnlichen Rendering in Vanilla JavaScript. Sie dient als Beispiel für eine grundlegende Server-Client-Interaktion und das Umschalten von Seiten ohne vollständiges Neuladen.

## Architektur und Funktionsweise

### Server (Backend)

Der **Node.js-Server**, implementiert mit **Express.js** (`main.js`), fungiert als einheitlicher Eintrittspunkt für die Anwendung. Er ist verantwortlich für:

*   **Statische Dateibereitstellung:** Stellt alle Frontend-Assets (HTML, CSS, JavaScript-Module) aus den Verzeichnissen `public` und `private` bereit.
*   **API-Endpunkte:** Bietet REST-Endpunkte für die Interaktion mit der Client-Seite, wie z.B. `/api/v1/hello` für Datenabrufe und `/api/v1/shut` für die Server-Steuerung (mit entsprechender Warnung).

### Frontend (Client)

Das **Frontend**, hauptsächlich in Vanilla JavaScript geschrieben und von React JS inspiriert, wird dynamisch im Browser gerendert. Es besteht aus:

*   **Seitenstruktur und Routing:** Die `index.html` lädt das Haupt-JavaScript-Modul (`private/app.js`), das für die Initialisierung der Anwendung und das Einrichten der Seitenumschaltung zuständig ist.
*   **Dynamische Seitenumschaltung:** Das Modul `private/setup/pageSwitch.js` handhabt das dynamische Laden und Anzeigen von Seitenmodulen (z.B. `main_page.js`, `test_page.js`) basierend auf Benutzerinteraktionen (Knopfdruck).
*   **JSX-ähnliches Rendering:** Das `html`-Tag-Funktion in `private/setup/dom.js` ermöglicht ein deklaratives Definieren von UI-Komponenten direkt in JavaScript, ähnlich wie bei JSX in React. Dies erstellt DOM-Fragmente, die dann in den `root`-Container der Seite eingefügt werden.
*   **API-Interaktion:** Die Client-Seite kommuniziert mit den vom Server bereitgestellten API-Endpunkten, um Daten abzurufen oder Aktionen auszulösen.

## Funktionen

*   **Vollständige Webanwendung:** Eine integrierte Lösung, die sowohl Frontend-Assets bereitstellt als auch Backend-API-Endpunkte handhabt.
*   **Dynamisches Frontend-Rendering:** Inspiriert von React JS, mit einem benutzerdefinierten JSX-ähnlichen Rendering-System in Vanilla JavaScript.
*   **Nahtlose Seitenumschaltung:** Ermöglicht das Wechseln zwischen verschiedenen Ansichten ohne vollständiges Neuladen der Seite.
*   **API-Interaktion:** Bereitstellung und Nutzung von REST-API-Endpunkten für Datenabruf und spezifische Serveraktionen (einschließlich einer Warnung vor dem Herunterfahren des Servers).

## Installation

```bash
npm install
```

## Ausführung

Der Server läuft auf Port 8000.

```javascript
npm run dev
```

## Verwendete Technologien

*   Node.js
*   Express.js
*   HTML, CSS, JavaScript (Client-seitig)

