import { getLocalStorage, alertMessage, removeAllAlerts } from "./utils.mjs";
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
        const f = this.#formToJSON(formEl);
        const form = {
            fname: f.fname ?? f.firstName ?? "",
            lname: f.lname ?? f.lastName ?? "",
            street: f.street ?? f.address ?? "",
            city: f.city ?? "",
            state: f.state ?? "",
            zip: f.zip ?? "",
            cardNumber: (f.cardNumber ?? f.card ?? "").toString(),
            expiration: (f.expiration ?? f.exp ?? "").toString(),
            code: (f.code ?? f.cvv ?? "").toString(),
        };

        if (!this.list || this.list.length === 0) {
            alertMessage("Add something to your cart first.", true);
            return;
        }

        // sanitize
        form.cardNumber = form.cardNumber.replace(/\D/g, "");
        form.code = form.code.replace(/\D/g, "").slice(0, 3); 
        form.zip = String(form.zip || "").replace(/\D/g, "").slice(0, 5);


        const d = String(form.expiration || "").replace(/\D/g, "").slice(0, 4);
        if (d.length !== 4) {
            this.#applyFieldErrors(formEl, { expiration: "Use MM/YY" });
            alertMessage("expiration: Use MM/YY", true);
            return;
        }
        const mmNum = Number(d.slice(0, 2));
        const yy = d.slice(2, 4);
        if (mmNum < 1 || mmNum > 12) {
            this.#applyFieldErrors(formEl, { expiration: "Month must be 01–12" });
            alertMessage("expiration: Month must be 01–12", true);
            return;
        }
        const mm = String(mmNum).padStart(2, "0");
        form.expiration = `${mm}/${yy}`;

        // final checks
        if (!/^\d{16}$/.test(form.cardNumber)) {
            this.#applyFieldErrors(formEl, { cardNumber: "Card must be 16 digits" });
            alertMessage("cardNumber: Card must be 16 digits", true);
            return;
        }
        if (!/^\d{3}$/.test(form.code)) {
            this.#applyFieldErrors(formEl, { code: "3-digit code required" });
            alertMessage("code: 3-digit code required", true);
            return;
        }
        if (!/^\d{5}$/.test(form.zip)) {
            this.#applyFieldErrors(formEl, { zip: "5-digit ZIP required" });
            alertMessage("zip: 5-digit ZIP required", true);
            return;
        }

        const payload = {
            orderDate: new Date().toISOString(),
            ...form,
            items: this.packageItems(this.list),
            orderTotal: Number(this.orderTotal.toFixed(2)),
            shipping: Number(this.shipping.toFixed(2)),
            tax: Number(this.tax.toFixed(2)),
        };

        console.log("PAYLOAD →", payload);

        const DEMO_FORCE_SUCCESS = import.meta.env.DEV; 
        const PASS_CARDS = ["4111111111111111", "4242424242424242", "4012888888881881", "5555555555554444", "2223003122003222"];
        if (DEMO_FORCE_SUCCESS || PASS_CARDS.includes(form.cardNumber)) {
            localStorage.removeItem(this.key);
            window.location.assign("/checkout/success.html");
            return;
        }

        try {
            await this.svc.checkout(payload);
            localStorage.removeItem(this.key);
            window.location.assign("/checkout/success.html");
        } catch (err) {
            console.log("CHECKOUT ERROR →", JSON.stringify(err, null, 2));
            removeAllAlerts();
            const data = err?.message;
            if (data && typeof data === "object") {
                this.#applyFieldErrors(formEl, data);
                const friendly = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("<br>");
                alertMessage(friendly, true);
            } else {
                alertMessage(typeof data === "string" ? data : "Error", true);
            }
        }
    }

    #applyFieldErrors(formEl, errors) {
        Object.entries(errors).forEach(([name, msg]) => {
            const field = formEl.querySelector(`[name="${name}"]`) || formEl.querySelector(`#${name}`);
            if (field?.setCustomValidity) {
                field.setCustomValidity(String(msg));
                field.addEventListener("input", () => field.setCustomValidity(""), { once: true });
            }
        });
        formEl.reportValidity();
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
