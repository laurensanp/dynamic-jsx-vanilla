import { render } from "./setup/dom.js";
import { setupPageSwitching } from "./setup/pageSwitch.js";
import { ensureDarkTheme } from "./utils/theme.js";
import { layout } from "./setup/layout.js";
import { setupLogout } from "./utils/logout.js";
import { setActiveNavButton } from "./setup/navigation.js";


render(layout, document.body);

const root = document.getElementById("page-content"); 
const logoutButton = document.getElementById("logout_btn");

const pagesConfig = [
  { buttonId: "none", modulePath: "/public/pages/_main_page.js", title: "Übersicht" },
  { buttonId: "api_page_btn", modulePath: "/public/pages/api_page.js", title: "API Konsole" },
  { buttonId: "test_page_btn", modulePath: "/public/pages/test_page.js", title: "Test-Suite" },
  { buttonId: "log_page_btn", modulePath: "/public/pages/log_page.js", title: "System Logs" },
];

setupLogout(logoutButton);
setupPageSwitching(root, pagesConfig, setActiveNavButton);
