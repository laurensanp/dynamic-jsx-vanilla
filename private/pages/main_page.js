import { html } from "../setup/dom.js"

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

  sendBtn.addEventListener("click", () => {
    fetch("http://localhost:8000/api/v1/hello")
      .then(res => res.json())
      .then(data => output.innerText += `${data.message}\n`)
      .catch(err => output.innerText = `Error: ${err}`);
  });

  shutBtn.addEventListener("click", () => {
    fetch("http://localhost:8000/api/v1/shut")
      .catch(err => output.innerText = `Error: ${err}`);
  });

  return page;
}
