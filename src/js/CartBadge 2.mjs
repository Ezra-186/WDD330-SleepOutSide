import { qs } from "./utils.mjs";

function getCartItems() {
    try {
        const raw = localStorage.getItem("so-cart");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function countItems(list) {
    return Array.isArray(list)
        ? list.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
        : 0;
}

export function updateCartBadge() {
    const el = qs("#cart-count");
    if (!el) return;
    const n = countItems(getCartItems());
    el.textContent = n;
    el.classList.toggle("is-hidden", n <= 0);
}

export function initCartBadge() {
    updateCartBadge();
    document.addEventListener("click", (e) => {
        if (e.target.closest(".add-to-cart") || e.target.closest(".remove-from-cart")) {
            setTimeout(updateCartBadge, 0);
        }
    });
    window.addEventListener("storage", (e) => {
        if (e.key === "so-cart") updateCartBadge();
    });
}
