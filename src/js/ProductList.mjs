import { renderListWithTemplate } from "./utils.mjs";

function normalizeImgPath(src) {
  if (!src) return "/images/placeholder.png";
  return src.replace(/^(\.\.\/)+/, "/"); 
}

function productCardTemplate(item) {
  const price = Number(item.FinalPrice ?? item.ListPrice ?? 0).toFixed(2);
  const name = item.NameWithoutBrand ?? item.Name ?? "";
  const brand = item.Brand?.Name ?? "";
  const img = normalizeImgPath(item.Image);
  return `
    <li class="product-card">
      <a href="/product_pages/index.html?product=${item.Id}">
        <img src="${img}" alt="${name}">
        <h3 class="card__brand">${brand}</h3>
        <h2 class="card__name">${name}</h2>
        <p class="product-card__price">$${price}</p>
      </a>
      <button class="add-to-cart" data-id="${item.Id}" aria-label="Add ${name} to cart">Add to Cart</button>
    </li>
  `;
}

function readCart() {
  try { return JSON.parse(localStorage.getItem("so-cart")) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem("so-cart", JSON.stringify(cart));
}
function updateBadgeLocal() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const cart = readCart();
  const total = cart.reduce((sum, p) => sum + (p.quantity || 1), 0);
  badge.textContent = total;
  badge.classList.toggle("is-hidden", total === 0);
}
function addToCartLocal(product, qty = 1) {
  const cart = readCart();
  const idx = cart.findIndex((p) => String(p.Id) === String(product.Id));
  if (idx > -1) {
    cart[idx].quantity = (cart[idx].quantity || 1) + qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  writeCart(cart);
  updateBadgeLocal();
  window.dispatchEvent(new CustomEvent("cart:changed"));
}

export default class ProductList {
  constructor(dataSource, listElement) {
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData();
    renderListWithTemplate(productCardTemplate, this.listElement, list, "afterbegin", true);
    this.addEventListeners();
  }

  addEventListeners() {
    this.listElement.addEventListener("click", (evt) => {
      const btn = evt.target.closest(".add-to-cart");
      if (!btn) return;
      evt.preventDefault();
      const id = btn.dataset.id;
      if (id) this.addItem(id);
    });
  }

  async addItem(id) {
    try {
      const product = await (this.dataSource.findProductById
        ? this.dataSource.findProductById(id)
        : null);
      if (!product) return;
      addToCartLocal(product, 1);
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  }
}