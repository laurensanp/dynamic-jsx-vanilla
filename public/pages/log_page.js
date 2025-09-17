import { html } from "../setup/dom.js";

export function App() {
    const page = html`
        <pre id="log_otp"></pre>
    `;

    const log_output = page.querySelector("#log_otp")

    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/v1/logs");
        const data = await res.json();
        log_output.innerText = data.logs.join("\n");
      } catch (err) {
        log_output.innerText = `Error fetching logs: ${err}`;
      }
    };

    fetchLogs();

    const intervalId = setInterval(fetchLogs, 3000);

    page.addEventListener('unload', () => clearInterval(intervalId));
    
    return page;
}