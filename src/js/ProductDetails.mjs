import { qs, getLocalStorage, setLocalStorage, setClick } from './utils.mjs';

export default class ProductDetails {
    constructor(productId, dataSource) { this.productId = productId; this.product = {}; this.dataSource = dataSource; this.cartKey = 'so-cart'; }
    async init()
    { this.product = await this.dataSource.findProductById(this.productId); this.renderProductDetails(); const b = qs('#addToCart'); if (b) { setClick('#addToCart', this.addProductToCart.bind(this)); } }
    renderProductDetails()
    { const p = this.product || {}; const name = p.Name || p.name || 'Product'; const img = p.Image || p.image || p.imageUrl || '/images/tents/tent.svg'; const price = p.FinalPrice ?? p.Price ?? p.price ?? 0; const desc = p.Description || p.description || 'Great outdoor gear.'; const c = qs('[data-product-details]'); if (!c) return; c.innerHTML = `<article class="product-detail"><div class="media"><img src="${img}" alt="${name}"></div><div class="content"><h2>${name}</h2><p class="price">$${Number(price).toFixed(2)}</p><p class="description">${desc}</p><button id="addToCart" class="add">Add to Cart</button></div></article>`; }
    addProductToCart()
    { const cur = getLocalStorage(this.cartKey) || []; cur.push(this.product); setLocalStorage(this.cartKey, cur); const b = qs('#addToCart'); if (b) { b.disabled = true; b.textContent = 'Added!'; setTimeout(() => { b.disabled = false; b.textContent = 'Add to Cart'; }, 1000); } }
}
