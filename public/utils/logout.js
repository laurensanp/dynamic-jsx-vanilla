export function setupLogout(logoutButton) {
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
}
