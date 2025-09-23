export const calculateStats = (testSuites) => {
  let stats = { passed: 0, failed: 0, warning: 0, pending: 0 };
  
  testSuites.forEach(suite => {
    suite.tests.forEach(test => {
      if (stats.hasOwnProperty(test.status)) {
        stats[test.status]++;
      }
    });
  });
  
  return stats;
};
  
const updateStatElement = (id, value) => {
  
  const element = document.getElementById(id);
  
  if (element) {
    
    element.style.transform = 'scale(1.2)';
    element.style.transition = 'transform 0.3s ease';
    
    setTimeout(() => {
      element.textContent = value;
      element.style.transform = 'scale(1)';
    }, 150);
  }
};

export const updateStatsDisplay = (liveTestResults, testSuites) => {
  const stats = liveTestResults || calculateStats(testSuites);
  
  updateStatElement('passed-count', stats.passed);
  updateStatElement('failed-count', stats.failed);
  updateStatElement('warning-count', stats.warning);
  updateStatElement('pending-count', stats.pending);
};

export function getStatusIcon(status) {
  switch (status) {
    case 'passed': return '✓';
    case 'failed': return '✗';
    case 'warning': return '⚠';
    case 'pending': return '⏳';
    default: return '●';
  }
}

export const addOutput = (testOutput, message, type = 'info') => {
  // Do not log expected 401s from brute force test as errors in the UI console
  if (type === 'error' && message.includes('Anfragen führten zu erwartetem 401 Unauthorized/Ratelimit')) {
    return;
  }

  const timestamp = new Date().toLocaleTimeString();
  const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  testOutput.innerHTML += `<div class=\"log-entry ${type}\">[${timestamp}] ${icon} ${message}</div>`;
  testOutput.scrollTop = testOutput.scrollHeight;
};

export function updateTestItemUI(testSuites, liveTestResults, testName, statusClass, durationMs) {
  const items = document.querySelectorAll('.test-item');
  items.forEach(item => {
    const nameEl = item.querySelector('.test-name');
    if (!nameEl) return;
    if (nameEl.textContent.trim() !== testName.trim()) return;

    const suite = testSuites.find(s => s.tests.some(t => t.name.trim() === testName.trim()));
    const test = suite && suite.tests.find(t => t.name.trim() === testName.trim());

    if (test) {
      // Decrement old status count, increment new status count
      if (liveTestResults.hasOwnProperty(test.status)) {
        liveTestResults[test.status]--;
      }
      test.status = statusClass; // Update the status in the testSuites array
      if (liveTestResults.hasOwnProperty(statusClass)) {
        liveTestResults[statusClass]++;
      }
      // updateLiveStats is called from the main App function
    }

    item.classList.remove('passed', 'failed', 'warning', 'pending');
    item.classList.add(statusClass);

    const durEl = item.querySelector('.test-duration');
    if (durEl) durEl.textContent = `${durationMs}ms`;
    
    const iconEl = item.querySelector('.test-status-icon');
    if (iconEl) {
      iconEl.textContent = statusClass === 'passed' ? '✓' : statusClass === 'failed' ? '✗' : statusClass === 'warning' ? '⚠' : '⏳';
    }
  });
}

export const resetTestResultsUI = (testOutput, liveTestResults, testSuites, updateStatsDisplay, addOutput) => {
  testOutput.innerHTML = '';
  liveTestResults.passed = 0;
  liveTestResults.failed = 0;
  liveTestResults.warning = 0;
  liveTestResults.pending = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);

  // Reset all test statuses to pending first
  testSuites.forEach(suite => {
    suite.tests.forEach(test => {
      test.status = 'pending';
    });
  });
  
  updateStatsDisplay(liveTestResults);
  document.querySelectorAll('.test-item').forEach(item => {
    item.classList.remove('passed', 'failed', 'warning', 'pending');
    item.classList.add('pending');
    const durEl = item.querySelector('.test-duration');
    if (durEl) durEl.textContent = '-';
    const iconEl = item.querySelector('.test-status-icon');
    if (iconEl) iconEl.textContent = '⏳';
  });
  addOutput(testOutput, 'Test-Suite bereit. Klicken Sie auf „Alle Tests starten“, um zu beginnen.');
};
