/* eslint-disable react-refresh/only-export-components */
import {
    AlertCircle,
    ArrowRight,
    Check,
    Heart,
    Info,
    Minus,
    Package,
    Plus,
    RotateCcw,
    Search,
    ShieldCheck,
    ShoppingBag,
    SlidersHorizontal,
    Sparkles,
    Star,
    Trash2,
    Truck,
    X
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { messageFrom } from "../api/client";
import { accountApi, authApi, catalogueApi } from "../api/services";
import { money } from "../components/Layout";
import { ANTEIKU_FALLBACK_IMAGE, imageOf, ProductCard, ProductCardSkeleton } from "../components/ProductCard";
import { StoreContext } from "../context/StoreContext";
import { visibleShopProducts } from "../utils/productPrice";
import { QRCodeSVG } from "qrcode.react";
export const Button = ({ className = "", variant = "primary", ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer";
  const styles = {
    primary: "border border-black bg-black text-white hover:bg-neutral-800",
    secondary: "border border-[#E5E5E5] bg-white text-black hover:border-black",
    outline: "border border-black bg-transparent text-black hover:bg-black hover:text-white",
    dark: "border border-black bg-black text-white hover:bg-neutral-800",
  };
  return <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props} />;
};

export const Page = ({ eyebrow, title, subtitle, children, actions }) => (
  <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-white text-black">
    <div className="border-b border-[#E5E5E5] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-xs text-[#737373] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
    {children}
  </section>
);

export const Notice = ({ children, type = "error" }) => (
  <div
    role={type === "error" ? "alert" : "status"}
    className={`my-4 flex items-start gap-3 border p-4 text-xs leading-relaxed ${
      type === "error"
        ? "border-black bg-black text-white"
        : "border-[#E5E5E5] bg-[#FAFAFA] text-black"
    }`}
  >
    <div className="mt-0.5 shrink-0">
      {type === "error" ? <AlertCircle size={15} /> : <Info size={15} />}
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

export const Loading = () => (
  <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
    <div className="inline-flex items-center gap-3 border border-[#E5E5E5] bg-[#FAFAFA] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black">
      <div className="h-2 w-2 animate-ping bg-black" />
      <span>Consulting Archive…</span>
    </div>
  </div>
);

function useCatalogue() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    products: [],
    categories: [],
    brands: [],
  });

  useEffect(() => {
    Promise.allSettled([
      catalogueApi.products(0, 100),
      catalogueApi.categories(),
      catalogueApi.brands(),
    ]).then(([products, categories, brands]) => {
      const failures = [products, categories, brands].filter((result) => result.status === "rejected");
      setState({
        loading: false,
        error: failures.map((result) => messageFrom(result.reason)).join(" "),
        products: products.status === "fulfilled" ? products.value.content || [] : [],
        categories: categories.status === "fulfilled" ? categories.value : [],
        brands: brands.status === "fulfilled" ? brands.value : [],
      });
    });
  }, []);

  const series = useMemo(() => {
    const map = new Map();
    state.products.forEach((p) => {
      if (p.seriesId != null && p.seriesName) {
        const key = String(p.seriesId);
        const cur = map.get(key) || { id: p.seriesId, name: p.seriesName, count: 0 };
        cur.count += 1;
        map.set(key, cur);
      }
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [state.products]);

  return { ...state, series };
}

const toCartItem = (product, variant) => ({
  productId: product.id,
  variantId: variant.id,
  name: product.name,
  variantName: variant.name,
  price: Number(variant.price ?? product.price),
  image: imageOf(product),
  quantity: variant.selectedQuantity || 1,
});

/* =========================================================================
   1. HOME PAGE
   ========================================================================= */
export function HomePage() {
  const { products, categories, series, loading, error } = useCatalogue();
  const { addToCart } = useContext(StoreContext);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const featuredPiece = products[0];
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(4, 12).length > 0 ? products.slice(4, 12) : products.slice(0, 8);

  return (
    <div className="space-y-16 sm:space-y-24 bg-white text-black">
      {/* Large Hero Section */}
      <section className="relative border-b border-[#E5E5E5] bg-[#FAFAFA] py-16 sm:py-24 lg:py-28">
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border border-black bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-black">
              <span>Authentic Anime Artefacts & Figures</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-black sm:text-6xl lg:text-7xl">
              Sculpted In Silence. <br />
              <span className="font-light italic text-neutral-600">Defined In Monochrome.</span>
            </h1>

            <p className="max-w-lg text-xs leading-relaxed text-[#737373] sm:text-sm">
              ANTEIKU is a minimalist Tokyo archive curated for the discerning anime connoisseur.
              Explore licensed scale figures, artisan statues, and authenticated limited editions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border border-black bg-black px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
              >
                <span>Shop Now</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/series"
                className="inline-flex items-center gap-2 border border-black bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
              >
                <span>Browse Series</span>
              </Link>
            </div>
          </div>

          {/* Hero Feature Piece Card */}
          {featuredPiece && (
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden border border-black bg-white shadow-sm">
                <img
                  src={imageOf(featuredPiece)}
                  alt={featuredPiece.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
                  onError={(e) => {
                    e.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-white/95 p-5 border-t border-[#E5E5E5] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#737373]">
                    <span>Featured Piece</span>
                    <span>{featuredPiece.categoryName || "Archive"}</span>
                  </div>
                  <h3 className="text-base font-bold text-black line-clamp-1">
                    {featuredPiece.name}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-extrabold text-black">
                      {money(featuredPiece.price)}
                    </span>
                    <Link
                      to={`/product/${featuredPiece.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black hover:underline"
                    >
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Brand Value Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Sparkles,
              title: "100% Japanese Authenticity",
              desc: "Directly verified through licensed official Japanese studios and distributors.",
            },
            {
              icon: Package,
              title: "Archival Packaging",
              desc: "Every statue and figure arrives safely in reinforced double-boxed protection.",
            },
            {
              icon: Truck,
              title: "Complimentary Express",
              desc: "Insured express global shipping with full tracking on all orders over $150.",
            },
            {
              icon: ShieldCheck,
              title: "Collector Guarantee",
              desc: "Uncompromising quality checks and dedicated customer support for collectors.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="border border-[#E5E5E5] bg-white p-6 transition-colors hover:border-black"
            >
              <div className="flex h-10 w-10 items-center justify-center border border-black bg-white text-black">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-black">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
              Curated Mediums
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Popular Categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:underline"
          >
            <span>All Categories ({categories.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group flex flex-col justify-between border border-[#E5E5E5] bg-[#FAFAFA] p-6 transition-all hover:border-black hover:bg-white"
            >
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#737373]">
                  CATEGORY // 0{cat.id || 1}
                </span>
                <h3 className="mt-3 text-lg font-bold text-black transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-2 text-xs text-[#737373] line-clamp-2 leading-relaxed">
                  {cat.description || "Official licensed artefacts and figures."}
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-black group-hover:translate-x-1 transition-transform">
                <span>Explore Category</span>
                <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
              Curated Highlights
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
              Featured Products
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:underline"
          >
            <span>View All Products</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {error && <Notice>{error}</Notice>}

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {featuredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={(prod, variant) => addToCart(toCartItem(prod, variant))}
            />
          ))}
        </div>
      </section>

      {/* Promotional Banner: Black Background & White Typography */}
      <section className="w-full bg-black text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <span className="inline-block border border-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-white">
                Archival Release
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Limited Japanese Imports & Studio Masterpieces
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                Direct allocations from Tokyo studios. From classic dark fantasy to modern shonen legends,
                each piece is numbered and verified for authenticity. Complimentary worldwide shipping over $150.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start lg:items-center justify-start lg:justify-end gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border border-white bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-black hover:bg-neutral-200 transition-colors"
              >
                <span>Shop New Releases</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/brands"
                className="inline-flex items-center gap-2 border border-white bg-transparent px-7 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
              >
                <span>Explore Brands</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
              Recently Added
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-black">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:underline"
          >
            <span>View Full Archive ({products.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={(prod, variant) => addToCart(toCartItem(prod, variant))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   2. SHOP PAGE (Comprehensive Filters, Search, Series, Price Range, Sorting)
   ========================================================================= */
export function ShopPage() {
  const { products, categories, brands, series, loading, error } = useCatalogue();
  const { addToCart } = useContext(StoreContext);
  const [params, setParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const brand = params.get("brand") || "";
  const seriesParam = params.get("series") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const inStock = params.get("inStock") === "true";
  const sort = params.get("sort") || "featured";

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [q, category, brand, seriesParam, minPrice, maxPrice, inStock, sort]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value !== "" && value !== null && value !== undefined && value !== false) {
      next.set(key, String(value));
    } else {
      next.delete(key);
    }
    setParams(next);
  };

  const removeFilter = (...keys) => {
    const next = new URLSearchParams(params);
    keys.forEach((k) => next.delete(k));
    setParams(next);
  };

  const clearAllFilters = () => {
    setParams({});
  };

  const activeFiltersCount = [
    Boolean(q),
    Boolean(category),
    Boolean(brand),
    Boolean(seriesParam),
    Boolean(minPrice || maxPrice),
    Boolean(inStock),
  ].filter(Boolean).length;

  const shown = useMemo(
    () =>
      visibleShopProducts(products, {
        query: q,
        category,
        brand,
        series: seriesParam,
        minPrice,
        maxPrice,
        inStockOnly: inStock,
        sort,
      }),
    [products, q, category, brand, seriesParam, minPrice, maxPrice, inStock, sort]
  );

  const totalPages = Math.ceil(shown.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return shown.slice(start, start + pageSize);
  }, [shown, currentPage, pageSize]);

  const categoryName = categories.find((c) => String(c.id) === category)?.name;
  const brandName = brands.find((b) => String(b.id) === brand)?.name;
  const seriesName = series.find((s) => String(s.id) === seriesParam)?.name;

  const filterSidebar = (
    <aside className="space-y-6 text-xs">
      {/* Search Filter */}
      <div className="space-y-2">
        <label htmlFor="shop-search-input" className="block text-[11px] font-bold uppercase tracking-wider text-black">
          Search Products
        </label>
        <div className="relative">
          <input
            id="shop-search-input"
            type="text"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search figures, titles..."
            className="field pr-8 text-xs border-[#E5E5E5] bg-white text-black focus:border-black"
          />
          {q && (
            <button
              type="button"
              onClick={() => update("q", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-black"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2 border-t border-[#E5E5E5] pt-5">
        <label htmlFor="shop-category-select" className="block text-[11px] font-bold uppercase tracking-wider text-black">
          Category
        </label>
        <select
          id="shop-category-select"
          value={category}
          onChange={(e) => update("category", e.target.value)}
          className="field text-xs bg-white text-black border-[#E5E5E5] focus:border-black"
        >
          <option value="">All Categories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand / Studio Filter */}
      <div className="space-y-2 border-t border-[#E5E5E5] pt-5">
        <label htmlFor="shop-brand-select" className="block text-[11px] font-bold uppercase tracking-wider text-black">
          Brand / Studio
        </label>
        <select
          id="shop-brand-select"
          value={brand}
          onChange={(e) => update("brand", e.target.value)}
          className="field text-xs bg-white text-black border-[#E5E5E5] focus:border-black"
        >
          <option value="">All Brands ({brands.length})</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Series Filter */}
      {series.length > 0 && (
        <div className="space-y-2 border-t border-[#E5E5E5] pt-5">
          <label htmlFor="shop-series-select" className="block text-[11px] font-bold uppercase tracking-wider text-black">
            Anime Series
          </label>
          <select
            id="shop-series-select"
            value={seriesParam}
            onChange={(e) => update("series", e.target.value)}
            className="field text-xs bg-white text-black border-[#E5E5E5] focus:border-black"
          >
            <option value="">All Anime Series ({series.length})</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-3 border-t border-[#E5E5E5] pt-5">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-black">
          Price Range (USD)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              min="0"
              placeholder="Min ($)"
              value={minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              className="field text-xs border-[#E5E5E5] focus:border-black"
            />
          </label>
          <label className="block">
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              min="0"
              placeholder="Max ($)"
              value={maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="field text-xs border-[#E5E5E5] focus:border-black"
            />
          </label>
        </div>

        {/* Quick price presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "< $50", max: "50", min: "" },
            { label: "$50 – $150", min: "50", max: "150" },
            { label: "$150 – $300", min: "150", max: "300" },
            { label: "$300+", min: "300", max: "" },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(params);
                if (preset.min) next.set("minPrice", preset.min);
                else next.delete("minPrice");
                if (preset.max) next.set("maxPrice", preset.max);
                else next.delete("maxPrice");
                setParams(next);
              }}
              className="border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold text-black hover:border-black hover:bg-white transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* In-Stock Only Toggle */}
      <div className="border-t border-[#E5E5E5] pt-5">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => update("inStock", e.target.checked)}
            className="accent-black h-4 w-4"
          />
          <span className="text-xs text-black font-semibold">In-Stock Only</span>
        </label>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:underline pt-2"
        >
          <RotateCcw size={13} />
          <span>Reset All Filters</span>
        </button>
      )}
    </aside>
  );

  return (
    <Page
      eyebrow="Catalogue"
      title="All Products"
      subtitle="Curated official anime figures, collectables, and artefacts from Tokyo studios."
    >
      {/* Top Filter and Sort Controls Bar */}
      <div className="flex flex-col gap-4 border-b border-[#E5E5E5] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider text-[#737373]">
            {loading ? "Loading..." : `Showing ${shown.length} ${shown.length === 1 ? "product" : "products"}`}
          </span>

          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-black text-white">
              {activeFiltersCount} Active {activeFiltersCount === 1 ? "Filter" : "Filters"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 border border-[#E5E5E5] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black lg:hidden hover:border-black"
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center bg-black text-[9px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort-select" className="text-xs text-[#737373] hidden sm:inline">
              Sort by:
            </label>
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-semibold text-black outline-none focus:border-black"
            >
              <option value="featured">Featured Collection</option>
              <option value="newest">New Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Title: A – Z</option>
              <option value="name-desc">Title: Z – A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-[#E5E5E5]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373] mr-1">
            Active Filters:
          </span>

          {q && (
            <span className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-xs text-black">
              <span>Query: “{q}”</span>
              <button
                type="button"
                onClick={() => removeFilter("q")}
                className="text-[#737373] hover:text-black"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {category && (
            <span className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-xs text-black">
              <span>Category: {categoryName || category}</span>
              <button
                type="button"
                onClick={() => removeFilter("category")}
                className="text-[#737373] hover:text-black"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {brand && (
            <span className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-xs text-black">
              <span>Brand: {brandName || brand}</span>
              <button
                type="button"
                onClick={() => removeFilter("brand")}
                className="text-[#737373] hover:text-black"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {seriesParam && (
            <span className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-xs text-black">
              <span>Series: {seriesName || seriesParam}</span>
              <button
                type="button"
                onClick={() => removeFilter("series")}
                className="text-[#737373] hover:text-black"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-xs text-black">
              <span>
                Price: {minPrice ? `$${minPrice}` : "$0"} – {maxPrice ? `$${maxPrice}` : "∞"}
              </span>
              <button
                type="button"
                onClick={() => removeFilter("minPrice", "maxPrice")}
                className="text-[#737373] hover:text-black"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {inStock && (
            <span className="inline-flex items-center gap-1.5 border border-[#E5E5E5] bg-[#FAFAFA] px-2.5 py-1 text-xs text-black">
              <span>In-Stock Only</span>
              <button
                type="button"
                onClick={() => removeFilter("inStock")}
                className="text-[#737373] hover:text-black"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[11px] font-bold text-black hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {error && <Notice>{error}</Notice>}

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-xs border-l border-[#E5E5E5] bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-6">
                  <h3 className="text-base font-bold text-black">
                    Filter Products
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-[#737373] hover:text-black p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
                {filterSidebar}
              </div>

              <div className="pt-6 border-t border-[#E5E5E5] mt-6 space-y-2">
                <Button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full"
                >
                  View {shown.length} Results
                </Button>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full text-center text-xs font-semibold text-[#737373] hover:text-black py-2"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-r border-[#E5E5E5] pr-8">
          {filterSidebar}
        </div>

        {/* Product Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProducts.length ? (
            <div className="space-y-12">
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3">
                {paginatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAdd={(prod, variant) => addToCart(toCartItem(prod, variant))}
                  />
                ))}
              </div>

              {/* Minimalist Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-6">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="border border-[#E5E5E5] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setCurrentPage(num);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`h-8 w-8 text-xs font-bold transition-colors ${
                          currentPage === num
                            ? "bg-black text-white"
                            : "border border-[#E5E5E5] bg-white text-black hover:border-black"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="border border-[#E5E5E5] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-[#E5E5E5] bg-[#FAFAFA] p-12 text-center my-8">
              <div className="flex h-14 w-14 items-center justify-center border border-black bg-white text-black">
                <Search size={22} />
              </div>
              <h3 className="mt-4 text-base font-bold text-black">
                No Products Found
              </h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#737373]">
                No items match your active filters or search terms. Try broadening your criteria or clearing filters.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 border border-black bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

/* =========================================================================
   3. PRODUCT DETAIL PAGE (Gallery, Accordions, Reviews)
   ========================================================================= */
export function ProductPage() {
  const { id } = useParams();
  const { addToCart, user, wishlists, isWishlisted, addWishlistProduct, removeWishlistProduct, showToast } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [wishBusy, setWishBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [index, setIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    catalogueApi
      .product(id)
      .then((result) => {
        setProduct(result);
        setSelected(result.productVariants?.[0] || null);
        setIndex(0);
      })
      .catch((loadError) => setError(messageFrom(loadError)));
  }, [id]);

  useEffect(() => {
    if (product) {
      if (product.seriesId) {
        catalogueApi.productsForSeries(product.seriesId).then((items) => {
          setRelated((items || []).filter((p) => String(p.id) !== String(product.id)).slice(0, 4));
        }).catch(() => {});
      } else {
        catalogueApi.products(0, 8).then((res) => {
          const list = res?.content || [];
          setRelated(list.filter((p) => String(p.id) !== String(product.id)).slice(0, 4));
        }).catch(() => {});
      }
    }
  }, [product]);

  if (error) {
    return (
      <Page eyebrow="Catalogue" title="Product Notice">
        <Notice>{error}</Notice>
        <Link to="/shop" className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-black underline">
          ← Return to All Products
        </Link>
      </Page>
    );
  }

  if (!product) return <Loading />;

  const wished = isWishlisted(product.id);

  const save = async () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(`/product/${id}`)}`, {
        state: { notice: "Sign in to save products to your wishlist." },
      });
      return;
    }
    if (wishBusy) return;
    setWishBusy(true);
    setWishMessage("");
    try {
      if (wished) {
        const list = wishlists?.find((entry) =>
          (entry.productIds || []).some((productId) => String(productId) === String(product.id))
        );
        if (!list) throw new Error("Your wishlist is still loading. Please try again shortly.");
        await removeWishlistProduct(list.id, product.id);
        const msg = "Removed from wishlist.";
        setWishMessage(msg);
        showToast(product.name, "info", "Removed from Wishlist");
      } else {
        const result = await addWishlistProduct(product.id);
        const msg = result.alreadySaved ? "Already in wishlist." : "Saved to wishlist.";
        setWishMessage(msg);
        showToast(product.name, "success", result.alreadySaved ? "Already in Wishlist" : "Saved to Wishlist");
      }
    } catch (saveError) {
      setWishMessage(messageFrom(saveError));
    } finally {
      setWishBusy(false);
    }
  };

  const images = product.productImages?.length
    ? product.productImages
    : [{ imageUrl: imageOf(product), altText: product.name }];

  const unavailable = product.status !== "ACTIVE" || (product.productVariants || []).length === 0;

  const handleAdd = () => {
    if (!selected || unavailable) return;
    addToCart({
      productId: product.id,
      variantId: selected.id,
      name: product.name,
      variantName: selected.name,
      price: Number(selected.price ?? product.price),
      image: imageOf(product),
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-white text-black">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-[#737373] tracking-wide">
        <Link to="/" className="hover:text-black transition-colors font-medium">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-black transition-colors font-medium">
          Products
        </Link>
        {product.categoryName && (
          <>
            <span>/</span>
            <Link
              to={`/shop?category=${product.categoryId}`}
              className="hover:text-black transition-colors font-medium"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="truncate max-w-[200px] text-black font-semibold">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA]">
            <img
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
              src={images[index]?.imageUrl || ANTEIKU_FALLBACK_IMAGE}
              alt={images[index]?.altText || product.name}
              onError={(event) => {
                event.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
              }}
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-20 w-16 shrink-0 overflow-hidden border transition-all duration-150 ${
                    i === index
                      ? "border-black ring-1 ring-black"
                      : "border-[#E5E5E5] opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    className="h-full w-full object-cover"
                    src={img.imageUrl}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-[#E5E5E5] pb-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
                {product.brandName || "ANTEIKU ARCHIVE"}
              </span>
              {product.seriesName && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  {product.seriesName}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-2xl font-bold tracking-tight text-black">
                {money(selected?.price ?? product.price)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider border border-black bg-white text-black px-2 py-0.5">
                {unavailable ? "Archived / Unavailable" : "In Stock · Direct Tokyo Dispatch"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs leading-relaxed text-[#737373] space-y-3">
            <p className="whitespace-pre-line">
              {product.description ||
                "Acquired directly from verified Tokyo creators and licensed Japanese workshops. Hand-inspected prior to archival dispatch."}
            </p>
          </div>

          {/* Variant Selection */}
          {product.productVariants?.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Select Option / Edition
              </span>
              <div className="flex flex-wrap gap-2">
                {product.productVariants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelected(variant)}
                    className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                      selected?.id === variant.id
                        ? "border-black bg-black text-white"
                        : "border-[#E5E5E5] bg-white text-black hover:border-black"
                    }`}
                  >
                    {variant.name || [variant.size, variant.color].filter(Boolean).join(" / ") || variant.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stepper + Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex h-12 items-center border border-[#E5E5E5] bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity === 1}
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  className="px-3.5 h-full flex items-center justify-center text-[#737373] hover:text-black disabled:opacity-30 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-xs font-bold tabular-nums text-black">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((v) => v + 1)}
                  className="px-3.5 h-full flex items-center justify-center text-[#737373] hover:text-black transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAdd}
                disabled={unavailable || !selected}
                className={`flex-1 h-12 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  added
                    ? "bg-neutral-800 text-white"
                    : "bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Wishlist Heart Button */}
              <button
                type="button"
                disabled={wishBusy}
                aria-pressed={wished}
                onClick={save}
                aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                className={`h-12 w-12 flex items-center justify-center border transition-colors ${
                  wished
                    ? "border-black bg-black text-white"
                    : "border-[#E5E5E5] bg-white text-black hover:border-black"
                }`}
              >
                <Heart size={18} fill={wished ? "currentColor" : "none"} />
              </button>
            </div>

            {wishMessage && (
              <p role="status" className="text-xs font-semibold text-black pt-1">
                {wishMessage}
              </p>
            )}
          </div>

          {/* Specifications Table */}
          <dl className="mt-8 grid grid-cols-2 gap-y-3 border-t border-[#E5E5E5] pt-6 text-xs">
            <dt className="text-[#737373] uppercase tracking-wider font-semibold">Category</dt>
            <dd className="text-black font-semibold">{product.categoryName || "—"}</dd>

            <dt className="text-[#737373] uppercase tracking-wider font-semibold">Series</dt>
            <dd className="text-black font-semibold">{product.seriesName || "—"}</dd>

            <dt className="text-[#737373] uppercase tracking-wider font-semibold">Studio / Brand</dt>
            <dd className="text-black font-semibold">{product.brandName || "ANTEIKU"}</dd>

            <dt className="text-[#737373] uppercase tracking-wider font-semibold">Item SKU</dt>
            <dd className="text-black font-mono font-semibold">{selected?.sku || product.sku || "—"}</dd>
          </dl>

          {/* Guarantee Badges */}
          <div className="border-t border-[#E5E5E5] pt-6 grid grid-cols-2 gap-4 text-xs text-[#737373]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-black" />
              <span className="font-semibold text-black">Official License Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-black" />
              <span className="font-semibold text-black">Archival Double-Boxing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="mt-20 border-t border-[#E5E5E5] pt-12">
          <div className="flex items-end justify-between pb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
                Curated Suggestions
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
                Related Products
              </h2>
            </div>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-black hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={(prod, variant) => addToCart(toCartItem(prod, variant))}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================================
   4. PRODUCT REVIEWS PAGE
   ========================================================================= */
export function ProductReviewsPage() {
  const { id } = useParams();
  const { user } = useContext(StoreContext);
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [loadedFor, setLoadedFor] = useState("");
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("5");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    if (!user) return () => { active = false; };
    const requestKey = `${id}:${user.id}`;
    accountApi
      .productReviews(id)
      .then((items) => {
        if (active) {
          setReviews(Array.isArray(items) ? items : []);
          setError("");
          setLoadedFor(requestKey);
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 404) setReviews([]);
        else setError(messageFrom(err));
        setLoadedFor(requestKey);
      });
    return () => { active = false; };
  }, [id, user]);

  const loading = Boolean(user) && loadedFor !== `${id}:${user.id}`;

  const submit = async (event) => {
    event.preventDefault();
    if (!user || submitting || !comment.trim()) return;
    setSubmitting(true);
    setFeedback("");
    setError("");
    try {
      const created = await accountApi.createReview({
        rating: Number(rating),
        comment: comment.trim(),
        userId: user.id,
        productId: Number(id),
      });
      if (!created || created.id == null) {
        throw new Error("The review endpoint did not confirm a saved review. Please try again.");
      }
      setReviews((current) => [created, ...current]);
      setComment("");
      setFeedback("Your collector review has been submitted.");
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 bg-white text-black">
      <div className="border-t border-[#E5E5E5] pt-12">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
              Customer Reviews
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
              Verified Collector Feedback
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#737373]">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </span>
        </div>

        {!user ? (
          <div className="mt-6 border border-[#E5E5E5] bg-[#FAFAFA] p-6 text-center text-xs text-[#737373]">
            <p>Sign in to read client reviews and share your impressions of this piece.</p>
            <Link
              to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
              state={{ notice: "Sign in to view and write product reviews." }}
              className="mt-3 inline-block font-bold uppercase tracking-wider text-black underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        ) : loading ? (
          <p className="mt-6 text-xs text-[#737373]">Loading reviews…</p>
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
            {/* Reviews List */}
            <div className="space-y-4">
              {error && <Notice>{error}</Notice>}
              {feedback && <Notice type="info">{feedback}</Notice>}

              {reviews.length === 0 ? (
                <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-8 text-center text-xs text-[#737373]">
                  No collector reviews have been registered for this piece yet.
                </div>
              ) : (
                <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] bg-white">
                  {reviews.map((review) => (
                    <article key={review.id} className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-black">
                            {review.userName || "Verified Collector"}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-black bg-[#F5F5F5] px-1.5 py-0.5 border border-[#E5E5E5]">
                            Verified
                          </span>
                        </div>
                        <span className="text-[10px] text-[#737373]">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Date unavailable"}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 text-black">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < (review.rating || 5) ? "currentColor" : "none"}
                            className={i < (review.rating || 5) ? "text-black" : "text-[#E5E5E5]"}
                          />
                        ))}
                      </div>

                      <p className="text-xs leading-relaxed text-[#737373] whitespace-pre-line pt-1">
                        {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Review Form */}
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 h-fit space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                Write a Review
              </h3>

              <form onSubmit={submit} className="space-y-4 text-xs">
                <label className="block space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-black">
                    Rating
                  </span>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="field text-xs bg-white text-black border-[#E5E5E5] focus:border-black"
                  >
                    <option value="5">★★★★★ — 5 (Museum Quality)</option>
                    <option value="4">★★★★☆ — 4 (Excellent)</option>
                    <option value="3">★★★☆☆ — 3 (Satisfactory)</option>
                    <option value="2">★★☆☆☆ — 2 (Below Standard)</option>
                    <option value="1">★☆☆☆☆ — 1 (Poor)</option>
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-black">
                    Your Review
                  </span>
                  <textarea
                    required
                    maxLength={1000}
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="field text-xs resize-y border-[#E5E5E5] bg-white text-black focus:border-black"
                    placeholder="Describe detail, authenticity, packaging, and display quality..."
                  />
                  <span className="block text-[10px] text-[#737373]">
                    Maximum 1,000 characters.
                  </span>
                </label>

                <Button disabled={submitting || !comment.trim()} className="w-full">
                  {submitting ? "Submitting…" : "Publish Review"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
    </section>
  );
}

/* =========================================================================
   5. CART PAGE
   ========================================================================= */
export function CartPage() {
  const { cart, updateQuantity, removeFromCart, user } = useContext(StoreContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Page
      eyebrow="Bag"
      title="Shopping Cart"
      subtitle="Review your selected anime figures and merchandise before proceeding to checkout."
    >
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-[#E5E5E5] bg-[#FAFAFA] p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center border border-black bg-white text-black">
            <ShoppingBag size={24} strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-black">
            Your shopping cart is empty
          </h2>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#737373]">
            Discover official Japanese figurines, exclusive releases, and collection pieces.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 border border-black bg-black px-7 py-3.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
          >
            <span>Explore The Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Items List */}
          <div className="border border-[#E5E5E5] bg-white divide-y divide-[#E5E5E5]">
            {cart.map((item) => (
              <div key={item.variantId} className="flex gap-5 p-5 sm:p-6">
                <img
                  src={item.image || ANTEIKU_FALLBACK_IMAGE}
                  alt=""
                  className="h-28 w-24 shrink-0 border border-[#E5E5E5] bg-[#FAFAFA] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
                  }}
                />

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-sm font-bold text-black hover:underline transition-colors"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-[#737373] hover:text-black transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.variantName && (
                      <p className="text-xs text-[#737373] mt-1 font-medium">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-xs font-bold text-black mt-1">
                      {money(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-[#E5E5E5] bg-white">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-2.5 py-1 text-[#737373] hover:text-black transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold tabular-nums text-black">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-2.5 py-1 text-[#737373] hover:text-black transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-black">
                      {money(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <aside className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 h-fit space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-[#E5E5E5] pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>Items Subtotal</span>
                <span className="font-bold text-black">{money(total)}</span>
              </div>
              <div className="flex justify-between text-[#737373]">
                <span>Shipping & Insurance</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black border-t border-[#E5E5E5] pt-3">
                <span>Subtotal</span>
                <span className="font-extrabold">{money(total)}</span>
              </div>
            </div>

            <Button
              onClick={() =>
                navigate(user ? "/checkout" : "/login?returnTo=/checkout", {
                  state: { notice: "Sign in or create an account to continue to checkout." },
                })
              }
              className="w-full"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </Button>

            {!user && (
              <p className="text-[11px] leading-relaxed text-[#737373] text-center">
                You can browse as a guest. An account is required to complete dispatch and track your order.
              </p>
            )}
          </aside>
        </div>
      )}
    </Page>
  );
}

/* =========================================================================
   6. AUTHENTICATION PAGES (Login & Register)
   ========================================================================= */
function AuthPage({ register = false }) {
  const { user, signIn, syncCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo") || "/account";

  const [form, setForm] = useState(
    register
      ? {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          status: "ACTIVE",
        }
      : { email: "", password: "" }
  );

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={returnTo} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (register) await authApi.register(form);
      await signIn({ email: form.email, password: form.password });
      await syncCart().catch(() => {});
      navigate(returnTo, { replace: true });
    } catch (e) {
      setError(messageFrom(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:py-24 bg-white text-black">
      <div className="border border-[#E5E5E5] bg-white p-8 sm:p-10 shadow-sm">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#737373]">
            Anteiku Member Access
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            {register ? "Create Account" : "Sign In"}
          </h1>
        </div>

        {location.state?.notice && <Notice type="info">{location.state.notice}</Notice>}

        <form onSubmit={submit} className="mt-8 space-y-4 text-xs">
          {register && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                value={form.firstName}
                onChange={(v) => setForm({ ...form, firstName: v })}
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(v) => setForm({ ...form, lastName: v })}
              />
              <Input
                label="Username"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
              />
              <Input
                label="Phone number"
                value={form.phoneNumber}
                onChange={(v) => setForm({ ...form, phoneNumber: v })}
              />
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />

          {register && (
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
            />
          )}

          {error && <Notice>{error}</Notice>}

          <Button disabled={busy} className="mt-4 w-full">
            {busy ? "Authenticating…" : register ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-[#737373]">
          {register ? "Already registered with Anteiku?" : "New to the Archive?"}{" "}
          <Link
            to={`${register ? "/login" : "/register"}?returnTo=${encodeURIComponent(returnTo)}`}
            className="text-black underline font-bold"
          >
            {register ? "Sign In" : "Create Account"}
          </Link>
        </p>
      </div>
    </section>
  );
}

const Input = ({ label, type = "text", value, onChange }) => (
  <label className="block space-y-1.5">
    <span className="font-bold uppercase tracking-wider text-black text-[11px]">
      {label}
    </span>
    <input
      type={type}
      required
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="field text-xs border-[#E5E5E5] bg-white text-black focus:border-black"
    />
  </label>
);

export const LoginPage = () => <AuthPage />;
export const RegisterPage = () => <AuthPage register />;

/* =========================================================================
   7. CHECKOUT PAGE
   ========================================================================= */
const countries = [
  "Cambodia",
  "Australia",
  "Canada",
  "China",
  "France",
  "Germany",
  "Japan",
  "Singapore",
  "South Korea",
  "Thailand",
  "United Kingdom",
  "United States",
  "Vietnam",
];

const checkoutPaymentOptions = [
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", available: true },
  { value: "CREDIT_CARD", label: "Credit / Debit Card", available: false },
  { value: "PAYPAL", label: "PayPal", available: false },
  { value: "ABA", label: "ABA PayWay", available: false },
  { value: "ACLEDA", label: "ACLEDA", available: false },
  { value: "KHQR", label: "KHQR / Bakong", available: true },
];

const emptyShippingAddress = () => ({
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
});

const shippingFromAddress = (address) => ({
  street: address.street || "",
  city: address.city || "",
  state: address.state || "",
  postalCode: address.postalCode || "",
  country: address.country || "",
});

const formatShippingAddress = (shipping) =>
  [
    shipping.street.trim(),
    `${shipping.city.trim()}, ${shipping.state.trim()} ${shipping.postalCode.trim()}`,
    shipping.country.trim(),
  ].join("\n");

export function CheckoutPage() {
  const { user, cart, syncCart, syncing, removeFromCart } = useContext(StoreContext);
  const [shipping, setShipping] = useState(emptyShippingAddress);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) return () => { active = false; };
    accountApi
      .addresses()
      .then((result) => {
        if (!active) return;
        const savedAddresses = Array.isArray(result) ? result : [];
        setAddresses(savedAddresses);
        const defaultAddress =
          savedAddresses.find((item) => item.isDefault) || savedAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(String(defaultAddress.id));
          setShipping(shippingFromAddress(defaultAddress));
        }
      })
      .catch((err) => {
        if (active) setAddressError(messageFrom(err));
      })
      .finally(() => {
        if (active) setAddressesLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const selectAddress = (address) => {
    setSelectedAddressId(String(address.id));
    setShipping(shippingFromAddress(address));
    setFieldErrors({});
  };

  const updateShipping = (key, value) => {
    setShipping((current) => ({ ...current, [key]: value }));
    setSelectedAddressId("");
    if (fieldErrors[key]) setFieldErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!shipping.street.trim()) nextErrors.street = "Street address is required.";
    if (!shipping.city.trim()) nextErrors.city = "City is required.";
    if (!shipping.state.trim()) nextErrors.state = "State / Province is required.";
    if (!shipping.postalCode.trim()) nextErrors.postalCode = "Postal code is required.";
    if (!shipping.country.trim()) nextErrors.country = "Country selection is required.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code || couponBusy || busy) return;
    setCouponBusy(true);
    setCouponFeedback(null);
    try {
      const coupon = await accountApi.couponByCode(code);
      if (!coupon || !coupon.id) throw new Error("Coupon response did not confirm a valid coupon.");
      if (coupon.active === false) throw new Error(`Coupon ${coupon.code || code} is inactive.`);
      if (coupon.expirationDate && new Date(coupon.expirationDate).getTime() < Date.now()) {
        throw new Error(`Coupon ${coupon.code || code} expired.`);
      }
      if (coupon.minimumOrderAmount != null && total < Number(coupon.minimumOrderAmount)) {
        throw new Error(
          `Coupon requires a minimum order of ${money(coupon.minimumOrderAmount)}. Current total is ${money(total)}.`
        );
      }
      setAppliedCoupon(coupon);
      setCouponFeedback({ type: "info", message: `Coupon applied: ${coupon.code || code}.` });
    } catch (err) {
      setCouponFeedback({ type: "error", message: messageFrom(err) });
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponFeedback(null);
  };

  const submit = async (event) => {
  event.preventDefault();

  if (!validate() || busy || syncing || couponBusy) return;

  setBusy(true);
  setError("");

  try {
    const orderItems = cart.map((item) => ({
      productVariantId: item.variantId,
      quantity: item.quantity,
    }));

    const payload = {
  shippingAddress: formatShippingAddress(shipping),
  orderItems: cart.map((item) => ({
    productVariantId: Number(item.variantId),
    quantity: Number(item.quantity),
  })),
};

const created = await accountApi.createOrder(payload);

    if (paymentMethod === "KHQR") {
      const payment = await accountApi.createPayment({
        paymentMethod: "KHQR",
        amount: created.totalAmount,
        orderId: created.id,
      });

      setDone({
        ...created,
        payment,
      });
    } else {
      setDone(created);
    }

    cart.forEach((item) => removeFromCart(item.variantId));
  } catch (err) {
    setError(messageFrom(err));
  } finally {
    setBusy(false);
  }
};

  const field = (name, label, props = {}) => (
    <label className="block space-y-1.5 text-xs font-bold" htmlFor={`shipping-${name}`}>
      <span className="uppercase tracking-wider text-black text-[11px]">{label}</span>
      <input
        id={`shipping-${name}`}
        name={name}
        value={shipping[name]}
        onChange={(event) => updateShipping(name, event.target.value)}
        aria-invalid={Boolean(fieldErrors[name])}
        className={`field text-xs border-[#E5E5E5] bg-white text-black focus:border-black ${fieldErrors[name] ? "field-error" : ""}`}
        {...props}
      />
      {fieldErrors[name] && (
        <span className="block text-[11px] text-red-600 font-normal">
          {fieldErrors[name]}
        </span>
      )}
    </label>
  );

  if (done) {
    return (
      <Page eyebrow="Confirmation" title="Order Confirmed">
        <div className="border border-[#E5E5E5] bg-white p-6 sm:p-10 max-w-3xl space-y-6">
          <div className="flex items-start gap-4 border-b border-[#E5E5E5] pb-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-black bg-black text-white">
              <Check size={24} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-black">
                Order Placed Successfully
              </h2>
              <p className="mt-1 text-xs text-[#737373] font-mono">
                {done.orderNumber != null ? `Order Reference: #${done.orderNumber}` : `Record ID: ${done.id}`}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">
              Purchased Items
            </h3>
            <OrderItems items={done.orderItems} />
          </div>

          <dl className="space-y-2 border-t border-[#E5E5E5] py-4 text-xs">
            {[
              ["Subtotal", done.subTotal],
              ["Shipping Fee", done.shippingFee],
              ["Discount Applied", done.discountAmount],
            ].map(
              ([lbl, amt]) =>
                amt != null && (
                  <div key={lbl} className="flex justify-between text-[#737373]">
                    <span>{lbl}</span>
                    <span className="text-black font-semibold">{money(amt)}</span>
                  </div>
                )
            )}
          </dl>

          <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-4 text-sm font-bold text-black">
            <span>Order Total</span>
            <span className="text-black font-extrabold">{money(done.totalAmount)}</span>
          </div>

          {done.payment?.qrCode && (
            <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black">
                  Complete Your Payment
                </h3>
                <p className="mt-2 text-xs text-[#737373]">
                  Scan this KHQR code using Bakong or a supported banking app.
                </p>
              </div>

              <div className="flex justify-center border border-[#E5E5E5] bg-white p-5">
                <QRCodeSVG
                  value={done.payment.qrCode}
                  size={240}
                  level="M"
                  includeMargin
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-[#737373]">Amount to Pay</p>
                <p className="text-2xl font-extrabold text-black">
                  {new Intl.NumberFormat("en-US", {
                    maximumFractionDigits: 0,
                  }).format(Number(done.payment.amount ?? 0))} ៛
                </p>

                <p className="text-xs font-semibold text-black">
                  Payment Status: {done.payment.status ?? "PENDING"}
                </p>

                {done.payment.expiresAt && (
                  <p className="text-xs text-[#737373]">
                    QR expires: {new Date(done.payment.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Page>
    );
  }

  if (!cart.length) return <Navigate to="/cart" replace />;

  return (
    <Page
      eyebrow="Checkout"
      title="Complete Order"
      subtitle="Enter your shipping address and complete your order."
    >
      {error && <Notice>{error}</Notice>}

      <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Shipping Address */}
          <fieldset className="border border-[#E5E5E5] bg-white p-6 space-y-5">
            <legend className="text-sm font-bold uppercase tracking-wider text-black px-2">
              Shipping Address
            </legend>

            {addressesLoading ? (
              <p className="text-xs text-[#737373]">Loading saved addresses…</p>
            ) : addresses.length ? (
              <div className="space-y-2 border-b border-[#E5E5E5] pb-4">
                <span className="block text-xs font-bold uppercase tracking-wider text-black">
                  Select Saved Address
                </span>
                <div className="grid gap-2">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block cursor-pointer border p-3 text-xs transition-colors ${
                        String(address.id) === selectedAddressId
                          ? "border-black bg-[#FAFAFA] text-black font-semibold"
                          : "border-[#E5E5E5] hover:border-black text-[#737373]"
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="saved-address"
                          checked={String(address.id) === selectedAddressId}
                          onChange={() => selectAddress(address)}
                          className="mt-0.5 accent-black"
                        />
                        <span>
                          {address.street} · {address.city}, {address.state} {address.postalCode} · {address.country}
                          {address.isDefault && (
                            <span className="ml-2 inline-block text-[10px] font-bold text-black uppercase">
                              [Default]
                            </span>
                          )}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {addressError && (
              <p className="text-xs text-red-600">
                Saved addresses could not be loaded. Enter shipping destination below.
              </p>
            )}

            {field("street", "Street Address", {
              autoComplete: "street-address",
              placeholder: "Street number, avenue, suite, or building name",
            })}

            <div className="grid gap-4 sm:grid-cols-2">
              {field("city", "City", { autoComplete: "address-level2" })}
              {field("state", "State / Province", { autoComplete: "address-level1" })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {field("postalCode", "Postal Code", { autoComplete: "postal-code" })}
              <label className="block space-y-1.5 text-xs font-bold">
                <span className="uppercase tracking-wider text-black text-[11px]">Country</span>
                <select
                  id="shipping-country"
                  name="country"
                  value={shipping.country}
                  onChange={(event) => updateShipping("country", event.target.value)}
                  className={`field text-xs bg-white text-black border-[#E5E5E5] focus:border-black ${fieldErrors.country ? "field-error" : ""}`}
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {fieldErrors.country && (
                  <span className="block text-[11px] text-red-600 font-normal">
                    {fieldErrors.country}
                  </span>
                )}
              </label>
            </div>
          </fieldset>

          {/* Payment Method */}
          <fieldset className="border border-[#E5E5E5] bg-white p-6 space-y-4">
            <legend className="text-sm font-bold uppercase tracking-wider text-black px-2">
              Payment Method
            </legend>

            <div className="space-y-2">
              {checkoutPaymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 border p-4 text-xs transition-colors ${
                    opt.available
                      ? "cursor-pointer border-[#E5E5E5] bg-white text-black hover:border-black"
                      : "cursor-not-allowed border-[#E5E5E5] opacity-40 text-[#737373]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    disabled={!opt.available || busy || syncing}
                    onChange={() => opt.available && setPaymentMethod(opt.value)}
                    className="mt-0.5 accent-black"
                  />
                  <div className="flex-1 flex justify-between">
                    <span className="font-bold text-black">{opt.label}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#737373]">
                      {opt.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <p className="text-xs text-[#737373] leading-relaxed">
              Anteiku adheres to secure collector order processing. Cash on Delivery is currently selected for your region.
            </p>
          </fieldset>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="border border-[#E5E5E5] bg-[#FAFAFA] p-6 h-fit space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-[#E5E5E5] pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 divide-y divide-[#E5E5E5] text-xs">
            {cart.map((item) => (
              <div key={item.variantId} className="flex justify-between pt-2">
                <span className="text-black font-medium">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-bold text-black">
                  {money(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="border-t border-[#E5E5E5] pt-4 space-y-2">
            <label htmlFor="coupon-code-checkout" className="block text-[11px] font-bold uppercase tracking-wider text-black">
              Discount Code / Coupon
            </label>
            <div className="flex gap-2">
              <input
                id="coupon-code-checkout"
                value={couponCode}
                disabled={Boolean(appliedCoupon) || couponBusy || busy}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponFeedback(null);
                }}
                placeholder="Enter coupon code"
                className="field text-xs flex-1 border-[#E5E5E5] bg-white text-black focus:border-black"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="border border-black px-3 text-xs font-bold text-black hover:bg-black hover:text-white transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={!couponCode.trim() || couponBusy || busy}
                  className="border border-black bg-black px-4 text-xs font-bold uppercase text-white hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                >
                  {couponBusy ? "Checking…" : "Apply"}
                </button>
              )}
            </div>

            {couponFeedback && (
              <p
                className={`text-xs font-semibold ${
                  couponFeedback.type === "error" ? "text-red-600" : "text-black"
                }`}
              >
                {couponFeedback.message}
              </p>
            )}
          </div>

          <div className="border-t border-[#E5E5E5] pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-[#737373]">
              <span>Items Total</span>
              <span className="font-bold text-black">{money(total)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-black font-semibold">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>Applied</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-[#E5E5E5]">
              <span>Total Due</span>
              <span className="font-extrabold">{money(total)}</span>
            </div>
          </div>

          <Button disabled={busy || syncing || couponBusy} className="w-full">
            {busy || syncing ? "Processing Order…" : "Place Order"}
          </Button>
        </aside>
      </form>
    </Page>
  );
}

/* =========================================================================
   8. SERIES & DISCOVER PAGES
   ========================================================================= */
export function SeriesPage() {
  const [series, setSeries] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    catalogueApi
      .allProducts()
      .then((products) => {
        const unique = new Map();
        products.forEach((product) => {
          if (product.seriesId != null && product.seriesName) {
            const key = String(product.seriesId);
            const entry = unique.get(key) || { id: product.seriesId, name: product.seriesName, count: 0 };
            entry.count += 1;
            unique.set(key, entry);
          }
        });
        if (active) setSeries([...unique.values()].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch((err) => {
        if (active) setError(messageFrom(err));
      })
      .finally(() => {
        if (active) setSeries((current) => current || []);
      });
    return () => { active = false; };
  }, []);

  if (error) {
    return (
      <Page eyebrow="Discover" title="Anime Series Archive">
        <Notice>{error}</Notice>
      </Page>
    );
  }
  if (!series) return <Loading />;

  return (
    <Page
      eyebrow="Index"
      title="Anime Series"
      subtitle="Browse official collectables indexed across legendary Japanese animation titles."
    >
      {series.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((item) => (
            <Link
              key={item.id}
              to={`/series/${item.id}`}
              state={{ seriesName: item.name }}
              className="group border border-[#E5E5E5] bg-[#FAFAFA] p-6 transition-all hover:border-black hover:bg-white"
            >
              <span className="text-[10px] font-mono tracking-widest text-[#737373]">
                SERIES RECORD #{item.id}
              </span>
              <h2 className="mt-2 text-lg font-bold text-black transition-colors">
                {item.name}
              </h2>
              <p className="mt-3 text-xs font-semibold text-[#737373]">
                {item.count} {item.count === 1 ? "product piece" : "product pieces"}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black group-hover:translate-x-1 transition-transform">
                <span>View Products</span>
                <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="border border-[#E5E5E5] bg-[#FAFAFA] p-12 text-center text-xs text-[#737373]">
          No series records are currently listed in the catalogue.
        </p>
      )}
    </Page>
  );
}

export function SeriesDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useContext(StoreContext);
  const [state, setState] = useState({
    loading: true,
    products: [],
    name: location.state?.seriesName || "",
    error: "",
  });

  useEffect(() => {
    let active = true;
    catalogueApi
      .productsForSeries(id)
      .then(async (products) => {
        let name =
          products.find((product) => product.seriesName)?.seriesName ||
          location.state?.seriesName ||
          "";
        if (!name) {
          const catalogue = await catalogueApi.allProducts();
          name = catalogue.find((product) => String(product.seriesId) === String(id))?.seriesName || "";
        }
        if (active) setState({ loading: false, products, name, error: "" });
      })
      .catch((err) => {
        if (active)
          setState({
            loading: false,
            products: [],
            name: location.state?.seriesName || "",
            error: messageFrom(err),
          });
      });
    return () => { active = false; };
  }, [id, location.state?.seriesName]);

  if (state.loading) return <Loading />;
  if (state.error) {
    return (
      <Page eyebrow="Series" title={state.name || "Series Details"}>
        <Notice>{state.error}</Notice>
        <Link to="/series" className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-black hover:underline">
          ← Back to series index
        </Link>
      </Page>
    );
  }

  return (
    <Page
      eyebrow="Series Showcase"
      title={state.name || "Series Details"}
      subtitle={`Displaying all verified pieces registered under ${state.name}.`}
      actions={
        <Link
          to="/series"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:underline"
        >
          <span>← All Series</span>
        </Link>
      }
    >
      {state.products.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {state.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={(item, variant) => addToCart(toCartItem(item, variant))}
            />
          ))}
        </div>
      ) : (
        <p className="border border-[#E5E5E5] bg-[#FAFAFA] p-12 text-center text-xs text-[#737373]">
          No products are currently listed for this series.
        </p>
      )}
    </Page>
  );
}

export function BrowsePage({ type }) {
  const { categories, brands, loading, error } = useCatalogue();
  const navigate = useNavigate();

  if (loading) return <Loading />;

  const items = type === "categories" ? categories : brands;
  const label = type === "categories" ? "Categories" : "Brands & Studios";

  return (
    <Page
      eyebrow="Index"
      title={label}
      subtitle={`Explore Anteiku's comprehensive catalog of ${label.toLowerCase()}.`}
    >
      {error && <Notice>{error}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() =>
              navigate(`/shop?${type === "categories" ? "category" : "brand"}=${item.id}`)
            }
            className="group border border-[#E5E5E5] bg-[#FAFAFA] p-6 text-left transition-all hover:border-black hover:bg-white cursor-pointer"
          >
            <p className="text-lg font-bold text-black transition-colors">
              {item.name}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[#737373] line-clamp-2">
              {item.description || `Shop authentic items from ${item.name}.`}
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black group-hover:translate-x-1 transition-transform">
              <span>Explore Collection →</span>
            </span>
          </button>
        ))}
      </div>

      {!items.length && (
        <p className="border border-[#E5E5E5] bg-[#FAFAFA] p-12 text-center text-xs text-[#737373]">
          No {label.toLowerCase()} are currently listed.
        </p>
      )}
    </Page>
  );
}

/* =========================================================================
   9. ORDERS PAGES
   ========================================================================= */
const orderDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Date unavailable";

const OrderStatus = ({ status }) => (
  <span className="inline-flex border border-black bg-black text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
    {status ? status.replaceAll("_", " ") : "Status unavailable"}
  </span>
);

const OrderItems = ({ items }) =>
  items?.length ? (
    <div className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] bg-white mt-4">
      {items.map((item, index) => (
        <div key={item.id ?? index} className="flex items-center gap-4 p-4">
          <img
            src={item.productImageUrl || ANTEIKU_FALLBACK_IMAGE}
            alt={item.productName || ""}
            onError={(e) => {
              e.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
            }}
            className="h-16 w-14 shrink-0 border border-[#E5E5E5] bg-[#FAFAFA] object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-black truncate">
              {item.productName || "Product information unavailable"}
            </p>
            {(item.variantName || item.variantSku) && (
              <p className="text-xs text-[#737373] mt-0.5">
                {item.variantName || item.variantSku}
              </p>
            )}
            <p className="text-xs text-[#737373] mt-0.5">
              Qty: {item.quantity ?? 1} · {item.unitPrice != null && money(item.unitPrice)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xs font-bold text-black font-mono">
              {item.subTotal != null ? money(item.subTotal) : "—"}
            </span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-xs text-[#737373]">No items listed in this order record.</p>
  );

export function OrdersPage() {
  const { user } = useContext(StoreContext);
  const location = useLocation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      accountApi.orders().then(setOrders).catch((err) => setError(messageFrom(err)));
    }
  }, [user]);

  if (!user) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
        state={{ notice: "Sign in to view your orders." }}
      />
    );
  }

  if (error) {
    return (
      <Page eyebrow="Account" title="Order History">
        <Notice>{error}</Notice>
      </Page>
    );
  }
  if (!orders) return <Loading />;

  return (
    <Page
      eyebrow="Account"
      title="Order History"
      subtitle="Track your confirmed dispatches and previous acquisitions."
      actions={
        <Link
          to="/shop"
          className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
        >
          Explore Collection →
        </Link>
      }
    >
      {orders.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border border-[#E5E5E5] bg-white p-5 sm:p-6 transition-colors hover:border-black"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#737373] font-semibold">
                    Placed {orderDate(order.orderDate)}
                  </span>
                  <h2 className="text-base font-bold text-black mt-1">
                    {order.orderNumber != null ? `Order #${order.orderNumber}` : `Record #${order.id}`}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <OrderStatus status={order.status} />
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#737373] block font-semibold">
                      Total
                    </span>
                    <span className="text-sm font-bold text-black">
                      {order.totalAmount != null ? money(order.totalAmount) : "—"}
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="border border-[#E5E5E5] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:border-black transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border border-[#E5E5E5] bg-[#FAFAFA] p-16 text-center">
          <p className="text-base font-bold text-black">
            No order records found
          </p>
          <p className="mt-1 text-xs text-[#737373]">
            Orders placed with your account will appear here.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 border border-black bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
          >
            <span>Explore Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </Page>
  );
}

export function OrderPage() {
  const { id } = useParams();
  const { user } = useContext(StoreContext);
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (user) {
      accountApi
        .order(id)
        .then((loaded) => {
          if (active) setOrder(loaded);
        })
        .catch((err) => {
          if (active) setError(messageFrom(err));
        });
    }
    return () => { active = false; };
  }, [id, user]);

  if (!user) {
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
        state={{ notice: "Sign in to view this order." }}
      />
    );
  }

  if (error) {
    return (
      <Page eyebrow="Account" title="Order Record Error">
        <Notice>{error}</Notice>
        <Link to="/orders" className="text-xs uppercase tracking-wider text-black underline font-bold">
          ← Back to Orders
        </Link>
      </Page>
    );
  }

  if (!order || String(order.id) !== String(id)) return <Loading />;

  return (
    <Page
      eyebrow="Order Record"
      title={order.orderNumber != null ? `Order #${order.orderNumber}` : "Order Details"}
      subtitle={`Placed on ${orderDate(order.orderDate)}`}
      actions={
        <Link
          to="/orders"
          className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
        >
          ← Back to Orders
        </Link>
      }
    >
      <div className="border border-[#E5E5E5] bg-white p-6 sm:p-8 max-w-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
          <span className="text-xs font-mono text-[#737373]">
            Record ID: {order.id}
          </span>
          <OrderStatus status={order.status} />
        </div>

        <div>
          <h3 className="text-sm font-bold text-black uppercase tracking-wider">
            Purchased Items
          </h3>
          <OrderItems items={order.orderItems} />
        </div>

        <div className="border-t border-[#E5E5E5] pt-4 space-y-1.5 text-xs">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider pb-1">
            Shipping Destination
          </h3>
          <p className="whitespace-pre-line text-[#737373] leading-relaxed">
            {order.shippingAddress || "Shipping coordinates not provided."}
          </p>
        </div>

        <div className="border-t border-[#E5E5E5] pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-[#737373]">
            <span>Subtotal</span>
            <span className="font-bold text-black">{money(order.subTotal)}</span>
          </div>
          {order.shippingFee != null && (
            <div className="flex justify-between text-[#737373]">
              <span>Shipping Fee</span>
              <span className="font-bold text-black">{money(order.shippingFee)}</span>
            </div>
          )}
          {order.discountAmount != null && (
            <div className="flex justify-between text-black font-semibold">
              <span>Discount</span>
              <span>-{money(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-[#E5E5E5]">
            <span>Total Amount</span>
            <span className="font-extrabold">{money(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </Page>
  );
}

/* =========================================================================
   10. ACCOUNT & WISHLIST FALLBACK EXPORTS
   ========================================================================= */
export function AccountPage() {
  const { user } = useContext(StoreContext);
  if (!user) return <Navigate to="/login?returnTo=/account" replace />;
  return <Navigate to="/account" replace />;
}

export function WishlistPage() {
  const { user } = useContext(StoreContext);
  if (!user) return <Navigate to="/login?returnTo=/wishlist" replace />;
  return <Navigate to="/wishlist" replace />;
}
