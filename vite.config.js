import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  // Use src as the app root for dev and build
  root: "src/",
  // Ensure everything under /public is copied into /dist
  publicDir: "../public",
  build: {
    outDir: "../dist",
    rollupOptions: {
      // Explicit multi-page inputs that we actually use
      input: {
        main: resolve(__dirname, "src/index.html"),
        cart: resolve(__dirname, "src/cart/index.html"),
        checkout: resolve(__dirname, "src/checkout/index.html"),
        // Dynamic product details page (linked as /product_pages/index.html?id=...)
        product: resolve(__dirname, "src/product_pages/index.html"),
      },
    },
  },
  server: {
    open: true,
  },
});