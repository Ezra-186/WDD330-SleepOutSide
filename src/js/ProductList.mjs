import { renderListWithTemplate } from "./utils.mjs";
import { notifyCartChanged, updateCartBadge } from "./CartBadge.mjs";

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

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("so-cart")) || [];
  } catch {
    return [];
  }
}
function writeCart(cart) {
  localStorage.setItem("so-cart", JSON.stringify(cart));
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
        this.addEventListeners();
    }

    addEventListeners() {
        this.listElement.addEventListener("click", (evt) => {
            const btn = evt.target.closest(".add-to-cart");
            if (!btn) return;
            evt.preventDefault();
            evt.stopPropagation();
            const id = btn.dataset.id;
            if (id) this.addToCart(id).catch(console.error);
        });
    }

    async addToCart(id) {
        const product = await (this.dataSource.findProductById
            ? this.dataSource.findProductById(id)
            : null);
        if (!product) return;

        const cart = readCart();
        const idx = cart.findIndex((p) => String(p.Id ?? p.id) === String(id));
        if (idx >= 0) {
            cart[idx].quantity = (cart[idx].quantity ?? cart[idx].qty ?? 0) + 1;
        } else {
            cart.push({
                ...product,
                quantity: 1,
            });
        }
        writeCart(cart);
        notifyCartChanged();
        updateCartBadge();
    }
}
