export function setActiveNavButton(activeId) {
  document.querySelectorAll('.nav-links .btn').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-ghost');
  });
  
  if (activeId && activeId !== 'none') {
    const activeBtn = document.getElementById(activeId);
    if (activeBtn && !activeBtn.id.includes('logout')) {
      activeBtn.classList.remove('btn-ghost');
      activeBtn.classList.add('btn-primary');
    }
  }
}
