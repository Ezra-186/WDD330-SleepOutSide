// src/js/product.js
import { loadHeaderFooter, getParam, alertMessage, addToCart } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

loadHeaderFooter();

function q(sel, root = document) { return root.querySelector(sel); }

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

// accept any of these: ?product=, ?id=, ?productId=
function readProductId() {
    return (getParam("product") || getParam("id") || getParam("productId") || "").trim();
}

function viewTemplate(p) {
    const id = p.Id ?? p.id ?? "";
    const name = p.Name ?? p.NameWithoutBrand ?? "Product";
    const brand = p.Brand?.Name ?? "";
    const price = Number(p.FinalPrice ?? p.ListPrice ?? p.Price ?? 0).toFixed(2);
    const desc = p.DescriptionHtmlSimple || p.DescriptionHtml || p.Description || "";
    const rawImg =
        p?.Images?.PrimaryLarge ||
        p?.Images?.PrimaryMedium ||
        p?.Images?.PrimarySmall ||
        p?.Image;
    const img = normalizeImgPath(rawImg);

    return `
    <article class="product-detail" data-id="${id}">
      <div class="product-detail__media">
        <img src="${img}" alt="${name}">
      </div>
      <div class="product-detail__info">
        <h1 class="product-detail__name">${name}</h1>
        ${brand ? `<h3 class="product-detail__brand">${brand}</h3>` : ""}
        <p class="product-detail__price">$${price}</p>
        ${desc ? `<div class="product-detail__desc">${desc}</div>` : ""}
        <div class="product-detail__actions">
          <label>
            Qty
            <input id="qty" type="number" min="1" value="1" inputmode="numeric" />
          </label>
          <button id="addToCart" data-id="${id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

async function init() {
    // tolerate different container ids and even create one if missing
    let mount = q("#product-detail") || q("#product-details");
    if (!mount) {
        const main = q("main") || document.body;
        mount = document.createElement("div");
        mount.id = "product-detail";
        main.appendChild(mount);
    }

    const productId = readProductId();
    if (!productId) {
        mount.innerHTML = `<p class="empty">No product id provided in the URL.</p>`;
        return;
    }

    try {
        const svc = new ExternalServices(); // should support findProductById(id)
        const product = await svc.findProductById(productId);

        if (!product) {
            mount.innerHTML = `<p class="empty">Product not found.</p>`;
            return;
        }

        // set title early so you can see something even if styling lags
        document.title = `Sleep Outside | ${product.Name ?? product.NameWithoutBrand ?? "Product"}`;

        mount.innerHTML = viewTemplate(product);

        // wire add-to-cart
        const addBtn = q("#addToCart", mount);
        addBtn?.addEventListener("click", async () => {
            const qty = Math.max(1, Number(q("#qty", mount)?.value) || 1);
            addToCart(product, qty);
            const { initCartBadge } = await import("./CartBadge.mjs");
            initCartBadge();
            alertMessage("Added to cart!");
        });
    } catch (err) {
        console.error("Product load error:", err);
        mount.innerHTML = `<p class="empty">There was a problem loading this product.</p>`;
    }
}

init();