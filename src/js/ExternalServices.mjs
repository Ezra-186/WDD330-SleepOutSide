const BASE = (import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com").replace(/\/+$/, "");
console.log("[ExternalServices] BASE =", BASE);

export default class ExternalServices {
    constructor(category = "tents", limit = 0) {
        this.category = category;
        this.limit = limit;
    }

    async getData() {
        const url = `${BASE}/products/search/${this.category}`;
        console.log("GET", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`getData failed ${res.status} @ ${url}`);
        const raw = await res.json();

        const data = Array.isArray(raw) ? raw : raw.Result;
        if (!Array.isArray(data)) throw new Error("Unexpected response format");

        return this.limit > 0 ? data.slice(0, this.limit) : data;
    }

    async findProductById(id) {
        const url = `${BASE}/product/${id}`;
        console.log("GET", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`findProductById failed ${res.status} @ ${url}`);
        const raw = await res.json();
        return raw.Result || raw; 
    }

    async checkout(payload) {
        const url = `${BASE}/checkout`;
        console.log("POST", url, payload);
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
