import { html, render } from "./setup/dom.js";
import { setupPageSwitching } from "./setup/pageSwitch.js";
import { ensureDarkTheme } from "./utils/theme.js";

const layout = html`
  <div class="nav">
<div class="nav-brand">API Konsole</div>
    <nav class="nav-links">
      <button id="api_page_btn" class="btn btn-ghost">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        API
      </button>
      <button id="test_page_btn" class="btn btn-ghost">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Tests
      </button>
      <button id="log_page_btn" class="btn btn-ghost">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Logs
      </button>
      <button id="logout_btn" class="btn btn-danger">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
Abmelden
      </button>
    </nav>
  </div>
  
  <main class="container flex-1">
    <div id="root" class="fade-in"></div>
  </main>
`;

ensureDarkTheme();
render(layout, document.body);

const root = document.getElementById("root"); 
const logoutButton = document.getElementById("logout_btn");

const pagesConfig = [
  { buttonId: "none", modulePath: "/public/pages/_main_page.js", title: "Übersicht" },
  { buttonId: "api_page_btn", modulePath: "/public/pages/api_page.js", title: "API Konsole" },
  { buttonId: "test_page_btn", modulePath: "/public/pages/test_page.js", title: "Test-Suite" },
  { buttonId: "log_page_btn", modulePath: "/public/pages/log_page.js", title: "System Logs" },
];


logoutButton.addEventListener("click", async (e) => {
if (!confirm("Möchten Sie sich wirklich abmelden?")) return;
  
  const originalText = logoutButton.innerHTML;
  logoutButton.innerHTML = `
    <div class="loading"></div>
Abmeldung...
  `;
  logoutButton.disabled = true;
  
  try {
    await fetch("/api/v1/logout");
    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
    logoutButton.innerHTML = originalText;
    logoutButton.disabled = false;
  }
});


function setActiveNavButton(activeId) {
  document.querySelectorAll('.nav-links .btn').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-ghost');
  });
  
  if (activeId && activeId !== 'none') {
    const activeBtn = document.getElementById(activeId);
    if (activeBtn && !activeBtn.id.includes('logout')) {
      activeBtn.classList.remove('btn-ghost');
      activeBtn.classList.add('btn-primary');
    }
  }
}

setupPageSwitching(root, pagesConfig, setActiveNavButton);
