import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

export default class CheckoutProcess {
    constructor(cartKey, outSel) {
        this.key = cartKey;
        this.out = outSel;
        this.list = [];
        this.itemTotal = 0;
        this.tax = 0;
        this.shipping = 0;
        this.orderTotal = 0;
        this.svc = new ExternalServices();
    }

    init() {
        this.list = getLocalStorage(this.key) ?? [];
        this.calculateItemSubTotal();
        this.calculateOrderTotal();
    }

    calculateItemSubTotal() {
        this.itemTotal = this.list.reduce((sum, item) => {
            const price = Number(item.FinalPrice ?? item.ListPrice ?? item.Price ?? 0);
            const qty = Number(item.quantity ?? 1);
            return sum + price * qty;
        }, 0);
        this.#display(this.out.subtotal, this.itemTotal);
    }

    calculateOrderTotal() {
        const count = this.list.reduce((n, item) => n + Number(item.quantity ?? 1), 0);
        this.tax = this.itemTotal * 0.06;
        this.shipping = count > 0 ? 10 + Math.max(0, count - 1) * 2 : 0;
        this.orderTotal = this.itemTotal + this.tax + this.shipping;
        this.#display(this.out.tax, this.tax);
        this.#display(this.out.shipping, this.shipping);
        this.#display(this.out.total, this.orderTotal);
    }

    packageItems(items) {
        return items.map((p) => ({
            id: p.Id ?? p.id,
            name: p.Name ?? p.name ?? "",
            price: Number(p.FinalPrice ?? p.ListPrice ?? p.Price ?? 0),
            quantity: Number(p.quantity ?? 1),
        }));
    }

    async checkout(formEl) {
        const payload = {
            orderDate: new Date().toISOString(),
            ...this.#formToJSON(formEl),
            items: this.packageItems(this.list),
            orderTotal: Number(this.orderTotal.toFixed(2)),
            shipping: Number(this.shipping.toFixed(2)),
            tax: Number(this.tax.toFixed(2)),
        };
        const resp = await this.svc.checkout(payload);
        alert(`Server response: ${JSON.stringify(resp)}`);
    }

    #formToJSON(formEl) {
        const fd = new FormData(formEl);
        const o = {};
        fd.forEach((v, k) => (o[k] = v));
        return o;
    }

    #display(sel, value) {
        const el = document.querySelector(sel);
        if (el) el.textContent = `$${Number(value).toFixed(2)}`;
    }
}
