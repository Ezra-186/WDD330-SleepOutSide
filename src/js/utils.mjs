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

export function readCart() {
  return getLocalStorage("so-cart") || [];
}
export function writeCart(cart) {
  setLocalStorage("so-cart", cart);
}

export function addToCart(product, qty = 1) {
  if (!product || !product.Id) return readCart();
  const cart = readCart();
  const i = cart.findIndex((p) => String(p.Id) === String(product.Id));
  if (i > -1) {
    cart[i].quantity = (cart[i].quantity || 1) + qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  writeCart(cart);
  return cart;
}

export function getCartCount() {
  return readCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
}

// render a single template
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

// fetch an HTML partial
export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

// load header and footer into the page
export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");
  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");


  renderWithTemplate(headerTemplate, headerElement, null, () => {
    import('./CartBadge.mjs').then(({ initCartBadge }) => initCartBadge());
  });
  renderWithTemplate(footerTemplate, footerElement);
}