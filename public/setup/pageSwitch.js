import { PAGE_MODULE_BASE_PATH, DEFAULT_PAGE_TITLE_SUFFIX, LOADING_HTML, PAGE_LOAD_ERROR_HTML } from "../settings/pageSwitchSettings.js";
let currentPageId = null;

let currentCssLink = null;

function loadCssForPage(cssPath) {
  return new Promise((resolve, reject) => {
    if (currentCssLink) {
      currentCssLink.remove();
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.onload = () => {
      currentCssLink = link;
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load CSS: ${cssPath}`));
    document.head.appendChild(link);
  });
}

export async function setupPageSwitching(root, pagesConfig, onPageChange = null) {
  
  function showLoading() {
    root.innerHTML = LOADING_HTML;
  }
  
  
  async function loadPage(config) {
    let fullModulePath;
    try {
      showLoading();

      if (config.cssPath) {
        await loadCssForPage(config.cssPath);
      }
      
      fullModulePath = PAGE_MODULE_BASE_PATH + config.modulePath;
      const module = await import(fullModulePath);
      root.innerHTML = '';
      const pageContent = module.App();
      root.appendChild(pageContent);
      currentPageId = config.buttonId;

      if (typeof module.onMount === 'function') {
        module.onMount(root);
      }

      if (onPageChange) {
        onPageChange(config.buttonId);
      }
      
      
      if (config.title) {
        document.title = `${config.title}${DEFAULT_PAGE_TITLE_SUFFIX}`;
      }
      
      
      if (onPageChange) {
        onPageChange(config.buttonId);
      }
    } catch (error) {
      console.error(`Failed to load page: ${fullModulePath}`, error);
      root.innerHTML = PAGE_LOAD_ERROR_HTML;
    }
  }

  
  for (const config of pagesConfig) {
    if (config.buttonId === "none") continue;

    const button = document.getElementById(config.buttonId);

    if (!button) {
      console.warn(`Button with id "${config.buttonId}" not found`);
      continue;
    }

    button.addEventListener("click", () => loadPage(config));
  }

  
  if (pagesConfig.length > 0) {
    const defaultPageConfig = pagesConfig.find(config => config.isDefault) || pagesConfig[0];
    await loadPage(defaultPageConfig);
  }
}
