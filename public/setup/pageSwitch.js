export async function setupPageSwitching(root, pagesConfig, onPageChange = null) {
  
  function showLoading() {
    root.innerHTML = `
      <div class="flex items-center justify-center" style="min-height: 200px;">
        <div class="loading" style="width: 40px; height: 40px;"></div>
      </div>
    `;
  }
  
  
  async function loadPage(config) {
    try {
      showLoading();
      const module = await import(config.modulePath);
      const pageElement = module.App();
      root.innerHTML = "";
      
      
      if (pageElement instanceof DocumentFragment) {
        
        const wrapper = document.createElement('div');
        wrapper.className = 'page-content slide-in';
        wrapper.appendChild(pageElement);
        root.appendChild(wrapper);
      } else if (pageElement instanceof HTMLElement) {
        pageElement.classList.add('slide-in');
        root.appendChild(pageElement);
      } else {
        
        const wrapper = document.createElement('div');
        wrapper.className = 'page-content slide-in';
        wrapper.appendChild(pageElement);
        root.appendChild(wrapper);
      }
      
      
      if (config.title) {
        document.title = `${config.title} - API Console`;
      }
      
      
      if (onPageChange) {
        onPageChange(config.buttonId);
      }
    } catch (error) {
      console.error(`Failed to load page: ${config.modulePath}`, error);
      root.innerHTML = `
        <div class="card" style="text-align: center; margin-top: 2rem;">
          <h2 style="color: var(--error);">⚠️ Failed to Load Page</h2>
          <p>There was an error loading the requested page.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
        </div>
      `;
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
    await loadPage(pagesConfig[0]);
  }
}
