import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { accountApi, catalogueApi } from "../api/services";
import { messageFrom } from "../api/client";
import { ProductCard, imageOf } from "../components/ProductCard";
import { StoreContext } from "../context/StoreContext";

const toCartItem = (product, variant) => ({
  productId: product.id,
  variantId: variant.id,
  name: product.name,
  variantName: variant.name,
  price: Number(variant.price ?? product.price),
  image: imageOf(product),
  quantity: variant.selectedQuantity || 1,
});

const Page = ({ children }) => <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:px-6 sm:py-14"><p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Account</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Wishlist</h1>{children}</section>;
const Notice = ({ children, success = false }) => <p role="status" className={`mt-5 border px-4 py-3 text-sm ${success ? "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" : "border-red-200 bg-red-50 text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200"}`}>{children}</p>;

export function WishlistPage() {
  const { user, addToCart } = useContext(StoreContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busyItem, setBusyItem] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const wishlists = await accountApi.wishlists();
        const ids = [...new Set(wishlists.flatMap((wishlist) => wishlist.productIds || []))];
        const results = await Promise.all(ids.map(async (id) => {
          try { return [String(id), await catalogueApi.product(id)]; }
          catch { return [String(id), null]; }
        }));
        const productsById = new Map(results);
        if (active) {
          setGroups(wishlists.map((wishlist) => ({
            wishlist,
            products: (wishlist.productIds || []).map((id) => ({ id, product: productsById.get(String(id)) || null })),
          })));
          setError("");
        }
      } catch (loadError) {
        if (active) setError(messageFrom(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };
    if (user) load();
    return () => { active = false; };
  }, [user]);

  if (!user) return <Navigate to="/login?returnTo=/wishlist" replace/>;

  const removeProduct = async (wishlistId, productId) => {
    const busyKey = `${wishlistId}:${productId}`;
    setBusyItem(busyKey);
    setError("");
    setFeedback("");
    try {
      const updated = await accountApi.removeWishlistProduct(wishlistId, productId);
      if (!updated || String(updated.id) !== String(wishlistId) || !Array.isArray(updated.productIds)) {
        throw new Error("The wishlist API did not confirm this removal.");
      }
      setGroups((current) => current.map((group) => String(group.wishlist.id) === String(wishlistId) ? {
        wishlist: updated,
        products: group.products.filter((item) => (updated.productIds || []).some((id) => String(id) === String(item.id))),
      } : group));
      setFeedback("Item removed from your wishlist.");
    } catch (removeError) {
      setError(messageFrom(removeError));
    } finally {
      setBusyItem("");
    }
  };

  return <Page>
    {error && <Notice>{error}</Notice>}
    {feedback && <Notice success>{feedback}</Notice>}
    {loading ? <p className="mt-8 py-10 text-sm text-zinc-500">Loading your saved items…</p> : groups.length ? <div className="mt-8 space-y-12">
      {groups.map(({ wishlist, products }) => <section key={wishlist.id} aria-labelledby={`wishlist-${wishlist.id}`}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800"><div><h2 id={`wishlist-${wishlist.id}`} className="text-xl font-bold">{wishlist.name}</h2>{wishlist.description && <p className="mt-1 text-sm text-zinc-500">{wishlist.description}</p>}</div><p className="text-sm text-zinc-500">{products.length} {products.length === 1 ? "item" : "items"}</p></div>
        {products.length ? <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">{products.map(({ id, product }) => <div key={id} className="min-w-0">
          {product ? <ProductCard product={product} onAdd={(item, variant) => addToCart(toCartItem(item, variant))}/> : <div className="flex aspect-[4/5] items-center justify-center border border-zinc-200 bg-zinc-100 p-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">Product details are no longer available.</div>}
          <button type="button" disabled={busyItem === `${wishlist.id}:${id}`} onClick={() => removeProduct(wishlist.id, id)} className="mt-3 min-h-10 w-full border border-zinc-300 px-3 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900">{busyItem === `${wishlist.id}:${id}` ? "Removing…" : "Remove from wishlist"}</button>
        </div>)}</div> : <p className="mt-5 text-sm text-zinc-500">This wishlist is empty. Save a product to add it here.</p>}
      </section>)}
    </div> : <div className="mt-8 border-y border-zinc-200 py-12 text-center dark:border-zinc-800"><p className="font-semibold">No wishlist yet</p><p className="mt-2 text-sm text-zinc-500">Save a product from its detail page to create your wishlist.</p><Link to="/shop" className="mt-5 inline-flex min-h-11 items-center bg-black px-5 text-sm font-semibold text-white dark:bg-white dark:text-black">Explore the collection</Link></div>}
  </Page>;
}
