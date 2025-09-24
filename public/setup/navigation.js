import * as LayoutSettings from "../settings/layoutSettings.js";

export function setActiveNavButton(activeId) {
  document.querySelectorAll(".nav-links .btn").forEach((btn) => {
    btn.classList.remove(LayoutSettings.ACTIVE_NAV_BUTTON_CLASS);
    btn.classList.add(LayoutSettings.INACTIVE_NAV_BUTTON_CLASS);
  });

  if (activeId && activeId !== "none") {
    const activeBtn = document.getElementById(activeId);
    if (
      activeBtn &&
      !activeBtn.id.includes(LayoutSettings.LOGOUT_BUTTON_ID_PREFIX)
    ) {
      activeBtn.classList.remove(LayoutSettings.INACTIVE_NAV_BUTTON_CLASS);
      activeBtn.classList.add(LayoutSettings.ACTIVE_NAV_BUTTON_CLASS);
    }
  }
}
