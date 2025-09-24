import * as AuthSettings from "../settings/authSettings.js";

export function setupLogout(logoutButton) {
  logoutButton.addEventListener("click", async (e) => {
    if (!confirm(AuthSettings.LOGOUT_CONFIRM_MESSAGE)) return;

    const originalText = logoutButton.innerHTML;
    logoutButton.innerHTML = `
      <div class="loading"></div>
      Abmeldung...
    `;
    logoutButton.disabled = true;

    try {
      await fetch(AuthSettings.LOGOUT_ENDPOINT);
      window.location.href = AuthSettings.LOGOUT_REDIRECT_URL;
    } catch (error) {
      console.error("Logout failed:", error);
      logoutButton.innerHTML = originalText;
      logoutButton.disabled = false;
    }
  });
}
