import { parseLogLine } from "./logUtils.js";

export async function fetchLogs(logs, filterLogsProxy) {
  try {
    const res = await fetch("/api/v1/logs", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const lines = Array.isArray(data.logs) ? data.logs : [];
      logs = lines.map((line, idx) => parseLogLine(line, idx));
      if (logs.length > 1000)
        logs = logs.slice(-1000).map((l, i) => ({ ...l, index: i }));
      filterLogsProxy();
      return { logs, success: true };
    } else {
      console.error("Failed to fetch logs:", res.statusText);
      return { logs, success: false };
    }
  } catch (err) {
    console.error("Fehler beim Abrufen der Protokolle:", err);
    return { logs, success: false };
  }
}

export async function clearServerLogs(logs, filterLogsProxy) {
  try {
    const res = await fetch("/api/v1/logs", {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) {
      logs = [];
      filterLogsProxy();
      console.log("Server logs cleared.");
    } else {
      console.error("Failed to clear server logs:", res.statusText);
    }
  } catch (err) {
    console.error("Error clearing server logs:", err);
  }
  return logs;
}
