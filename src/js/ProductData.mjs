function toJson(res) {
  if (!res.ok) throw new Error(`Bad Response: ${res.status}`);
  return res.json();
}

const rawBase = import.meta.env.VITE_SERVER_URL || '';
const baseURL = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default class ProductData {
  constructor(category = 'tents', limit = 4) {
    this.category = category;
    this.limit = limit;
  }

  async getData() {
    const url = `${baseURL}products/search/${this.category}`;
    const data = await fetch(url, { cache: 'no-store' }).then(toJson);
    const list = Array.isArray(data?.Result) ? data.Result : [];
    return this.limit ? list.slice(0, this.limit) : list;
  }

  async findProductById(id) {
    const url = `${baseURL}product/${id}`;
    try {
      const data = await fetch(url, { cache: 'no-store' }).then(toJson);
      return data?.Result ?? null;
    } catch (err) {
      console.error('findProductById failed:', err);
      return null;
    }
  }
}
