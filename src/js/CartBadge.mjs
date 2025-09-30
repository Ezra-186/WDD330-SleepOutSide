import { qs } from "./utils.mjs";

const CART_KEY = "so-cart";

function getCartItems() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function countItems(list) {
  return Array.isArray(list)
    ? list.reduce((sum, item) => {
        const q = Number(item.quantity ?? item.qty ?? 1);
        return sum + (Number.isFinite(q) ? q : 1);
      }, 0)
    : 0;
}

export function updateCartBadge() {
  const el = qs("#cart-count");
  if (!el) return;
  const n = countItems(getCartItems());
  el.textContent = n;
  el.classList.toggle("is-hidden", n <= 0);
}

export function notifyCartChanged() {
  window.dispatchEvent(new CustomEvent("cart:changed"));
}

export function initCartBadge() {
  updateCartBadge();

  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) updateCartBadge();
  });

  window.addEventListener("cart:changed", updateCartBadge);

  document.addEventListener("click", (e) => {
    if (
      e.target.closest(".add-to-cart") ||
      e.target.closest(".remove-from-cart")
    ) {
      setTimeout(updateCartBadge, 0);
    }
  });
}
