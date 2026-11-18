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
        className="fixed inset-0 bg-black/60 transition-opacity duration-200"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-[#E5E5E5] bg-white text-black flex flex-col shadow-2xl transition-transform duration-200 ease-out">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">Shopping Bag</h2>
              <span className="text-xs font-bold text-[#737373]">({count})</span>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              aria-label="Close bag drawer"
              className="text-[#737373] hover:text-black transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="border-b border-[#E5E5E5] bg-[#FAFAFA] px-6 py-3.5">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-black font-medium">
                Add <span className="font-bold">{money(remainingForFreeShipping)}</span> more for complimentary express delivery.
              </p>
            ) : (
              <p className="text-xs font-bold text-black">
                ✓ Complimentary express delivery unlocked.
              </p>
            )}
            <div className="mt-2 h-1 w-full overflow-hidden bg-[#E5E5E5]">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E5E5E5]">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex h-14 w-14 items-center justify-center border border-black bg-white text-black">
                  <ShoppingBag size={22} strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-base font-bold text-black">Your bag is empty</h3>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#737373]">
                  Explore our curated anime figures and authenticated imports.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCartDrawer();
                    navigate("/shop");
                  }}
                  className="mt-6 border border-black bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variantId} className="flex gap-4 py-4">
                  {/* Item Image */}
                  <div className="h-24 w-20 shrink-0 overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA]">
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
                          className="text-xs font-semibold text-black hover:underline line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-[#737373] hover:text-black transition-colors p-0.5"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.variantName && (
                        <p className="text-[11px] text-[#737373] mt-0.5 font-medium">
                          {item.variantName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E5E5E5] bg-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-2 py-1 text-[#737373] hover:text-black transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold tabular-nums text-black">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-2 py-1 text-[#737373] hover:text-black transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-black">
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
            <div className="border-t border-[#E5E5E5] bg-white p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#737373]">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">{money(total)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#737373]">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-[#E5E5E5]">
                  <span>Estimated Total</span>
                  <span className="text-black font-extrabold">{money(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 border border-black bg-black py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleViewBag}
                  className="w-full border border-[#E5E5E5] bg-white py-3 text-xs font-bold uppercase tracking-widest text-black hover:border-black transition-colors"
                >
                  View Full Bag
                </button>
              </div>

              <p className="text-center text-[10px] uppercase tracking-widest text-[#737373]">
                Guaranteed Authentic · Express Dispatch
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
