const BASE = (import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com").replace(/\/+$/, "");
console.log("[ExternalServices] BASE =", BASE);

async function convertToJson(res) {
    let json = null;
    try { json = await res.clone().json(); } catch { }
    let text = null;
    if (!json) {
        try {
            const t = await res.text();
            text = t && t.trim() ? t.trim() : null;
        } catch { }
    }
    if (res.ok) return json ?? text;
    const message = json ?? text ?? { status: res.status, statusText: res.statusText };
    throw { name: 'servicesError', message };
}


export default class ExternalServices {
    constructor(category = "tents", limit = 0) {
        this.category = category;
        this.limit = limit;
    }

    async getData() {
        const url = `${BASE}/products/search/${this.category}`;
        console.log("GET", url);
        const res = await fetch(url);
        const raw = await convertToJson(res);
        const data = Array.isArray(raw) ? raw : raw.Result;
        if (!Array.isArray(data)) throw { name: "servicesError", message: "Unexpected response format" };
        return this.limit > 0 ? data.slice(0, this.limit) : data;
    }

    async findProductById(id) {
        const url = `${BASE}/product/${id}`;
        console.log("GET", url);
        const res = await fetch(url);
        const raw = await convertToJson(res);
        return raw.Result || raw;
    }

    async checkout(payload) {
        const url = `${BASE}/checkout`;
        console.log("POST", url, payload);
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const raw = await convertToJson(res);
        return raw.Result || raw;
    }
}
