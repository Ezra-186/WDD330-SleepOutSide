function toJson(res) {
  if (!res.ok) throw new Error(`Bad Response: ${res.status}`);
  return res.json();
}

export default class ProductData {
  constructor(category = "tents", limit = 4) {
    this.category = category;
    this.limit = limit;
    this.url = `${import.meta.env.BASE_URL}json/${category}.json`;
  }

  async getAll() {
    return fetch(this.url, { cache: "no-store" }).then(toJson);
  }

  async getData() {
    const data = await this.getAll();
    return Array.isArray(data) ? data.slice(0, this.limit) : [];
  }

  async findProductById(id) {
    const products = await this.getAll();
    return products.find((p) => String(p.Id) === String(id));
  }
}