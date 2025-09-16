import { html, render } from "./setup/dom.js";
import { setupPageSwitching } from "./setup/pageSwitch.js";

const layout = html`
  <div id="root"/>
  <div>
    <button id="api_page_btn">API Page</button>
    <button id="test_page_btn">Test Page</button>
  </div>
`;

render(layout, document.body);

const root = document.getElementById("root");

const pagesConfig = [
  // skibedie: das erste element wird als haupt page erkannt.
  { buttonId: "none", modulePath: "../pages/main_page.js" },
  { buttonId: "api_page_btn", modulePath: "../pages/api_page.js" },
  { buttonId: "test_page_btn", modulePath: "../pages/test_page.js" }
];

setupPageSwitching(root, pagesConfig);