export async function fetchEndpoints(appendOutputProxy) {
  try {
    const res = await fetch('/api/v1/meta/endpoints', { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) {
      appendOutputProxy(`Fehler beim Laden der Endpunkte: ${res.status} ${res.statusText}`, 'error');
      return [];
    }
    const data = await res.json();
    return Array.isArray(data.endpoints) ? data.endpoints : [];
  } catch (err) {
    appendOutputProxy(`Fehler beim Laden der Endpunkte: ${err.message}`, 'error');
    return [];
  }
}
