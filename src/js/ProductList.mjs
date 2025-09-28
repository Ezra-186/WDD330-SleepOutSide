// src/js/ProductList.mjs
import ExternalServices from "./ExternalServices.mjs";
import { renderListWithTemplate, loadHeaderFooter, addToCart, getParam } from "./utils.mjs";

loadHeaderFooter();

function normalizeImgPath(src) {
  if (!src) return "/images/placeholder.png";
  if (/^https?:\/\//i.test(src) || src.startsWith("//")) return src;
  const ORIGIN = "https://wdd330-backend.onrender.com";
  if (src.startsWith("/images/")) return ORIGIN + src;
  if (src.startsWith("images/")) return `${ORIGIN}/${src}`;
  if (src.startsWith("../")) return src.replace(/^(\.\.\/)+/, "/");
  if (src.startsWith("./")) return src.replace(/^\.\//, "/");
  return `/${src}`;
}

function cardTemplate(item) {
  const id = item.Id ?? item.id;
  const name = item.NameWithoutBrand ?? item.Name ?? "";
  const brand = item.Brand?.Name ?? "";
  const price = Number(item.FinalPrice ?? item.ListPrice ?? item.Price ?? 0).toFixed(2);
  const rawImg = item?.Images?.PrimaryMedium || item?.Images?.PrimaryLarge || item?.Images?.PrimarySmall || item?.Image;
  const img = normalizeImgPath(rawImg);
  return `
    <li class="product-card" data-id="${id}">
      <a class="product-link" href="/product_pages/index.html?product=${id}">
        <img src="${img}" alt="${name}">
        <h3 class="card__brand">${brand}</h3>
        <h2 class="card__name">${name}</h2>
        <p class="product-card__price">$${price}</p>
      </a>
      <button class="add-to-cart" data-id="${id}">Add to Cart</button>
    </li>
  `;
}

export default class ProductList {
  constructor(dataSource, listElement) {
    this.dataSource = dataSource;
    this.listElement = listElement;
  }
  async init() {
    const list = await this.dataSource.getData();
    if (!Array.isArray(list) || list.length === 0) {
      this.listElement.innerHTML = '<li class="empty">No products found.</li>';
      return;
    }
    renderListWithTemplate(cardTemplate, this.listElement, list, "afterbegin", true);

    this.listElement.addEventListener("click", async (e) => {
      const btn = e.target.closest(".add-to-cart");
      if (!btn) return;
      const product = await this.dataSource.findProductById(btn.dataset.id);
      addToCart(product, 1);
      const { initCartBadge } = await import("./CartBadge.mjs");
      initCartBadge();
    });
  }
}

// ===== Listing-page bootstrap (runs only if #product-list exists) =====
(function bootstrapListing() {
  const listEl = document.querySelector("#product-list");
  if (!listEl) return;

  const raw = (getParam("category") || "tents").toLowerCase().trim();
  let slug = raw.replace(/\s+/g, "-");

  // guard against any lingering singularization from older code
  if (slug === "sleeping-bag") slug = "sleeping-bags";

  const allowed = new Set(["tents", "backpacks", "hammocks", "sleeping-bags"]);
  const apiCategory = allowed.has(slug) ? slug : "tents";

  console.log("[listing] raw=", raw, "slug=", slug, "→ apiCategory=", apiCategory);

  const svc = new ExternalServices(apiCategory);

  const titleEl = document.querySelector("#category-title") || document.querySelector("main h2");
  const pretty = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (titleEl) titleEl.textContent = pretty;
  document.title = `Sleep Outside | ${pretty}`;

  new ProductList(svc, listEl).init();
})();