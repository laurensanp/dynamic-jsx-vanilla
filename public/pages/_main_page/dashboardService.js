import { get } from "../../utils/api.js";
import { updateStat } from "./dashboardUtils.js";

const fetchApiEndpoints = async (dynamicStats) => {
  const res = await get("/api/v1/meta/endpoints");
  if (res.ok) {
    const data = res.data;
    const count =
      typeof data.count === "number"
        ? data.count
        : Array.isArray(data.endpoints)
        ? data.endpoints.length
        : 0;
    dynamicStats.apiEndpoints = count;
    return { success: true };
  } else {
    console.warn(
      "Fehler beim Abrufen der Endpunkt-Metadaten:",
      res.status,
      res.statusText
    );
    dynamicStats.apiEndpoints = 0;
    return { success: false };
  }
};

const fetchLogsCount = async (dynamicStats) => {
  const res = await get("/api/v1/logs");
  if (res.ok) {
    const data = res.data;
    dynamicStats.recentLogs = data.logs ? data.logs.length : 0;
    return { success: true };
  } else {
    dynamicStats.recentLogs = 0;
    return { success: false };
  }
};

const checkSystemStatus = async (dynamicStats) => {
  const res = await get("/api/v1/health");
  if (res.ok) {
    dynamicStats.systemStatus = "Online";
    return { success: true };
  } else {
    dynamicStats.systemStatus = "Probleme";
    return { success: false };
  }
};

async function updateHealthCard() {
  let success = true;
  const res = await get("/api/v1/health/full");
  if (!res.ok) {
    success = false;
  }
  const checks = res.data?.checks || {};
  const setStatus = (key, ok, message) => {
    const dot = document.getElementById(`health-dot-${key}`);
    const txt = document.getElementById(`health-status-${key}`);
    if (!dot || !txt) return;
    const color = ok
      ? "var(--success)"
      : message?.toLowerCase().includes("warn") ||
        message?.toLowerCase().includes("degrad")
      ? "var(--warning)"
      : "var(--error)";
    dot.style.background = color;
    if (key === "api") txt.textContent = ok ? "Gut" : "Schlecht";
    else if (key === "db") txt.textContent = ok ? "Warnung" : "Nicht verbunden";
    else if (key === "cache") txt.textContent = ok ? "Gut" : "Warnung";
    else if (key === "monitor") txt.textContent = ok ? "Aktiv" : "Inaktiv";
  };
  setStatus("api", !!checks.api?.ok, checks.api?.message || "");
  setStatus("db", !!checks.database?.ok, checks.database?.message || "");
  setStatus("cache", !!checks.cache?.ok, checks.cache?.message || "");
  setStatus(
    "monitor",
    !!checks.monitoring?.ok,
    checks.monitoring?.message || ""
  );
  return { success };
}

async function updateActivityFeed() {
  let success = true;
  const res = await get("/api/v1/logs");
  const container = document.getElementById("activity_feed");
  if (!container) return { success: true };
  if (!res.ok) {
    container.innerHTML =
      '<div class="activity-item"><div class="activity-text">Fehler beim Laden der Aktivitäten</div></div>';
    success = false;
    return { success };
  }
  const lines = Array.isArray(res.data?.logs) ? res.data.logs : [];
  const last = lines.slice(-4).reverse();

  const items = last
    .map((line) => {
      const m = line.match(/^\[(.*?)\]\s+\[(.*?)\]\s+(?:\[(.*?)\]\s+)?(.*)$/);
      const t = m?.[1] || "";
      const levelRaw = (m?.[2] || "").toUpperCase();
      const cat = (m?.[3] || "").toUpperCase();
      const msg = m?.[4] || line;
      const color = levelRaw === "ERROR" ? "var(--error)" : "var(--success)";
      return `<div class="activity-item">
      <div class="activity-time">${t}</div>
      <div class="activity-text">${cat ? `[${cat}] ` : ""}${msg}</div>
    </div>`;
    })
    .join("");

  container.innerHTML =
    items ||
    '<div class="activity-item"><div class="activity-time">–</div><div class="activity-text">Keine Einträge</div></div>';
  return { success };
}

const fetchLogFileSize = async (dynamicStats) => {
  const res = await get("/api/v1/meta/log-size");
  if (res.ok) {
    const data = res.data;
    dynamicStats.logFileSize = typeof data.size === "number" ? data.size : 0;
    return { success: true };
  } else {
    console.warn(
      "Fehler beim Abrufen der Log-Dateigröße-Metadaten:",
      res.status,
      res.statusText
    );
    dynamicStats.logFileSize = 0;
    return { success: false };
  }
};

export const updateAllStats = async (dynamicStats) => {
  const results = await Promise.all([
    fetchApiEndpoints(dynamicStats),
    fetchLogsCount(dynamicStats),
    checkSystemStatus(dynamicStats),
    updateHealthCard(),
    updateActivityFeed(),
    fetchLogFileSize(dynamicStats),
  ]);

  const overallSuccess = results.every((result) => result.success);

  updateStat("api-endpoints", dynamicStats.apiEndpoints);
  updateStat("recent-logs", dynamicStats.recentLogs);
  updateStat("system-status", dynamicStats.systemStatus);
  updateStat("log-file-size", `${dynamicStats.logFileSize} bytes`);

  return { success: overallSuccess };
};

export {
  fetchApiEndpoints,
  fetchLogsCount,
  checkSystemStatus,
  updateHealthCard,
  updateActivityFeed,
  fetchLogFileSize,
};
