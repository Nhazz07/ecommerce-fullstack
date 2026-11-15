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
  if (sort === "name-desc") return [...products].sort((left, right) => right.name.localeCompare(left.name));
  if (sort === "newest") {
    return [...products].sort((left, right) => {
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      if (rightDate && leftDate) return rightDate - leftDate;
      return (Number(right.id) || 0) - (Number(left.id) || 0);
    });
  }
  return products;
};

export const visibleShopProducts = (products, { query = "", category = "", brand = "", series = "", minPrice = "", maxPrice = "", inStockOnly = false, sort = "featured" } = {}) => {
  const normalizedQuery = query.toLowerCase().trim();
  const min = minPrice !== "" && !Number.isNaN(Number(minPrice)) ? Number(minPrice) : null;
  const max = maxPrice !== "" && !Number.isNaN(Number(maxPrice)) ? Number(maxPrice) : null;

  const filtered = products.filter((product) => {
    if (query) {
      const searchHaystack = `${product.name} ${product.brandName || ""} ${product.categoryName || ""} ${product.seriesName || ""} ${product.description || ""}`.toLowerCase();
      if (!searchHaystack.includes(normalizedQuery)) return false;
    }
    if (category && String(product.categoryId) !== String(category)) return false;
    if (brand && String(product.brandId) !== String(brand)) return false;
    if (series && String(product.seriesId) !== String(series)) return false;

    const price = numericProductPrice(productCardPrice(product));
    if (min !== null && Number.isFinite(price) && price < min) return false;
    if (max !== null && Number.isFinite(price) && price > max) return false;

    if (inStockOnly) {
      const isAvailable = product.status === "ACTIVE" && (product.productVariants?.length || 0) > 0;
      if (!isAvailable) return false;
    }

    return true;
  });

  return sortProducts(filtered, sort);
};
