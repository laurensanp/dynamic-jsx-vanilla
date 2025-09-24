import { html } from "../../setup/dom.js";
import { testSuites } from "./testData.js";
import {
  updateStatsDisplay,
  addOutput,
  updateTestItemUI,
  resetTestResultsUI,
} from "./testUtils.js";
import { testFunctions } from "./testFunctions.js";

export function App() {
  const page = html`
    <div class="test-suite">
      <div class="test-header">
        <h1>Test-Suite</h1>
        <p>Automatisiertes Test-Dashboard für API- und Systemüberprüfung</p>
        <div class="test-actions">
          <button id="run_all_btn" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Alle Tests starten
          </button>
          <button id="run_failed_btn" class="btn btn-secondary">
            Fehlgeschlagene ausführen
          </button>
          <button id="clear_results_btn" class="btn btn-ghost">
            Ergebnisse leeren
          </button>
        </div>
      </div>

      <div class="test-overview">
        <div class="test-stats">
          <div class="stat-item passed">
            <div class="stat-number" id="passed-count">0</div>
            <div class="stat-label">Bestanden</div>
          </div>
          <div class="stat-item failed">
            <div class="stat-number" id="failed-count">0</div>
            <div class="stat-label">Fehlgeschlagen</div>
          </div>
          <div class="stat-item warning">
            <div class="stat-number" id="warning-count">0</div>
            <div class="stat-label">Warnungen</div>
          </div>
          <div class="stat-item pending">
            <div class="stat-number" id="pending-count">0</div>
            <div class="stat-label">Ausstehend</div>
          </div>
        </div>
      </div>

      <div class="test-suites-grid">
        ${testSuites
          .map(
            (suite) => `
          <div class="card test-suite-card">
            <div class="card-header">
              <div>
                <div class="card-title">${suite.name}</div>
                <div class="card-description">${suite.description}</div>
              </div>
              <button class="btn btn-sm btn-secondary" data-suite="${
                suite.id
              }">Suite ausführen</button>
            </div>
            
            <div class="test-results">
              ${suite.tests
                .map(
                  (test) => `
                <div class="test-item ${test.status}">
                  <div class="test-status-icon">
                    ${getStatusIcon(test.status)}
                  </div>
                  <div class="test-info">
                    <div class="test-name">${test.name}</div>
                    <div class="test-duration">${test.duration}</div>
                  </div>
                  <div class="test-actions">
                    <button class="btn-icon" title="Test ausführen">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="card test-output">
        <div class="card-header">
          <div class="card-title">📋 Testausgabe</div>
          <button id="clear_output_btn" class="btn btn-ghost btn-sm">
            Leeren
          </button>
        </div>
        <div id="test_output" class="output test-console"></div>
      </div>
    </div>
  `;

  function getStatusIcon(status) {
    switch (status) {
      case "passed":
        return "✓";
      case "failed":
        return "✗";
      case "warning":
        return "⚠";
      case "pending":
        return "⏳";
      default:
        return "●";
    }
  }

  const runAllBtn = page.querySelector("#run_all_btn");
  const runFailedBtn = page.querySelector("#run_failed_btn");
  const clearResultsBtn = page.querySelector("#clear_results_btn");
  const clearOutputBtn = page.querySelector("#test_output");
  const testOutput = page.querySelector("#test_output");
  const suiteButtons = page.querySelectorAll("[data-suite]");

  let liveTestResults = {
    passed: 0,
    failed: 0,
    warning: 0,
    pending: 0,
  };

  const updateLiveStats = () => {
    updateStatsDisplay(liveTestResults, testSuites);
  };

  const addOutputProxy = (message, type = "info") => {
    addOutput(testOutput, message, type);
  };

  const updateTestItemUIProxy = (testName, statusClass, durationMs) => {
    updateTestItemUI(
      testSuites,
      liveTestResults,
      testName,
      statusClass,
      durationMs
    );
    updateLiveStats();
  };

  const resetTestResultsUIProxy = () => {
    resetTestResultsUI(
      testOutput,
      liveTestResults,
      testSuites,
      updateStatsDisplay,
      addOutputProxy
    );
  };

  const runTest = async (testName) => {
    addOutputProxy(`Läuft: ${testName}`);

    const startTime = performance.now();

    try {
      const testFunction = testFunctions[testName];
      if (!testFunction) {
        addOutputProxy(
          `${testName} - ÜBERSPRUNGEN (Keine Testimplementierung)`,
          "warning"
        );
        updateTestItemUIProxy(testName, "warning", 0);
        return;
      }

      const result = await testFunction();
      const duration = Math.round(performance.now() - startTime);

      if (result.success) {
        addOutputProxy(
          `${testName} - BESTANDEN (${duration}ms) - ${result.message}`,
          "success"
        );
        updateTestItemUIProxy(testName, "passed", duration);
      } else {
        addOutputProxy(
          `${testName} - FEHLGESCHLAGEN (${duration}ms) - Status: ${result.status}, ${result.message}`,
          "error"
        );
        updateTestItemUIProxy(testName, "failed", duration);
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      addOutputProxy(
        `${testName} - FEHLER (${duration}ms) - ${error.message}`,
        "error"
      );
      updateTestItemUIProxy(testName, "failed", duration);
    } finally {
    }
  };

  runAllBtn.addEventListener("click", () => {
    resetTestResultsUIProxy();
    addOutputProxy("Starte komplette Test-Suite...");
    testSuites.forEach((suite) => {
      suite.tests.forEach((test) => {
        runTest(test.name);
      });
    });
  });

  runFailedBtn.addEventListener("click", () => {
    resetTestResultsUIProxy();
    addOutputProxy("Führe nur fehlgeschlagene Tests aus...");
    testSuites.forEach((suite) => {
      suite.tests
        .filter((test) => test.status === "failed")
        .forEach((test) => runTest(test.name));
    });
  });

  clearResultsBtn.addEventListener("click", () => {
    resetTestResultsUIProxy();
    addOutputProxy("Testergebnisse geleert", "warning");
  });

  clearOutputBtn.addEventListener("click", () => {
    testOutput.innerHTML = "";
    addOutputProxy("Testkonsole initialisiert");
  });

  suiteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      resetTestResultsUIProxy();
      const suiteId = e.target.dataset.suite;
      const suite = testSuites.find((s) => s.id === suiteId);
      if (suite) {
        addOutputProxy(`Starte Test-Suite: ${suite.name}`);
        suite.tests.forEach((test) => runTest(test.name));
      }
    });
  });

  const testSuiteEl = page.querySelector(".test-suite");
  if (testSuiteEl) {
    testSuiteEl.addEventListener("click", (e) => {
      const runBtn = e.target.closest(".btn-icon");
      if (!runBtn) return;
      const item = runBtn.closest(".test-item");
      if (!item) return;
      const nameEl = item.querySelector(".test-name");
      if (!nameEl) return;
      const testName = nameEl.textContent.trim();

      resetTestResultsUIProxy();
      runTest(testName);
    });
  }

  return page;
}
