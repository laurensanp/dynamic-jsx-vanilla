export const PAGE_MODULE_BASE_PATH = '/public/';
export const DEFAULT_PAGE_TITLE_SUFFIX = ' - API Console';
export const LOADING_HTML = `
  <div class="flex items-center justify-center" style="min-height: 200px;">
    <div class="loading" style="width: 40px; height: 40px;"></div>
  </div>
`;
export const PAGE_LOAD_ERROR_HTML = `
  <div class="card" style="text-align: center; margin-top: 2rem;">
    <h2 style="color: var(--error);">⚠️ Failed to Load Page</h2>
    <p>There was an error loading the requested page.</p>
    <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
  </div>
`;
