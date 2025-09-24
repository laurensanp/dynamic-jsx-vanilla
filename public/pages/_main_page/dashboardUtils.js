export const updateStat = (statId, value) => {
  const element = document.getElementById(`${statId}-value`);
  if (element) {
    element.style.transform = "scale(1.1)";
    element.style.transition = "transform 0.2s ease";
    setTimeout(() => {
      element.textContent = value;
      element.style.transform = "scale(1)";
    }, 100);
  }
};
