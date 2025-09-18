import { getParam } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";
import { addToCart, getCartCount } from "./utils.mjs";
import { loadHeaderFooter } from "./utils.mjs";
loadHeaderFooter();


const productId = getParam("product");
const dataSource = new ProductData("tents");
const productPage = new ProductDetails(productId, dataSource);
productPage.init();

const detailsContainer = document.querySelector("[data-product-details]");
if (detailsContainer) {
  detailsContainer.addEventListener("click", async (evt) => {
    const btn = evt.target.closest(".add-to-cart");
    if (!btn) return;
    evt.preventDefault();
    evt.stopPropagation();
    try {
      const product = await dataSource.findProductById(productId);
      addToCart(product, 1);
      const badge = document.getElementById("cart-count");
      if (badge) {
        const total = getCartCount();
        badge.textContent = total;
        badge.classList.toggle("is-hidden", total === 0);
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  });
}
