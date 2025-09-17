import { html, render } from "./setup/dom.js";
import { setupPageSwitching } from "./setup/pageSwitch.js";

const layout = html`
  <div id="root"/>
  <div>
    <button id="api_page_btn">API Page</button>
    <button id="test_page_btn">Test Page</button>
    <button id="log_page_btn">Logs</button>
    <button id="logout_btn">Logout</button>
  </div>
`;

render(layout, document.body);

const root = document.getElementById("root"); 
const logoutButton = document.getElementById("logout_btn");

const pagesConfig = [
  // skibedie: das erste element wird als haupt page erkannt.
  { buttonId: "none", modulePath: "../pages/_main_page.js" },
  { buttonId: "api_page_btn", modulePath: "../pages/api_page.js" },
  { buttonId: "test_page_btn", modulePath: "../pages/test_page.js" },
  { buttonId: "log_page_btn", modulePath: "../pages/log_page.js" },
];

logoutButton.addEventListener("click", async () => {
  await fetch("/api/v1/logout");
  window.location.href = "/";
});

setupPageSwitching(root, pagesConfig);