import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { catalogueApi } from "../api/services";
import { messageFrom } from "../api/client";
import { ANTEIKU_FALLBACK_IMAGE, ProductCard, ProductCardSkeleton, imageOf } from "../components/ProductCard";
import { StoreContext } from "../context/StoreContext";
import { Page, Notice, Button } from "./Storefront";

const toCartItem = (product, variant) => ({
  productId: product.id,
  variantId: variant.id,
  name: product.name,
  variantName: variant.name,
  price: Number(variant.price ?? product.price),
  image: imageOf(product),
  quantity: variant.selectedQuantity || 1,
});

export function WishlistPage() {
  const {
    user,
    addToCart,
    wishlists,
    wishlistLoading,
    wishlistError,
    loadWishlists,
    removeWishlistProduct,
    showToast,
  } = useContext(StoreContext);

  const [productsById, setProductsById] = useState({});
  const [loadedProductIdKey, setLoadedProductIdKey] = useState("");
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busyItem, setBusyItem] = useState("");

  const productIds = [
    ...new Set((wishlists || []).flatMap((wishlist) => wishlist.productIds || []).map(String)),
  ];
  const productIdKey = productIds.join(",");
  const productsLoading = productIdKey !== loadedProductIdKey;

  useEffect(() => {
    if (!user || !Array.isArray(wishlists)) return undefined;
    let active = true;
    const ids = productIdKey ? productIdKey.split(",") : [];
    Promise.all(
      ids.map(async (id) => {
        try {
          return [id, await catalogueApi.product(id)];
        } catch {
          return [id, null];
        }
      })
    ).then((results) => {
      if (active) {
        setProductsById(Object.fromEntries(results));
        setLoadedProductIdKey(productIdKey);
      }
    });
    return () => {
      active = false;
    };
  }, [user, productIdKey, wishlists]);

  if (!user) return <Navigate to="/login?returnTo=%2Fwishlist" replace />;

  const removeProduct = async (wishlistId, productId) => {
    const busyKey = `${wishlistId}:${productId}`;
    if (busyItem) return;
    setBusyItem(busyKey);
    setActionError("");
    setFeedback("");
    try {
      await removeWishlistProduct(wishlistId, productId);
      setFeedback("Item removed from your wishlist.");
      showToast("Item removed from your wishlist.", "info");
    } catch (error) {
      setActionError(messageFrom(error));
      showToast(messageFrom(error), "error");
    } finally {
      setBusyItem("");
    }
  };

  if (wishlistLoading || (wishlists === null && !wishlistError)) {
    return (
      <Page eyebrow="Sanctuary" title="Saved Wishlist" subtitle="Loading your curated wishlist records…">
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </Page>
    );
  }

  return (
    <Page
      eyebrow="Sanctuary"
      title="Saved Wishlist"
      subtitle="Artefacts and collectables reserved for your personal collection."
      actions={
        <Link
          to="/shop"
          className="text-xs font-semibold uppercase tracking-wider text-[#dfc79b] hover:underline"
        >
          Explore Collection →
        </Link>
      }
    >
      {wishlistError && (
        <Notice>
          {wishlistError}{" "}
          <button
            type="button"
            onClick={() => loadWishlists().catch(() => {})}
            className="ml-1 font-semibold underline underline-offset-4 text-[#dfc79b]"
          >
            Try again
          </button>
        </Notice>
      )}

      {actionError && <Notice>{actionError}</Notice>}
      {feedback && <Notice type="info">{feedback}</Notice>}

      {wishlists === null ? null : wishlists.length ? (
        <div className="space-y-14">
          {wishlists.map((wishlist) => {
            const ids = wishlist.productIds || [];
            return (
              <section key={wishlist.id} aria-labelledby={`wishlist-${wishlist.id}`}>
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <h2 id={`wishlist-${wishlist.id}`} className="font-serif text-xl font-medium text-zinc-100">
                      {wishlist.name}
                    </h2>
                    {wishlist.description && (
                      <p className="mt-1 text-xs text-zinc-400 font-sans">
                        {wishlist.description}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-[#c5a880]">
                    {ids.length} {ids.length === 1 ? "piece" : "pieces"}
                  </span>
                </div>

                {ids.length ? (
                  <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
                    {ids.map((id) => {
                      const product = productsById[String(id)];
                      return (
                        <div key={id} className="min-w-0 flex flex-col justify-between">
                          {product ? (
                            <ProductCard
                              product={product}
                              onAdd={(item, variant) => addToCart(toCartItem(item, variant))}
                            />
                          ) : (
                            <div className="flex aspect-[4/5] flex-col items-center justify-center border border-zinc-800 bg-zinc-950 p-5 text-center text-xs text-zinc-500">
                              {productsLoading ? (
                                <span className="animate-pulse">Loading piece…</span>
                              ) : (
                                <span>Piece details are no longer available in the catalogue.</span>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={Boolean(busyItem)}
                            onClick={() => removeProduct(wishlist.id, id)}
                            className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 border border-zinc-800 bg-zinc-900/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:border-red-900/60 hover:text-red-400 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={13} />
                            <span>
                              {busyItem === `${wishlist.id}:${id}` ? "Removing…" : "Remove from Wishlist"}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-6 border border-zinc-800 bg-zinc-950 p-8 text-center text-xs text-zinc-500">
                    This wishlist is empty. Explore the archive to save collectables here.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-zinc-800 bg-zinc-950 p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 text-[#c5a880]">
            <Heart size={26} strokeWidth={1.5} />
          </div>
          <h2 className="mt-4 font-serif text-xl font-medium text-zinc-200">
            Your wishlist is empty
          </h2>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-400">
            Save unique statues, collector hoodies, and official Japanese prints to inspect them later.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 border border-[#c5a880] bg-gradient-to-r from-[#dfc79b] to-[#c5a880] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:opacity-95 transition-opacity"
          >
            <span>Explore The Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </Page>
  );
}
