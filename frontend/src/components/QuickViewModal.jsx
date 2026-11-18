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
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeQuickView}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl overflow-hidden border border-[#E5E5E5] bg-white text-black shadow-2xl">
        <button
          type="button"
          onClick={closeQuickView}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center border border-[#E5E5E5] bg-white text-black hover:bg-[#F5F5F5] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="grid gap-8 md:grid-cols-2 p-6 sm:p-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-[4/5] w-full overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA]">
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
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden border transition-all ${
                      i === activeImageIndex
                        ? "border-black ring-1 ring-black"
                        : "border-[#E5E5E5] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || ""}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#737373]">
                  {quickViewProduct.brandName || quickViewProduct.categoryName || "ANTEIKU ARCHIVE"}
                </p>
                <h2 className="text-xl font-bold tracking-tight text-black sm:text-2xl">
                  {quickViewProduct.name}
                </h2>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold tracking-tight text-black">
                  {money(selectedVariant?.price ?? quickViewProduct.price)}
                </span>
                {quickViewProduct.status === "ACTIVE" ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                    In Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                    Archived
                  </span>
                )}
              </div>

              {quickViewProduct.description && (
                <p className="text-xs leading-relaxed text-[#737373] line-clamp-3">
                  {quickViewProduct.description}
                </p>
              )}

              {/* Variants */}
              {quickViewProduct.productVariants && quickViewProduct.productVariants.length > 1 && (
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-black">
                    Select Edition / Option
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.productVariants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                          selectedVariant?.id === v.id
                            ? "bg-black text-white border border-black"
                            : "bg-white text-black border border-[#E5E5E5] hover:border-black"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper & Add Button */}
            <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
              {!unavailable ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-11 items-center border border-[#E5E5E5] bg-white">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity === 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 h-full flex items-center justify-center text-[#737373] hover:text-black disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold tabular-nums text-black">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 h-full flex items-center justify-center text-[#737373] hover:text-black"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`flex h-11 flex-1 items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                      added
                        ? "bg-neutral-800 text-white"
                        : "bg-black text-white hover:bg-neutral-800"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check size={15} />
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
              ) : (
                <div className="flex h-11 items-center justify-center border border-[#E5E5E5] bg-[#FAFAFA] text-xs font-bold uppercase tracking-widest text-[#737373]">
                  Item Unavailable
                </div>
              )}

              <Link
                to={`/product/${quickViewProduct.id}`}
                onClick={closeQuickView}
                className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:underline py-1"
              >
                <span>View Complete Product Details</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
