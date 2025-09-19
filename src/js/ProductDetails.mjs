import { qs, getLocalStorage, setLocalStorage, setClick } from './utils.mjs';

export default class ProductDetails {
    constructor(productId, dataSource) {
        this.productId = productId;
        this.product = {};
        this.dataSource = dataSource;
        this.cartKey = 'so-cart';
    }

    async init() {
        this.product = await this.dataSource.findProductById(this.productId);
        this.renderProductDetails();

        const btn = qs('#addToCart');
        if (btn) setClick('#addToCart', this.addProductToCart.bind(this));
    }

    renderProductDetails() {
        const p = this.product || {};

        const name = p.NameWithoutBrand || p.Name || p.name || 'Product';
        const brand = p.Brand?.Name || '';

        const img =
            (p.Images && (p.Images.PrimaryLarge || p.Images.PrimaryMedium)) ||
            p.Image ||
            p.imageUrl ||
            '/images/placeholder.png';

        const price = Number(
            p.FinalPrice ?? p.ListPrice ?? p.Price ?? p.price ?? 0
        ).toFixed(2);

        const desc = p.Description || p.ShortDescription || p.description || 'Great outdoor gear.';
        const container = qs('[data-product-details]');
        if (!container) return;

        container.innerHTML = `
      <article class="product-detail">
        <div class="media">
          <img src="${img}" alt="${brand ? `${brand} ` : ''}${name}">
        </div>
        <div class="content">
          ${brand ? `<h3 class="brand">${brand}</h3>` : ''}
          <h2>${name}</h2>
          <p class="price">$${price}</p>
          <p class="description">${desc}</p>
          <button id="addToCart" class="add" aria-label="Add ${name} to cart">Add to Cart</button>
        </div>
      </article>
    `;
    }

    addProductToCart() {
        const cur = getLocalStorage(this.cartKey) || [];
        cur.push(this.product);
        setLocalStorage(this.cartKey, cur);

        const b = qs('#addToCart');
        if (b) {
            b.disabled = true;
            b.textContent = 'Added!';
            setTimeout(() => {
                b.disabled = false;
                b.textContent = 'Add to Cart';
            }, 1000);
        }
    }
}
