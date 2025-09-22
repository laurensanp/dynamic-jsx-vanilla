import { html } from "./dom.js";

export const layout = html`
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
  
  <main class="flex-1 content-area">
    <div id="page-content" class="fade-in"></div>
  </main>
`;
