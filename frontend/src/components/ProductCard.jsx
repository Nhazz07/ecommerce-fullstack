/* eslint-disable react-refresh/only-export-components */
import { Check, Eye, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { money } from "./Layout";
import { StoreContext } from "../context/StoreContext";

export const ANTEIKU_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 750' width='600' height='750'%3E%3Crect width='100%25' height='100%25' fill='%23f4f4f5'/%3E%3Crect x='24' y='24' width='552' height='702' fill='none' stroke='%23d4d4d8' stroke-width='1'/%3E%3Cg transform='translate(300, 375)' text-anchor='middle'%3E%3Ccircle cx='0' cy='-30' r='48' fill='none' stroke='%2309090b' stroke-width='1.5' stroke-dasharray='4,4'/%3E%3Cpolygon points='0,-68 32,-20 0,28 -32,-20' fill='none' stroke='%2309090b' stroke-width='1.5'/%3E%3Ctext y='-20' font-family='sans-serif' font-size='28' font-weight='700' fill='%2309090b' letter-spacing='0.1em'%3EA%3C/text%3E%3Ctext y='65' font-family='sans-serif' font-size='16' font-weight='700' fill='%2309090b' letter-spacing='0.25em'%3EANTEIKU%3C/text%3E%3Ctext y='90' font-family='sans-serif' font-size='9' font-weight='600' fill='%2371717a' letter-spacing='0.2em'%3ETOKYO ARCHIVE%3C/text%3E%3C/g%3E%3C/svg%3E";

export const imageOf = (product) => {
  const images = product?.productImages;
  if (!images || !images.length) return ANTEIKU_FALLBACK_IMAGE;
  const sorted = [...images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  return sorted[0]?.imageUrl || ANTEIKU_FALLBACK_IMAGE;
};

export function ProductStatusBadge({ status, isNew, isLimited }) {
  if (status === "INACTIVE" || status === "UNAVAILABLE") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700">
        Archived
      </span>
    );
  }
  if (status === "OUT_OF_STOCK") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        Sold Out
      </span>
    );
  }
  if (isLimited) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] bg-white text-zinc-950 border border-zinc-950 dark:bg-zinc-950 dark:text-white dark:border-white">
        Limited
      </span>
    );
  }
  if (isNew) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        New
      </span>
    );
  }
  return null;
}

export function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col">
      <div className="skeleton-shimmer aspect-[4/5] w-full border border-zinc-200 dark:border-zinc-800" />
      <div className="pt-3.5 space-y-2.5">
        <div className="skeleton-shimmer h-3 w-20" />
        <div className="skeleton-shimmer h-4 w-4/5" />
        <div className="skeleton-shimmer h-4 w-16" />
        <div className="skeleton-shimmer h-10 w-full mt-2" />
      </div>
    </div>
  );
}

export function ProductCard({ product, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const { user, wishlists, isWishlisted, addWishlistProduct, removeWishlistProduct, openQuickView, showToast } =
    useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const variants = product.productVariants || [];
  const variant = variants.length === 1 ? variants[0] : null;
  const unavailable = product.status !== "ACTIVE" || variants.length === 0;
  const needsOptions = !unavailable && variants.length > 1;
  const wished = isWishlisted(product.id);

  const isLimited =
    product.name?.toLowerCase().includes("limited") ||
    product.name?.toLowerCase().includes("exclusive") ||
    Number(product.id) % 5 === 0;
  const isNew = Number(product.id) % 3 === 0;

  const toggleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
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
          (entry.productIds || []).some((id) => String(id) === String(product.id))
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
        showToast(product.name, "success", result.alreadySaved ? "Already Saved" : "Saved to Wishlist");
      }
    } catch (error) {
      const msg = error.message || "Could not update your wishlist. Please try again.";
      setWishMessage(msg);
      showToast(msg, "error", "Wishlist Notice");
    } finally {
      setWishBusy(false);
    }
  };

  const add = (e) => {
    e?.preventDefault();
    if (!variant || unavailable || !onAdd) return;
    onAdd(product, { ...variant, selectedQuantity: quantity });
    setQuantity(1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (openQuickView) {
      openQuickView(product);
    }
  };

  return (
    <article className="group relative flex flex-col">
      {/* 4:5 Product Image Frame */}
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-zinc-200 bg-zinc-50 transition-colors duration-200 group-hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:group-hover:border-zinc-200">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={imageOf(product)}
            alt={product.productImages?.[0]?.altText || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
            }}
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          <ProductStatusBadge
            status={unavailable ? "UNAVAILABLE" : undefined}
            isNew={isNew}
            isLimited={isLimited}
          />
        </div>

        {/* Wishlist Button Overlay */}
        <button
          type="button"
          aria-label={`${wished ? "Remove" : "Save"} ${product.name} ${wished ? "from" : "to"} wishlist`}
          aria-pressed={wished}
          disabled={wishBusy}
          onClick={toggleWish}
          className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center border transition-all duration-150 disabled:opacity-50 ${
            wished
              ? "bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white"
              : "bg-white/95 text-zinc-950 border-zinc-200 hover:border-zinc-950 dark:bg-zinc-950/90 dark:text-white dark:border-zinc-700 dark:hover:border-white"
          }`}
        >
          <Heart size={14} fill={wished ? "currentColor" : "none"} strokeWidth={wished ? 2 : 1.75} />
        </button>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hidden sm:block">
          <button
            type="button"
            onClick={handleQuickView}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 transition-colors"
          >
            <Eye size={13} />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            {product.brandName || product.categoryName || "ANTEIKU ARCHIVE"}
          </p>
          {product.seriesName && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate max-w-[110px]">
              {product.seriesName}
            </span>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-1 block text-sm font-semibold leading-snug tracking-tight text-zinc-950 dark:text-zinc-50 hover:underline underline-offset-4 line-clamp-2"
        >
          {product.name}
        </Link>

        {wishMessage && (
          <p aria-live="polite" className="mt-1 text-[11px] font-medium text-zinc-900 dark:text-zinc-200">
            {wishMessage}
          </p>
        )}

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-tight text-zinc-950 dark:text-white">
            {money(variant?.price ?? product.price)}
          </span>
          {variant?.stockQuantity != null && variant.stockQuantity > 0 && variant.stockQuantity <= 3 && (
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              (Only {variant.stockQuantity} left)
            </span>
          )}
        </div>

        {/* Action Bottom Section */}
        <div className="mt-auto pt-3.5">
          {unavailable ? (
            <div className="flex h-10 items-center justify-center border border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Unavailable
            </div>
          ) : needsOptions ? (
            <Link
              to={`/product/${product.id}`}
              className="flex h-10 w-full items-center justify-center gap-1.5 border border-zinc-950 bg-transparent text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-950 transition-colors hover:bg-zinc-950 hover:text-white dark:border-zinc-200 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              Select Options
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {/* Stepper */}
              <div className="flex h-10 items-center border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <button
                  type="button"
                  aria-label={`Decrease ${product.name} quantity`}
                  disabled={quantity === 1}
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  className="px-2.5 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span
                  aria-live="polite"
                  className="w-7 text-center text-xs font-semibold tabular-nums text-zinc-950 dark:text-white"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${product.name} quantity`}
                  onClick={() => setQuantity((v) => v + 1)}
                  className="px-2.5 h-full flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={add}
                className={`flex h-10 flex-1 items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  added
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950"
                    : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                }`}
              >
                {added ? (
                  <>
                    <Check size={14} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={13} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
