const BASE = (import.meta.env?.VITE_SERVER_URL || "https://wdd330-backend.onrender.com").replace(/\/+$/, "");
const VALID = new Set(["tents", "backpacks", "hammocks", "sleeping-bags"]);

export default class ExternalServices {
    constructor(category = null, limit = 0) {
        const slug = (category || "").toLowerCase().trim();
        this.category = VALID.has(slug) ? slug : null; 
        this.limit = Number(limit) || 0;
        console.log("[ExternalServices] BASE =", BASE, "category =", this.category);
    }

    async getData() {
        const cat = this.category ?? "tents"; 
        const url = `${BASE}/products/search/${cat}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`getData failed ${res.status} @ ${url}`);
        const raw = await res.json();
        const data = Array.isArray(raw) ? raw : raw.Result;
        return this.limit > 0 ? data.slice(0, this.limit) : data;
    }

    async findProductById(id) {
        const url = `${BASE}/product/${id}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`findProductById failed ${res.status} @ ${url}`);
        const raw = await res.json();
        return raw.Result || raw;
    }

    async checkout(payload) {
        const url = `${BASE}/checkout`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`checkout failed ${res.status} @ ${url}`);
        const raw = await res.json();
        return raw.Result || raw;
    }
}