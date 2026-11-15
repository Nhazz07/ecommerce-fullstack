import { ArrowRight, Check, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { money } from "./Layout";
import { ANTEIKU_FALLBACK_IMAGE, imageOf } from "./ProductCard";

export function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToCart } = useContext(StoreContext);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedVariant(quickViewProduct.productVariants?.[0] || null);
      setQuantity(1);
      setActiveImageIndex(0);
      setAdded(false);
    }
  }, [quickViewProduct]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && quickViewProduct) {
        closeQuickView();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const images = quickViewProduct.productImages?.length
    ? quickViewProduct.productImages
    : [{ imageUrl: imageOf(quickViewProduct), altText: quickViewProduct.name }];

  const unavailable = quickViewProduct.status !== "ACTIVE" || (quickViewProduct.productVariants || []).length === 0;

  const handleAdd = () => {
    if (!selectedVariant || unavailable) return;
    addToCart({
      productId: quickViewProduct.id,
      variantId: selectedVariant.id,
      name: quickViewProduct.name,
      variantName: selectedVariant.name,
      price: Number(selectedVariant.price ?? quickViewProduct.price),
      image: imageOf(quickViewProduct),
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Product quick view"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeQuickView}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl">
        <button
          type="button"
          onClick={closeQuickView}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-black transition-colors"
        >
          <X size={18} />
        </button>

        <div className="grid gap-6 md:grid-cols-2 p-6 sm:p-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-[4/5] w-full overflow-hidden border border-zinc-800 bg-zinc-900">
              <img
                src={images[activeImageIndex]?.imageUrl || ANTEIKU_FALLBACK_IMAGE}
                alt={images[activeImageIndex]?.altText || quickViewProduct.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id || i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-14 w-12 shrink-0 overflow-hidden border transition-all ${
                      i === activeImageIndex
                        ? "border-[#c5a880] ring-1 ring-[#c5a880]"
                        : "border-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c5a880]">
                  {quickViewProduct.brandName || quickViewProduct.categoryName || "ANTEIKU ARCHIVE"}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-medium leading-tight text-zinc-100">
                  {quickViewProduct.name}
                </h3>
              </div>

              <div className="text-lg font-semibold text-zinc-100 font-sans">
                {money(selectedVariant?.price ?? quickViewProduct.price)}
              </div>

              {quickViewProduct.description && (
                <p className="text-xs leading-relaxed text-zinc-400 line-clamp-3">
                  {quickViewProduct.description}
                </p>
              )}

              {/* Variants */}
              {quickViewProduct.productVariants?.length > 1 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Option / Edition
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.productVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`border px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedVariant?.id === variant.id
                            ? "border-[#c5a880] bg-[#c5a880]/15 text-[#dfc79b]"
                            : "border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                        }`}
                      >
                        {variant.name || [variant.size, variant.color].filter(Boolean).join(" / ") || variant.sku}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper + Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-zinc-800/80 mt-6">
              {!unavailable && (
                <div className="flex items-center gap-3">
                  <div className="flex h-11 items-center border border-zinc-800 bg-zinc-900/60">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity === 1}
                      onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                      className="px-3 h-full flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-xs font-mono tabular-nums text-zinc-200">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((v) => v + 1)}
                      className="px-3 h-full flex items-center justify-center text-zinc-400 hover:text-white"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={unavailable || !selectedVariant}
                    className={`flex-1 h-11 flex items-center justify-center gap-2 border text-xs font-bold uppercase tracking-widest transition-all ${
                      added
                        ? "border-[#c5a880] bg-[#c5a880]/20 text-[#dfc79b]"
                        : "border-[#c5a880] bg-gradient-to-r from-[#dfc79b] to-[#c5a880] text-black hover:opacity-95"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={14} className="text-[#dfc79b]" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center text-xs pt-1">
                <Link
                  to={`/product/${quickViewProduct.id}`}
                  onClick={closeQuickView}
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#dfc79b] underline underline-offset-4 tracking-wider transition-colors"
                >
                  <span>View Full Details & Reviews</span>
                  <ArrowRight size={13} />
                </Link>

                <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                  SKU: {selectedVariant?.sku || quickViewProduct.sku || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
