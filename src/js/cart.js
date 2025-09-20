import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { loadHeaderFooter } from "../js/utils.mjs";

function readCart() {
  try { return getLocalStorage("so-cart") || []; } catch { return []; }
}

function writeCart(items) { setLocalStorage("so-cart", items); }

function normalizeImgPath(src, item) {
  const apiImg = item?.Images?.PrimarySmall || item?.Images?.PrimaryMedium;
  const fallback = src || "/images/placeholder.png";
  const out = apiImg || fallback;
  return out.replace(/^(\.\.\/)+/, "/");
}

function money(v) { return Number(v ?? 0).toFixed(2); }

function expandByQuantity(items) {
  return items.flatMap((item) => {
    const qty = item.quantity || 1;
    return Array.from({ length: qty }, () => ({ ...item, quantity: 1 }));
  });
}

function cartItemTemplate(item) {
  const img = normalizeImgPath(item.Image, item);
  const name = item.Name || item.NameWithoutBrand || "Product";
  const color = item.Colors?.[0]?.ColorName || "";
  const qty = item.quantity || 1;
  const price = money(item.FinalPrice ?? item.ListPrice);
  return `<li class="cart-card divider" data-id="${item.Id}">
    <a href="/product_pages/index.html?product=${item.Id}" class="cart-card__image">
      <img src="${img}" alt="${name}" />
    </a>
    <a href="/product_pages/index.html?product=${item.Id}"><h2 class="card__name">${name}</h2></a>
    <p class="cart-card__color">${color}</p>
    <p class="cart-card__quantity">qty: ${qty}</p>
    <p class="cart-card__price">$${price}</p>
    <button class="cart-card__remove" data-id="${item.Id}" aria-label="Remove ${name}"><span aria-hidden="true">×</span></button>
  </li>`;
}

function renderCartContents() {
  const list = document.querySelector(".product-list");
  if (!list) return;
  const expanded = expandByQuantity(readCart());
  if (!expanded.length) { list.innerHTML = `<li class="cart-card">Your cart is empty.</li>`; return; }
  list.innerHTML = expanded.map(cartItemTemplate).join("");
}

function updateBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const total = readCart().reduce((sum, p) => sum + (p.quantity || 1), 0);
  badge.textContent = total;
  badge.classList.toggle("is-hidden", total === 0);
}

function removeItem(id) {
  const next = readCart().filter((p) => String(p.Id) !== String(id));
  writeCart(next);
  renderCartContents();
  updateBadge();
  window.dispatchEvent(new CustomEvent("cart:changed"));
}

function addCartListeners() {
  const list = document.querySelector(".product-list");
  if (!list) return;
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".cart-card__remove");
    if (!btn) return;
    e.preventDefault();
    removeItem(btn.dataset.id);
  });
}

function initCartPage() {
  renderCartContents();
  updateBadge();
  window.addEventListener("cart:changed", () => {
    renderCartContents();
    updateBadge();
  });
  addCartListeners();
}

initCartPage();
