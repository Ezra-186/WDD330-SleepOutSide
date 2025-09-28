import { loadHeaderFooter } from "../js/utils.mjs";
import { initCartBadge } from "../js/CartBadge.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();
initCartBadge();

const checkout = new CheckoutProcess("so-cart", {
    subtotal: "#summary-subtotal",
    tax: "#summary-tax",
    shipping: "#summary-shipping",
    total: "#summary-total",
});

checkout.init();

document.querySelector("#zip")?.addEventListener("input", () => {
    checkout.calculateOrderTotal();
});

document.querySelector("#checkout-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = document.querySelector("#checkout-btn");
    btn?.setAttribute("disabled", "true");
    try { await checkout.checkout(form); }
    finally { btn?.removeAttribute("disabled"); }
});


