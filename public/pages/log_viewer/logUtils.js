export function formatTimestampText(text) {
  return text || "";
}

export function updateStats(
  filteredLogs,
  errorCount,
  warnCount,
  infoCount,
  debugCount
) {
  const stats = filteredLogs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  errorCount.textContent = stats.error || 0;
  warnCount.textContent = stats.warn || 0;
  infoCount.textContent = stats.info || 0;
  debugCount.textContent = stats.debug || 0;
}

export function parseLogLine(line, index) {
  const m = line.match(/^\[(.*?)\]\s+\[(.*?)\]\s+(?:\[(.*?)\]\s+)?(.*)$/);
  if (!m) {
    return {
      index,
      timestampText: "",
      level: "info",
      module: "general",
      message: line,
    };
  }
  const timestampText = m[1] || "";
  const levelRaw = (m[2] || "").toLowerCase();
  const category = (m[3] || "").toLowerCase();
  const message = (m[4] || "").trim();

  let level = "info";
  if (levelRaw === "error") level = "error";
  else if (levelRaw === "warn") level = "warn";
  else if (levelRaw === "debug") level = "debug";

  const module = category || "general";
  return { index, timestampText, level, module, message };
}

export function filterLogs(
  logs,
  logOutput,
  levelFilter,
  moduleFilter,
  searchInput,
  errorCount,
  warnCount,
  infoCount,
  debugCount,
  renderLogs
) {
  const levelValue = levelFilter.value;
  const moduleValue = moduleFilter.value;
  const searchValue = searchInput.value.toLowerCase();

  const newFilteredLogs = logs.filter((log) => {
    const levelMatch = levelValue === "all" || log.level === levelValue;
    const moduleMatch = moduleValue === "all" || log.module === moduleValue;
    const searchMatch =
      !searchValue ||
      log.message.toLowerCase().includes(searchValue) ||
      log.module.toLowerCase().includes(searchValue);

    return levelMatch && moduleMatch && searchMatch;
  });

  renderLogs(newFilteredLogs, logOutput);
  updateStats(newFilteredLogs, errorCount, warnCount, infoCount, debugCount);

  return newFilteredLogs;
}

export function renderLogs(filteredLogs, logOutput) {
  const logsHTML = filteredLogs
    .sort((a, b) => b.index - a.index)
    .map(
      (log) => `
      <div class=\"log-entry ${log.level}\">
        <span class=\"log-timestamp\">${formatTimestampText(
          log.timestampText
        )}</span>
        <span class=\"log-level ${log.level}\">${log.level}</span>
        <span class=\"log-module\">[${log.module}]</span>
        <span class=\"log-message\">${log.message}</span>
      </div>
    `
    )
    .join("");

  logOutput.innerHTML =
    logsHTML ||
    '<div class="log-entry info"><span class="log-message">Keine Protokolle entsprechen den aktuellen Filtern</span></div>';
}

export function tailLogs(logOutput) {
  logOutput.scrollTop = logOutput.scrollHeight;
}

export function downloadLogs(logs) {
  const logContent = logs
    .map(
      (log) =>
        `[${log.timestampText}] [${log.level.toUpperCase()}]${
          log.module ? ` [${log.module.toUpperCase()}]` : ""
        } ${log.message}`
    )
    .join("\n");
  const blob = new Blob([logContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "server_logs.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
