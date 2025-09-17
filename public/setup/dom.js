export function html(strings, ...values) {
  const template = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
  const container = document.createElement("div");
  container.innerHTML = template.trim();

  const fragment = document.createDocumentFragment();
  while (container.firstChild) {
    fragment.appendChild(container.firstChild);
  }
  return fragment;
}

export function render(element, container) {
  container.innerHTML = "";
  container.appendChild(element);
}
