import { render } from "./setup/dom.js";
import { setupPageSwitching } from "./setup/pageSwitch.js";
import { ensureDarkTheme } from "./utils/theme.js";
import { layout } from "./setup/layout.js";
import { setupLogout } from "./utils/logout.js";
import { setActiveNavButton } from "./setup/navigation.js";
import { DEFAULT_PAGE_BUTTON_ID } from "./settings/settings.js";
import { PAGES_CONFIG } from "./settings/appSettings.js";


render(layout, document.body);

const root = document.getElementById("page-content"); 
const logoutButton = document.getElementById("logout_btn");

setupLogout(logoutButton);
setupPageSwitching(root, PAGES_CONFIG, setActiveNavButton);
