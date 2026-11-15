/* eslint-disable react-refresh/only-export-components */
import { Check, Eye, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { money } from "./Layout";
import { StoreContext } from "../context/StoreContext";

export const ANTEIKU_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 750' width='600' height='750'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230a0a0c'/%3E%3Cstop offset='100%25' stop-color='%23141418'/%3E%3C/linearGradient%3E%3ClinearGradient id='gold' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23dfc79b'/%3E%3Cstop offset='100%25' stop-color='%23c5a880'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Crect x='30' y='30' width='540' height='690' fill='none' stroke='%2327272a' stroke-width='1'/%3E%3Crect x='38' y='38' width='524' height='674' fill='none' stroke='url(%23gold)' stroke-width='0.75' stroke-opacity='0.35'/%3E%3Cg transform='translate(300, 345)' text-anchor='middle'%3E%3Ccircle cx='0' cy='-20' r='52' fill='none' stroke='url(%23gold)' stroke-width='1.2' stroke-dasharray='4,4'/%3E%3Cpolygon points='0,-60 36,-10 0,40 -36,-10' fill='none' stroke='url(%23gold)' stroke-width='1.2'/%3E%3Ctext y='-10' font-family='serif' font-size='34' font-weight='600' fill='url(%23gold)' letter-spacing='0.1em'%3EA%3C/text%3E%3Ctext y='82' font-family='serif' font-size='19' font-weight='500' fill='%23fafafa' letter-spacing='0.32em'%3EANTEIKU%3C/text%3E%3Ctext y='110' font-family='sans-serif' font-size='9' font-weight='500' fill='%23a1a1aa' letter-spacing='0.28em'%3EARCHIVE PIECE%3C/text%3E%3C/g%3E%3C/svg%3E";

export const imageOf = (product) => {
  const images = product?.productImages;
  if (!images || !images.length) return ANTEIKU_FALLBACK_IMAGE;
  const sorted = [...images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  return sorted[0]?.imageUrl || ANTEIKU_FALLBACK_IMAGE;
};

export function ProductStatusBadge({ status, isNew, isLimited }) {
  if (status === "INACTIVE" || status === "UNAVAILABLE") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] bg-zinc-900/90 text-zinc-400 border border-zinc-700/60 backdrop-blur-sm">
        Archived
      </span>
    );
  }
  if (status === "OUT_OF_STOCK") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] bg-red-950/80 text-red-300 border border-red-800/60 backdrop-blur-sm">
        Out of Stock
      </span>
    );
  }
  if (isLimited) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] bg-[#1a1712]/90 text-[#dfc79b] border border-[#c5a880]/40 backdrop-blur-sm shadow-[0_0_8px_rgba(197,168,128,0.15)]">
        Limited Edition
      </span>
    );
  }
  if (isNew) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 backdrop-blur-sm">
        New Arrival
      </span>
    );
  }
  return null;
}

export function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col">
      <div className="skeleton-shimmer aspect-[4/5] w-full border border-zinc-800/80 bg-zinc-900/60" />
      <div className="pt-3.5 space-y-2">
        <div className="skeleton-shimmer h-3 w-20 bg-zinc-800/60" />
        <div className="skeleton-shimmer h-4 w-4/5 bg-zinc-800/60" />
        <div className="skeleton-shimmer h-4 w-16 bg-zinc-800/60" />
        <div className="skeleton-shimmer h-9 w-full bg-zinc-800/60 mt-3" />
      </div>
    </div>
  );
}

