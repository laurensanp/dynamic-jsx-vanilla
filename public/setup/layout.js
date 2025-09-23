import { html } from "./dom.js";
import * as LayoutSettings from "../settings/layoutSettings.js";

export const layout = html`
  <div class="nav">
    <div class="nav-brand">${LayoutSettings.BRAND_TEXT}</div>
    <nav class="nav-links">
      ${LayoutSettings.NAV_LINKS.map(link => `
        <button id="${link.id}" class="btn btn-${link.id === 'logout_btn' ? 'danger' : 'ghost'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="${link.iconPath}"/>
          </svg>
          ${link.text}
        </button>
      `).join('')}
    </nav>
  </div>
  
  <main class="flex-1 content-area">
    <div id="page-content" class="fade-in"></div>
  </main>
`;
