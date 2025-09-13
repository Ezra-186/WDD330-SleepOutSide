import tents from "../json/tents.json";

export default class ProductData {
  constructor(limit = 4) {
    this.limit = limit;
  }
  async getData() {
    const items = Array.isArray(tents) ? tents : (tents?.products ?? tents ?? []);
    const preferred = ["880RR", "985RF", "985PR", "344YJ"];
    const ordered = preferred
      .map(id => items.find(p => String(p.Id ?? p.id) === id))
      .filter(Boolean);
    return ordered.slice(0, this.limit);
  }
  async findProductById(id) {
    const items = Array.isArray(tents) ? tents : (tents?.products ?? tents ?? []);
    return items.find((item) => String(item.Id ?? item.id) === String(id));
  }
}