export function ProductCard({ product, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const { user, wishlists, isWishlisted, addWishlistProduct, removeWishlistProduct, openQuickView, showToast } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const variants = product.productVariants || [];
  const variant = variants.length === 1 ? variants[0] : null;
  const unavailable = product.status !== "ACTIVE" || variants.length === 0;
  const needsOptions = !unavailable && variants.length > 1;
  const wished = isWishlisted(product.id);

  // Derive badges
  const isLimited = product.name?.toLowerCase().includes("limited") || product.name?.toLowerCase().includes("exclusive") || Number(product.id) % 5 === 0;
  const isNew = Number(product.id) % 3 === 0;

  const toggleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, { state: { notice: "Sign in to save products to your wishlist." } });
      return;
    }
    if (wishBusy) return;
    setWishBusy(true);
    setWishMessage("");
    try {
      if (wished) {
        const list = wishlists?.find((entry) => (entry.productIds || []).some((id) => String(id) === String(product.id)));
        if (!list) throw new Error("Your wishlist is still loading. Please try again shortly.");
        await removeWishlistProduct(list.id, product.id);
        const msg = "Removed from your wishlist.";
        setWishMessage(msg);
        showToast(product.name, "info", "Removed from Wishlist");
      } else {
        const result = await addWishlistProduct(product.id);
        const msg = result.alreadySaved ? "Already in your wishlist." : "Saved to your wishlist.";
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
    <article className="group relative flex flex-col transition-all duration-300">
      {/* 4:5 Product Image Box */}
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-950 transition-colors duration-300 group-hover:border-zinc-400 dark:group-hover:border-[#c5a880]/50">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={imageOf(product)}
            alt={product.productImages?.[0]?.altText || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
          className={`absolute top-2.5 right-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 disabled:opacity-50 ${
            wished
              ? "bg-[#c5a880]/20 text-[#dfc79b] border border-[#c5a880]/60 shadow-[0_0_12px_rgba(197,168,128,0.25)]"
              : "bg-black/40 text-zinc-300 border border-white/10 hover:bg-black/70 hover:text-white hover:border-[#c5a880]/50"
          }`}
        >
          <Heart size={16} fill={wished ? "currentColor" : "none"} strokeWidth={wished ? 2 : 1.75} />
        </button>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-x-2.5 bottom-2.5 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
          <button
            type="button"
            onClick={handleQuickView}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] bg-zinc-950/90 hover:bg-black text-zinc-100 border border-zinc-700/80 hover:border-[#c5a880] backdrop-blur-md shadow-lg transition-colors"
          >
            <Eye size={13} className="text-[#c5a880]" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Details & Information Hierarchy */}
      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c5a880] dark:text-[#dfc79b]">
            {product.brandName || product.categoryName || "ANTEIKU ARCHIVE"}
          </p>
          {product.seriesName && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest truncate max-w-[110px]">
              {product.seriesName}
            </span>
          )}
        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-1.5 block font-serif text-sm font-medium leading-snug tracking-normal text-zinc-900 transition-colors duration-200 group-hover:text-[#c5a880] dark:text-zinc-100 dark:group-hover:text-[#dfc79b] line-clamp-2"
        >
          {product.name}
        </Link>

        {wishMessage && (
          <p aria-live="polite" className="mt-1 text-[11px] text-[#c5a880]">
            {wishMessage}
          </p>
        )}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-sans text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {money(variant?.price ?? product.price)}
          </span>
          {variant?.stockQuantity != null && variant.stockQuantity > 0 && variant.stockQuantity <= 3 && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              Only {variant.stockQuantity} left
            </span>
          )}
        </div>

        {/* Action Bottom Section */}
        <div className="mt-auto pt-3">
          {unavailable ? (
            <div className="flex h-10 items-center justify-center border border-zinc-200 bg-zinc-100/50 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-500">
              Unavailable
            </div>
          ) : needsOptions ? (
            <Link
              to={`/product/${product.id}`}
              className="flex h-10 w-full items-center justify-center gap-1.5 border border-zinc-300 bg-transparent text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-800 transition-all duration-200 hover:border-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-[#c5a880] dark:hover:text-[#dfc79b] dark:hover:bg-zinc-900"
            >
              Choose Options
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              {/* Stepper */}
              <div className="flex h-10 items-center border border-zinc-300 bg-transparent dark:border-zinc-800 dark:bg-zinc-900/60">
                <button
                  type="button"
                  aria-label={`Decrease ${product.name} quantity`}
                  disabled={quantity === 1}
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  className="px-2.5 h-full flex items-center justify-center text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span
                  aria-live="polite"
                  className="w-7 text-center font-sans text-xs font-medium tabular-nums text-zinc-800 dark:text-zinc-200"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${product.name} quantity`}
                  onClick={() => setQuantity((v) => v + 1)}
                  className="px-2.5 h-full flex items-center justify-center text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={add}
                className={`relative flex h-10 flex-1 items-center justify-center gap-1.5 border text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                  added
                    ? "border-[#c5a880] bg-[#c5a880]/15 text-[#dfc79b]"
                    : "border-black bg-black text-white hover:bg-zinc-800 hover:border-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-[#c5a880] dark:hover:bg-zinc-800"
                }`}
              >
                {added ? (
                  <>
                    <Check size={14} className="text-[#dfc79b]" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={13} className="opacity-80" />
                    <span>Add to Bag</span>
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
