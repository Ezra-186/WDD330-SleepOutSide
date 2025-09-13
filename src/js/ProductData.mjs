function toJson(res) { if (res.ok) return res.json(); throw new Error("Bad Response"); }

export default class ProductData {
  constructor(category = "tents", limit = 4) {
    this.path = `/json/${category}.json`;
    this.limit = limit;
  }
  async getData() {
    const data = await fetch(this.path).then(toJson);
    return Array.isArray(data) ? data.slice(0, this.limit) : [];
  }
  async findProductById(id) {
    const products = await this.getData();
    return products.find(p => p.Id === id);
  }
}