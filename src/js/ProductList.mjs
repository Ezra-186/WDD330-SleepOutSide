import { renderListWithTemplate } from "./utils.mjs";

function asStr(v, fallback = "") {
    if (v == null) return fallback;
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object") return v.Src ?? v.src ?? v.url ?? v.href ?? v.Name ?? v.name ?? fallback;
    return fallback;
}
function normalizeImgPath(p) {
    const s = asStr(p, "/images/placeholder.png");
    if (s.startsWith("/")) return s;
    return "/" + s.replace(/^(?:\.\.\/)+/, "").replace(/^\.\//, "").replace(/^\/+/, "");
}

function productCardTemplate(product) {
    const id = asStr(product.Id ?? product.id);
    const name = asStr(product.Name ?? product.name, "Product");
    const brand = asStr(product.Brand?.Name ?? product.Brand ?? product.brand, "");
    const img = normalizeImgPath(product.Image ?? product.image);
    const raw = product.FinalPrice ?? product.finalPrice ?? product.ListPrice ?? product.Price ?? product.price;
    const price = typeof raw === "number" ? raw.toFixed(2) : asStr(raw, "");
    const href = `/product_pages/index.html?product=${encodeURIComponent(id)}`;

    return `
    <li class="product-card" data-id="${id}">
      <a class="card-link" href="${href}">
        <img src="${img}" alt="Image of ${name}" loading="lazy" width="300" height="200"
             onerror="this.onerror=null;this.src='/images/placeholder.png'">
        <div class="card-body">
          <h2 class="card__brand">${brand}</h2>
          <h3 class="card__name">${name}</h3>
          <p class="product-card__price">$${price}</p>
        </div>
      </a>
      <button class="add-to-cart" data-id="${id}" aria-label="Add ${name} to cart">Add to cart</button>
    </li>
  `;
}

export default class ProductList {
    constructor(dataSource, listElement) {
        this.dataSource = dataSource;
        this.listElement = listElement;
    }
    async init() {
        const products = await this.dataSource.getData();
        renderListWithTemplate(productCardTemplate, this.listElement, products, "afterbegin", true);
    }
}
