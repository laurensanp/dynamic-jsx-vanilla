import * as DomSettings from "../settings/domSettings.js";

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




export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  
  if (typeof content === 'string') {
    element.innerHTML = content;
  } else if (content instanceof Node) {
    element.appendChild(content);
  } else if (Array.isArray(content)) {
    content.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  }
  
  return element;
}


export function createModal(options = {}) {
  const {
    title = DomSettings.DEFAULT_MODAL_TITLE,
    content = '',
    buttons = DomSettings.DEFAULT_MODAL_BUTTONS,
    closable = DomSettings.DEFAULT_MODAL_CLOSABLE,
    size = DomSettings.DEFAULT_MODAL_SIZE
  } = options;
  
  const modal = html`
    <div class="modal-overlay">
      <div class="modal modal-${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          ${closable ? '<button class="modal-close btn-icon">×</button>' : ''}
        </div>
        <div class="modal-content">${content}</div>
        <div class="modal-footer">
          ${buttons.map(btn => `<button class="btn ${btn.class || 'btn-secondary'}" data-action="${btn.action}">${btn.text}</button>`).join('')}
        </div>
      </div>
    </div>
    
    <style>
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }
      
      .modal {
        background: var(--surface);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border);
        max-height: 90vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease-out;
      }
      
      .modal-small { max-width: 400px; }
      .modal-medium { max-width: 600px; }
      .modal-large { max-width: 800px; }
      
      .modal-header {
        padding: var(--space-lg);
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .modal-title {
        margin: 0;
        font-size: var(--font-size-lg);
      }
      
      .modal-close {
        font-size: var(--font-size-xl);
        color: var(--text-muted);
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--space-xs);
      }
      
      .modal-content {
        padding: var(--space-lg);
      }
      
      .modal-footer {
        padding: var(--space-lg);
        border-top: 1px solid var(--border);
        display: flex;
        gap: var(--space-sm);
        justify-content: flex-end;
      }
    </style>
  `;
  
  const instance = {
    element: modal,
    show() {
      document.body.appendChild(modal);
      return this;
    },
    hide() {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      return this;
    }
  };
  
  
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      if (closable) instance.hide();
    }
    
    if (e.target.classList.contains('modal-close')) {
      instance.hide();
    }
    
    if (e.target.hasAttribute('data-action')) {
      const action = e.target.dataset.action;
      if (action === 'close') {
        instance.hide();
      } else {
        
        modal.dispatchEvent(new CustomEvent('modal-action', { detail: action }));
      }
    }
  });
  
  return instance;
}


export function showToast(message, options = {}) {
  const {
    type = DomSettings.DEFAULT_TOAST_TYPE,
    duration = DomSettings.DEFAULT_TOAST_DURATION,
    position = DomSettings.DEFAULT_TOAST_POSITION
  } = options;
  
  const icons = DomSettings.TOAST_ICONS;
  
  const toast = createElement('div', {
    className: `toast toast-${type} toast-${position}`,
    innerHTML: `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close">×</button>
    `
  });
  
  
  const style = document.createElement('style');
  style.textContent = `
    .toast {
      position: fixed;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 1050;
      min-width: 300px;
      animation: slideInToast 0.3s ease-out;
    }
    
    .toast-top-right {
      top: var(--space-lg);
      right: var(--space-lg);
    }
    
    .toast-success { border-left: 4px solid var(--success); }
    .toast-error { border-left: 4px solid var(--error); }
    .toast-warning { border-left: 4px solid var(--warning); }
    .toast-info { border-left: 4px solid var(--info); }
    
    .toast-icon {
      font-weight: bold;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: var(--font-size-xs);
    }
    
    .toast-success .toast-icon { background: var(--success); color: white; }
    .toast-error .toast-icon { background: var(--error); color: white; }
    .toast-warning .toast-icon { background: var(--warning); color: white; }
    .toast-info .toast-icon { background: var(--info); color: white; }
    
    .toast-message {
      flex: 1;
      font-size: var(--font-size-sm);
    }
    
    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: var(--font-size-lg);
      padding: 0;
    }
    
    @keyframes slideInToast {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  
  if (!document.querySelector('[data-toast-styles]')) {
    style.dataset.toastStyles = 'true';
    document.head.appendChild(style);
  }
  
  
  document.body.appendChild(toast);
  
  
  const hideTimer = setTimeout(() => {
    toast.style.animation = 'slideInToast 0.3s ease-out reverse';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
  
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(hideTimer);
    toast.style.animation = 'slideInToast 0.3s ease-out reverse';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  });
  
  return toast;
}


export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
