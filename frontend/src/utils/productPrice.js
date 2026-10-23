export const numericProductPrice = (price) => {
  if (typeof price === "number") return Number.isFinite(price) ? price : Number.NaN;
  if (typeof price !== "string") return Number.NaN;

  // Product prices normally arrive as JSON numbers, but accept the same
  // dollar/comma-formatted strings used by the storefront as a safe fallback.
  const normalized = price.trim().replace(/,/g, "").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const comparePrices = (left, right, direction) => {
  const leftPrice = numericProductPrice(productCardPrice(left));
  const rightPrice = numericProductPrice(productCardPrice(right));
  const leftIsValid = Number.isFinite(leftPrice);
  const rightIsValid = Number.isFinite(rightPrice);

  if (!leftIsValid && !rightIsValid) return 0;
  if (!leftIsValid) return 1;
  if (!rightIsValid) return -1;
  return direction * (leftPrice - rightPrice);
};

// Keep Shop All sorting aligned with ProductCard: a product with exactly one
// variant displays that variant's price; all other cards display product.price.
export const productCardPrice = (product) => {
  const variants = product.productVariants || [];
  return variants.length === 1 ? variants[0].price ?? product.price : product.price;
};

export const sortProducts = (products, sort) => {
  if (sort === "price-low") return [...products].sort((left, right) => comparePrices(left, right, 1));
  if (sort === "price-high") return [...products].sort((left, right) => comparePrices(left, right, -1));
  if (sort === "name") return [...products].sort((left, right) => left.name.localeCompare(right.name));
  return products;
};

export const visibleShopProducts = (products, { query = "", category = "", brand = "", sort = "featured" }) => {
  const normalizedQuery = query.toLowerCase();
  const filtered = products.filter((product) =>
    (!query || `${product.name} ${product.brandName} ${product.categoryName} ${product.seriesName}`.toLowerCase().includes(normalizedQuery))
    && (!category || String(product.categoryId) === category)
    && (!brand || String(product.brandId) === brand),
  );
  return sortProducts(filtered, sort);
};
