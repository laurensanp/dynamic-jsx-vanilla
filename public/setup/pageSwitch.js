import { PAGE_MODULE_BASE_PATH, DEFAULT_PAGE_TITLE_SUFFIX, LOADING_HTML, PAGE_LOAD_ERROR_HTML } from "../settings/pageSwitchSettings.js";
let currentPageId = null;

export async function setupPageSwitching(root, pagesConfig, onPageChange = null) {
  
  function showLoading() {
    root.innerHTML = LOADING_HTML;
  }
  
  
  async function loadPage(config) {
    let fullModulePath; // Declare outside try block
    try {
      showLoading();
      fullModulePath = PAGE_MODULE_BASE_PATH + config.modulePath; // Assign value inside try block
      const module = await import(fullModulePath);
      root.innerHTML = ''; // Clear existing content
      const pageContent = module.App();
      root.appendChild(pageContent); // Append new content
      currentPageId = config.buttonId;
      // setActiveNavButton(config.buttonId); // Removed direct call

      // Call onMount if it exists
      if (typeof module.onMount === 'function') {
        module.onMount(root);
      }

      // Call onPageChange (which is setActiveNavButton) after content is mounted
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
