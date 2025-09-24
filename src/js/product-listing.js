import { loadHeaderFooter, getParam, qs } from './utils.mjs';
import ExternalServices from './ExternalServices.mjs';
import ProductList from './ProductList.mjs';

loadHeaderFooter();

const rawCategory = (getParam('category') || 'tents').trim();
const category = rawCategory.toLowerCase();

const titleEl = document.getElementById('category-title') || qs('h2');
if (titleEl) {
    const cap = category.charAt(0).toUpperCase() + category.slice(1);
    titleEl.textContent = `Top Products: ${cap}`;
    titleEl.setAttribute('aria-live', 'polite');
}

const listElement = document.querySelector('.product-list');
const dataSource = new ExternalServices(category);
const list = new ProductList(dataSource, listElement);
list.init();
