export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  if (!parentElement) return;
  if (clear) parentElement.innerHTML = "";
  const html = list.map(templateFn).join("");
  parentElement.insertAdjacentHTML(position, html);
}

function normalizeId(p) {
  return String(p?.Id ?? p?.id ?? "");
}

export function readCart() {
  const cart = getLocalStorage("so-cart") || [];
  return Array.isArray(cart) ? cart : [];
}

export function writeCart(cart) {
  setLocalStorage("so-cart", cart);
}

export function addToCart(product, qty = 1) {
  const id = normalizeId(product);
  if (!id) return readCart();

  const q = Math.max(1, Number(qty) || 1);
  const cart = readCart();
  const i = cart.findIndex((p) => normalizeId(p) === id);

  if (i > -1) {
    cart[i].quantity = (Number(cart[i].quantity) || 1) + q;
  } else {
    cart.push({ ...product, quantity: q });
  }
  writeCart(cart);
  return cart;
}

export function removeFromCart(id, qty = 1) {
  const cart = readCart();
  const idx = cart.findIndex(p => String(p.Id ?? p.id) === String(id));
  if (idx > -1) {
    const next = (Number(cart[idx].quantity) || 1) - Math.max(1, Number(qty) || 1);
    if (next <= 0) cart.splice(idx, 1);
    else cart[idx].quantity = next;
    writeCart(cart);
  }
  return cart;
}

export function deleteItem(id) {
  const cart = readCart().filter(p => String(p.Id ?? p.id) !== String(id));
  writeCart(cart);
  return cart;
}

export function dedupeCart() {
  const map = new Map();
  for (const item of readCart()) {
    const id = normalizeId(item);
    if (!id) continue;
    const prev = map.get(id) || { ...item, quantity: 0 };
    prev.quantity = (Number(prev.quantity) || 0) + (Number(item.quantity) || 1);
    map.set(id, prev);
  }
  const deduped = [...map.values()];
  writeCart(deduped);
  return deduped;
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");
  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  dedupeCart();

  renderWithTemplate(headerTemplate, headerElement, null, () => {
    import('./CartBadge.mjs').then(({ initCartBadge }) => initCartBadge());
  });
  renderWithTemplate(footerTemplate, footerElement);
}


function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function alertMessage(message, scroll = true) {
  document.querySelectorAll('.alert').forEach(a => a.remove());
  const main = document.querySelector('main') || document.body;
  const el = document.createElement('div');
  el.className = 'alert';
  el.innerHTML = `
    <div class="alert__content">
      <p>${typeof message === 'string' ? message : JSON.stringify(message)}</p>
      <button class="alert__close" aria-label="Close">×</button>
    </div>`;
  el.addEventListener('click', (e) => { if (e.target.closest('.alert__close')) el.remove(); });
  main.prepend(el);
  if (scroll) window.scrollTo(0, 0);
}

export function removeAllAlerts() {
  document.querySelectorAll('.alert').forEach(a => a.remove());
}

