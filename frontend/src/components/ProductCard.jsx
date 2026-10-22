/* eslint-disable react-refresh/only-export-components */
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { money } from "./Layout";
import { StoreContext } from "../context/StoreContext";

const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='900'%3E%3Crect width='100%25' height='100%25' fill='%23e4e4e7'/%3E%3Cpath d='M260 320h180v260H260z' fill='%23b4b4b8'/%3E%3C/svg%3E";
export const imageOf = (product) => product?.productImages?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0]?.imageUrl || placeholder;

export function ProductCard({ product, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [wishMessage, setWishMessage] = useState("");
  const { user, wishlists, isWishlisted, addWishlistProduct, removeWishlistProduct } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const variants = product.productVariants || [];
  const variant = variants.length === 1 ? variants[0] : null;
  const unavailable = product.status !== "ACTIVE" || variants.length === 0;
  const needsOptions = !unavailable && variants.length > 1;
  const wished = isWishlisted(product.id);

  const toggleWish = async () => {
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
        setWishMessage("Removed from your wishlist.");
      } else {
        const result = await addWishlistProduct(product.id);
        setWishMessage(result.alreadySaved ? "Already in your wishlist." : "Saved to your wishlist.");
      }
    } catch (error) {
      setWishMessage(error.message || "Could not update your wishlist. Please try again.");
    } finally {
      setWishBusy(false);
    }
  };

  const add = () => {
    if (!variant || unavailable || !onAdd) return;
    onAdd(product, { ...variant, selectedQuantity: quantity });
    setQuantity(1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return <article className="group relative">
    <Link to={`/product/${product.id}`} className="block overflow-hidden bg-zinc-100 dark:bg-zinc-900">
      <img src={imageOf(product)} alt={product.productImages?.[0]?.altText || product.name} className="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-[1.02]" onError={(e) => { e.currentTarget.src = placeholder; }}/>
    </Link>
    <div className="pt-3">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-xs text-zinc-500">{product.brandName || product.categoryName || "ANTEIKU"}</p><Link to={`/product/${product.id}`} className="mt-1 block font-medium hover:underline">{product.name}</Link></div>
        <button type="button" aria-label={`${wished ? "Remove" : "Save"} ${product.name} ${wished ? "from" : "to"} wishlist`} aria-pressed={wished} disabled={wishBusy} onClick={toggleWish} className="icon-button -mt-1 disabled:opacity-50"><Heart size={17} fill={wished ? "currentColor" : "none"}/></button>
      </div>
      {wishMessage && <p aria-live="polite" className="mt-1 text-xs text-zinc-500">{wishMessage}</p>}
      <p className="mt-2 text-sm">{money(variant?.price ?? product.price)}</p>
      {unavailable ? <p className="mt-3 text-xs font-semibold text-zinc-500">Unavailable</p> : needsOptions ? <Link to={`/product/${product.id}`} className="mt-3 inline-block text-xs font-semibold underline underline-offset-4">Choose options</Link> : <>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center border border-zinc-300 dark:border-zinc-700">
            <button aria-label={`Decrease ${product.name} quantity`} disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-2 disabled:cursor-not-allowed disabled:opacity-35"><Minus size={14}/></button>
            <span aria-live="polite" className="w-7 text-center text-sm tabular-nums">{quantity}</span>
            <button aria-label={`Increase ${product.name} quantity`} onClick={() => setQuantity((value) => value + 1)} className="p-2"><Plus size={14}/></button>
          </div>
          <button onClick={add} className="inline-flex flex-1 items-center justify-center gap-1.5 border border-black bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"><ShoppingBag size={14}/> Add to cart</button>
        </div>
        {added && <p aria-live="polite" className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500"><Check size={13}/> Added to cart</p>}
      </>}
    </div>
  </article>;
}
