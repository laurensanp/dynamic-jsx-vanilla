import { html } from "../setup/dom.js";

export function App() {
  const page = html`
    <h1>API Requests</h1>
    <div>
      <button id="send_btn">Send</button>
      <button id="shut_btn">Shut</button>
    </div>
    <pre id="output"></pre>
  `;

  const sendBtn = page.querySelector("#send_btn");
  const shutBtn = page.querySelector("#shut_btn");
  const output = page.querySelector("#output");

  const appendOutput = (msg) => {
    output.innerText += `${msg}\n`;
  };

  sendBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/hello");
      const data = await res.json();
      appendOutput(data.message);
    } catch (err) {
      output.innerText = `Error: ${err}`;
    }
  });

  shutBtn.addEventListener("click", async () => {
    try {
      await fetch("http://localhost:8000/api/v1/shut");
    } catch (err) {
      output.innerText = `Error: ${err}`;
    }
  });

  return page;
}
