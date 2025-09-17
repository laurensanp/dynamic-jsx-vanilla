export async function setupPageSwitching(root, pagesConfig) {
  for (const { buttonId, modulePath } of pagesConfig) {
    if (buttonId === "none") continue;

    const button = document.getElementById(buttonId);

    if (!button) {
      console.warn(`Button with id "${buttonId}" not found`);
      continue;
    }

    button.addEventListener("click", async () => {
      const { App } = await import(modulePath);
      root.innerHTML = "";
      root.appendChild(App());
    });
  }

  if (pagesConfig.length > 0) {
    const { App } = await import(pagesConfig[0].modulePath);
    root.appendChild(App());
  }
}