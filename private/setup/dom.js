export function html(strings, ...values) {
    const template = strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
    const templateDiv = document.createElement("div");
    templateDiv.innerHTML = template.trim();
  
    const fragment = document.createDocumentFragment();
    while (templateDiv.firstChild) {
        fragment.appendChild(templateDiv.firstChild);
    }
    return fragment;
}

export function render(element, container) {
    container.innerHTML = "";
    container.appendChild(element);
}
