import {
  loadHeaderFooter, dedupeCart, addToCart, removeFromCart, deleteItem,
} from "./utils.mjs";

loadHeaderFooter();

const listEl = document.querySelector("#cart-list");
const subtotalEl = document.querySelector("#cart-subtotal");

function priceOf(p) { return Number(p.FinalPrice ?? p.ListPrice ?? p.Price ?? 0); }

function itemRowTemplate(p) {
  const qty = Number(p.quantity) || 1;
  const line = (priceOf(p) * qty).toFixed(2);
  const img = p?.Images?.PrimarySmall || p.Image || "/images/placeholder.png";
  return `
    <li class="cart-item" data-id="${p.Id}">
      <img class="cart-item__img" src="${img}" alt="${p.Name || ""}">
      <div class="cart-item__info">
        <h3 class="cart-item__name">${p.Name || ""}</h3>
        <p class="cart-item__meta">${p.Colors?.[0]?.ColorName || p.Color || ""}</p>
      </div>

      <div class="cart-item__qty">
        <button data-action="dec" data-id="${p.Id}" aria-label="Decrease">−</button>
        <span class="qty__num">${qty}</span>
        <button data-action="inc" data-id="${p.Id}" aria-label="Increase">+</button>
      </div>

      <strong class="cart-item__price">$${line}</strong>
      <button class="cart-item__remove" data-action="remove" data-id="${p.Id}" aria-label="Remove">✕</button>
    </li>`;
}

function render() {
  const items = dedupeCart();
  if (!items.length) {
    if (listEl) listEl.innerHTML = `<li class="cart-empty">Your cart is empty. <a href="/product_listing/">Shop now</a></li>`;
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    import("./CartBadge.mjs").then(({ initCartBadge }) => initCartBadge());
    return;
  }
  if (listEl) listEl.innerHTML = items.map(itemRowTemplate).join("");
  const subtotal = items.reduce((s, p) => s + priceOf(p) * (Number(p.quantity) || 1), 0);
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  import("./CartBadge.mjs").then(({ initCartBadge }) => initCartBadge());
}

listEl.addEventListener("click", (e) => {
  const inc = e.target.closest('[data-action="inc"]');
  const dec = e.target.closest('[data-action="dec"]');
  const rmv = e.target.closest('[data-action="remove"]');
  const id = (inc || dec || rmv)?.dataset.id;
  if (!id) return;

  if (inc) addToCart({ Id: id }, 1);
  else if (dec) removeFromCart(id, 1);
  else if (rmv) deleteItem(id);

  render();
});

render();
