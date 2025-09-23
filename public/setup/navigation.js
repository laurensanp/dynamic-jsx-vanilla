import { ACTIVE_NAV_BUTTON_CLASS, INACTIVE_NAV_BUTTON_CLASS, LOGOUT_BUTTON_ID_PREFIX } from "../settings/layoutSettings.js";

export function setActiveNavButton(activeId) {
  document.querySelectorAll('.nav-links .btn').forEach(btn => {
    btn.classList.remove(ACTIVE_NAV_BUTTON_CLASS);
    btn.classList.add(INACTIVE_NAV_BUTTON_CLASS);
  });
  
  if (activeId && activeId !== 'none') {
    const activeBtn = document.getElementById(activeId);
    if (activeBtn && !activeBtn.id.includes(LOGOUT_BUTTON_ID_PREFIX)) {
      activeBtn.classList.remove(INACTIVE_NAV_BUTTON_CLASS);
      activeBtn.classList.add(ACTIVE_NAV_BUTTON_CLASS);
    }
  }
}
