import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";
import { money } from "./Layout";
import { ANTEIKU_FALLBACK_IMAGE } from "./ProductCard";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartDrawer() {
  const { isCartDrawerOpen, closeCartDrawer, cart, updateQuantity, removeFromCart, user } = useContext(StoreContext);
  const navigate = useNavigate();

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progressPercent = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    closeCartDrawer();
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login?returnTo=/checkout", {
        state: { notice: "Sign in or create an account to continue to checkout." },
      });
    }
  };

  const handleViewBag = () => {
    closeCartDrawer();
    navigate("/cart");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping bag drawer">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col shadow-2xl transition-transform duration-300 ease-out">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
            <div className="flex items-baseline gap-2">
              <h2 className="font-serif text-lg font-medium tracking-wider text-zinc-100">SHOPPING BAG</h2>
              <span className="text-xs text-[#c5a880] tracking-widest font-mono">({count})</span>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              aria-label="Close bag drawer"
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-6 py-3.5">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-zinc-300">
                Add <span className="font-semibold text-[#dfc79b]">{money(remainingForFreeShipping)}</span> more for complimentary express delivery.
              </p>
            ) : (
              <p className="text-xs font-medium text-[#dfc79b]">
                ✓ You have unlocked complimentary express delivery.
              </p>
            )}
            <div className="mt-2 h-1 w-full overflow-hidden bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-[#c5a880] to-[#dfc79b] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-zinc-800/60">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 text-[#c5a880]">
                  <ShoppingBag size={26} strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-serif text-base font-medium text-zinc-200">Your bag is empty</h3>
                <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-400">
                  Discover our curated acquisitions and archival Tokyo Ghoul collectables.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate("/shop");
                  }}
                  className="mt-6 inline-flex items-center gap-2 border border-[#c5a880]/60 bg-[#c5a880]/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#dfc79b] hover:bg-[#c5a880] hover:text-black transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variantId} className="flex gap-4 py-4">
                  {/* Item Image */}
                  <div className="h-24 w-20 shrink-0 overflow-hidden border border-zinc-800 bg-zinc-900">
                    <img
                      src={item.image || ANTEIKU_FALLBACK_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = ANTEIKU_FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.productId}`}
                          onClick={closeCartDrawer}
                          className="font-serif text-sm font-medium text-zinc-200 hover:text-[#dfc79b] line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.variantName && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {item.variantName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-zinc-800 bg-zinc-900/60">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-mono tabular-nums text-zinc-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-zinc-200">
                        {money(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-zinc-800 bg-zinc-950 p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-200">{money(total)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-zinc-100 pt-2 border-t border-zinc-800/80">
                  <span className="font-serif">Estimated Total</span>
                  <span className="text-[#dfc79b]">{money(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 border border-[#c5a880] bg-gradient-to-r from-[#dfc79b] to-[#c5a880] py-3 text-xs font-bold uppercase tracking-widest text-black hover:opacity-95 transition-opacity"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleViewBag}
                  className="w-full border border-zinc-800 bg-zinc-900 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
                >
                  View Full Bag
                </button>
              </div>

              <p className="text-center text-[10px] uppercase tracking-widest text-zinc-500">
                Guaranteed Authentic · Insured Worldwide Shipping
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
