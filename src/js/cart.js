import { getLocalStorage } from "./utils.mjs";

function readCart() {
  try {
    return getLocalStorage("so-cart") || [];
  } catch {
    return [];
  }
}

function normalizeImgPath(src) {
  if (!src) return "/images/placeholder.png";
  return src.replace(/^(\.\.\/)+/, "/");
}


function money(v) {
  return Number(v ?? 0).toFixed(2);
}

function expandByQuantity(items) {
  return items.flatMap((item) => {
    const qty = item.quantity || 1;
    return Array.from({ length: qty }, () => ({ ...item, quantity: 1 }));
  });
}

function cartItemTemplate(item) {
  const img = normalizeImgPath(item.Image);
  const name = item.Name || item.NameWithoutBrand || "Product";
  const color = item.Colors?.[0]?.ColorName || "";
  const qty = item.quantity || 1;
  const price = money(item.FinalPrice ?? item.ListPrice);
  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img src="${img}" alt="${name}" />
    </a>
    <a href="#"><h2 class="card__name">${name}</h2></a>
    <p class="cart-card__color">${color}</p>
    <p class="cart-card__quantity">qty: ${qty}</p>
    <p class="cart-card__price">$${price}</p>
  </li>`;
}

function renderCartContents() {
  const list = document.querySelector(".product-list");
  if (!list) return;
  const expanded = expandByQuantity(readCart());
  if (!expanded.length) {
    list.innerHTML = `<li class="cart-card">Your cart is empty.</li>`;
    return;
  }
  list.innerHTML = expanded.map(cartItemTemplate).join("");
}

function updateBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const total = readCart().reduce((sum, p) => sum + (p.quantity || 1), 0);
  badge.textContent = total;
  badge.classList.toggle("is-hidden", total === 0);
}

function initCartPage() {
  renderCartContents();
  updateBadge();
  window.addEventListener("cart:changed", () => {
    renderCartContents();
    updateBadge();
  });
}

initCartPage();
