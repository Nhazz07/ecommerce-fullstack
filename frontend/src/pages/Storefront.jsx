import { ArrowRight, Check, Minus, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { accountApi, authApi, catalogueApi } from "../api/services";
import { messageFrom } from "../api/client";
import { StoreContext } from "../context/StoreContext";
import { imageOf, ProductCard } from "../components/ProductCard";
import { money } from "../components/Layout";
import { visibleShopProducts } from "../utils/productPrice";

const Button = ({ className = "", ...props }) => <button className={`inline-flex items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 ${className}`} {...props}/>;
const Page = ({ eyebrow, title, children }) => <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:px-6 sm:py-14"><p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p><h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>{children}</section>;
const Notice = ({ children, type = "error" }) => <p className={`mt-4 border px-4 py-3 text-sm ${type === "error" ? "border-red-200 bg-red-50 text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200" : "border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900"}`}>{children}</p>;
const Loading = () => <div className="py-20 text-center text-sm text-zinc-500">Loading…</div>;

function useCatalogue() { const [state, setState] = useState({ loading: true, error: "", products: [], categories: [], brands: [] }); useEffect(() => { Promise.allSettled([catalogueApi.products(), catalogueApi.categories(), catalogueApi.brands()]).then(([products, categories, brands]) => { const failures = [products, categories, brands].filter((result) => result.status === "rejected"); setState({ loading: false, error: failures.map((result) => messageFrom(result.reason)).join(" "), products: products.status === "fulfilled" ? products.value.content || [] : [], categories: categories.status === "fulfilled" ? categories.value : [], brands: brands.status === "fulfilled" ? brands.value : [] }); }); }, []); return state; }
const toCartItem = (product, variant) => ({ productId: product.id, variantId: variant.id, name: product.name, variantName: variant.name, price: Number(variant.price ?? product.price), image: imageOf(product), quantity: variant.selectedQuantity || 1 });

export function HomePage() { const { products, categories, loading, error } = useCatalogue(); const { addToCart } = useContext(StoreContext); if (loading) return <Loading/>; return <><section className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:py-24"><div className="self-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Anime objects, selected with care</p><h1 className="mt-5 max-w-xl text-5xl font-black leading-[.95] tracking-tight sm:text-7xl">Stories worth keeping.</h1><p className="mt-6 max-w-md leading-7 text-zinc-600 dark:text-zinc-400">Figures, collectables and apparel from the worlds you return to again and again.</p><Link to="/shop" className="mt-8 inline-flex items-center gap-2 bg-black px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">Shop collection <ArrowRight size={16}/></Link></div><div className="hidden aspect-[4/5] items-center justify-center bg-zinc-200 text-center text-xs font-bold tracking-[.25em] text-zinc-500 dark:bg-zinc-800 lg:flex">YOUR NEXT PIECE</div></div></section>{error && <div className="mx-auto max-w-7xl px-4 sm:px-6"><Notice>{error}</Notice></div>}<section className="mx-auto max-w-7xl px-4 py-14 sm:px-6"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Explore</p><h2 className="mt-2 text-2xl font-bold">Shop by category</h2></div><Link to="/categories" className="text-sm underline underline-offset-4">All categories</Link></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{categories.slice(0, 4).map((category) => <Link key={category.id} to={`/shop?category=${category.id}`} className="group border border-zinc-200 p-5 hover:border-black dark:border-zinc-800 dark:hover:border-white"><span className="block text-lg font-semibold">{category.name}</span><span className="mt-7 block text-xs text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white">Explore collection →</span></Link>)}</div></section><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">New arrivals</p><h2 className="mt-2 text-2xl font-bold">Recently added</h2></div><Link to="/shop" className="text-sm underline underline-offset-4">View all</Link></div><div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">{products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} onAdd={(product, variant) => addToCart(toCartItem(product, variant))}/>)}</div></section></>; }

export function SeriesPage() {
  const [series, setSeries] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    catalogueApi.allProducts()
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
      .catch((err) => { if (active) setError(messageFrom(err)); })
      .finally(() => { if (active) setSeries((current) => current || []); });
    return () => { active = false; };
  }, []);

  if (error) return <Page eyebrow="Discover" title="Anime series"><Notice>{error}</Notice></Page>;
  if (!series) return <Loading/>;
  return <Page eyebrow="Discover" title="Anime series">
    <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">Browse series represented in the current product catalogue.</p>
    {series.length ? <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{series.map((item) => <Link key={item.id} to={`/series/${item.id}`} state={{ seriesName: item.name }} className="group border border-zinc-200 p-5 hover:border-black dark:border-zinc-800 dark:hover:border-white"><h2 className="text-lg font-semibold">{item.name}</h2><p className="mt-5 text-sm text-zinc-500">{item.count} {item.count === 1 ? "product" : "products"}</p><span className="mt-5 block text-xs font-bold uppercase tracking-wider">Explore →</span></Link>)}</div> : <p className="mt-8 border-y border-zinc-200 py-10 text-sm text-zinc-500 dark:border-zinc-800">No series are currently listed in the product catalogue.</p>}
  </Page>;
}

export function SeriesDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useContext(StoreContext);
  const [state, setState] = useState({ loading: true, products: [], name: location.state?.seriesName || "", error: "" });

  useEffect(() => {
    let active = true;
    catalogueApi.productsForSeries(id).then(async (products) => {
      let name = products.find((product) => product.seriesName)?.seriesName || location.state?.seriesName || "";
      if (!name) {
        const catalogue = await catalogueApi.allProducts();
        name = catalogue.find((product) => String(product.seriesId) === String(id))?.seriesName || "";
      }
      if (active) setState({ loading: false, products, name, error: "" });
    }).catch((err) => {
      if (active) setState({ loading: false, products: [], name: location.state?.seriesName || "", error: messageFrom(err) });
    });
    return () => { active = false; };
  }, [id, location.state?.seriesName]);

  if (state.loading) return <Loading/>;
  if (state.error) return <Page eyebrow="Series" title={state.name || "Series details"}><Notice>{state.error}</Notice><Link to="/series" className="mt-5 inline-block text-sm underline underline-offset-4">Back to series</Link></Page>;
  return <Page eyebrow="Series" title={state.name || "Series details"}>
    <Link to="/series" className="mt-4 inline-block text-sm text-zinc-500 underline underline-offset-4">← All series</Link>
    {state.products.length ? <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">{state.products.map((product) => <ProductCard key={product.id} product={product} onAdd={(item, variant) => addToCart(toCartItem(item, variant))}/>)}</div> : <p className="mt-8 border-y border-zinc-200 py-10 text-sm text-zinc-500 dark:border-zinc-800">No products are currently listed for this series.</p>}
  </Page>;
}

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
    accountApi.productReviews(id).then((items) => {
      if (active) {
        setReviews(Array.isArray(items) ? items : []);
        setError("");
        setLoadedFor(requestKey);
      }
    }).catch((err) => {
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
      const created = await accountApi.createReview({ rating: Number(rating), comment: comment.trim(), userId: user.id, productId: Number(id) });
      if (!created || created.id == null) throw new Error("The review endpoint did not confirm a saved review. Please try again.");
      setReviews((current) => [created, ...current]);
      setComment("");
      setFeedback("Your review was submitted.");
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setSubmitting(false);
    }
  };

  return <section className="mx-auto w-full min-w-0 max-w-7xl px-4 pb-10 sm:px-6">
    <div className="max-w-3xl border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="text-xl font-bold">Customer reviews</h2>
      {!user ? <div className="mt-4 border-y border-zinc-200 py-5 text-sm text-zinc-500 dark:border-zinc-800"><p>Sign in to view or write reviews for this product.</p><Link to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`} state={{ notice: "Sign in to view and write product reviews." }} className="mt-3 inline-block font-semibold text-zinc-950 underline underline-offset-4 dark:text-white">Sign in</Link></div> : loading ? <p className="mt-4 text-sm text-zinc-500">Loading reviews…</p> : <>
        {error && <Notice>{error}</Notice>}
        {feedback && <Notice type="info">{feedback}</Notice>}
        {!error && reviews.length === 0 && <p className="mt-4 border-y border-zinc-200 py-5 text-sm text-zinc-500 dark:border-zinc-800">No reviews yet.</p>}
        {reviews.length > 0 && <div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">{reviews.map((review) => <article key={review.id} className="py-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{review.userName || "Customer"}</p><p className="text-xs text-zinc-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Date unavailable"}</p></div><p className="mt-1 text-sm" aria-label={`${review.rating} out of 5 stars`}>{review.rating} / 5</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-400">{review.comment}</p></article>)}</div>}
        <form onSubmit={submit} className="mt-7 space-y-4">
          <h3 className="font-semibold">Write a review</h3>
          <label className="block text-sm font-medium">Rating<select value={rating} onChange={(event) => setRating(event.target.value)} className="field mt-2"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Below average</option><option value="1">1 — Poor</option></select></label>
          <label className="block text-sm font-medium">Review<textarea required maxLength={1000} rows="4" value={comment} onChange={(event) => setComment(event.target.value)} className="field mt-2 resize-y" placeholder="Share your experience with this product."/><span className="mt-1 block text-xs font-normal text-zinc-500">Up to 1,000 characters.</span></label>
          <Button disabled={submitting || !comment.trim()}>{submitting ? "Submitting…" : "Submit review"}</Button>
        </form>
      </>}
    </div>
  </section>;
}

export function ShopPage() { const { products, categories, brands, loading, error } = useCatalogue(); const { addToCart } = useContext(StoreContext); const [params, setParams] = useSearchParams(); const [showFilters, setShowFilters] = useState(false); const q = params.get("q") || ""; const category = params.get("category") || ""; const brand = params.get("brand") || ""; const sort = params.get("sort") || "featured"; const update = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); }; const shown = useMemo(() => visibleShopProducts(products, { query: q, category, brand, sort }), [products, q, category, brand, sort]); if (loading) return <Loading/>; const filter = <aside className="space-y-7 text-sm"><label className="block font-semibold">Search<input value={q} onChange={(e) => update("q", e.target.value)} className="field mt-2" placeholder="Search products"/></label><label className="block font-semibold">Category<select value={category} onChange={(e) => update("category", e.target.value)} className="field mt-2"><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="block font-semibold">Brand<select value={brand} onChange={(e) => update("brand", e.target.value)} className="field mt-2"><option value="">All brands</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><button onClick={() => setParams({})} className="text-zinc-500 underline underline-offset-4">Clear filters</button></aside>; return <Page eyebrow="The collection" title="Shop all"><div className="mt-10 flex flex-col gap-5 border-y border-zinc-200 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-zinc-500">{shown.length} pieces</span><div className="flex gap-3"><button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-2 border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 lg:hidden"><SlidersHorizontal size={16}/> Filter</button><select value={sort} onChange={(e) => update("sort", e.target.value)} className="border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></div></div>{showFilters && <div className="border-b border-zinc-200 py-5 dark:border-zinc-800 lg:hidden">{filter}</div>}{error && <Notice>{error}</Notice>}<div className="mt-8 grid gap-8 lg:grid-cols-[210px_1fr]"><div className="hidden lg:block">{filter}</div><div>{shown.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3">{shown.map((p) => <ProductCard key={p.id} product={p} onAdd={(product, variant) => addToCart(toCartItem(product, variant))}/>)}</div> : <div className="py-20 text-center text-zinc-500">No products match these filters.</div>}</div></div></Page>; }

export function ProductPage() {
  const { id } = useParams();
  const { addToCart, user, wishlists, isWishlisted, addWishlistProduct, removeWishlistProduct } = useContext(StoreContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [wishBusy, setWishBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    catalogueApi.product(id).then((result) => { setProduct(result); setSelected(result.productVariants?.[0] || null); }).catch((loadError) => setError(messageFrom(loadError)));
  }, [id]);
  if (error) return <Page eyebrow="Product" title="Could not load product"><Notice>{error}</Notice></Page>;
  if (!product) return <Loading/>;
  const wished = isWishlisted(product.id);
  const save = async () => {
    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(`/product/${id}`)}`, { state: { notice: "Sign in to save products to your wishlist." } });
      return;
    }
    if (wishBusy) return;
    setWishBusy(true);
    setWishMessage("");
    try {
      if (wished) {
        const list = wishlists?.find((entry) => (entry.productIds || []).some((productId) => String(productId) === String(product.id)));
        if (!list) throw new Error("Your wishlist is still loading. Please try again shortly.");
        await removeWishlistProduct(list.id, product.id);
        setWishMessage("Removed from your wishlist.");
      } else {
        const result = await addWishlistProduct(product.id);
        setWishMessage(result.alreadySaved ? "Already in your wishlist." : "Saved to your wishlist.");
      }
    } catch (saveError) {
      setWishMessage(messageFrom(saveError));
    } finally {
      setWishBusy(false);
    }
  };
  const images = product.productImages?.length ? product.productImages : [{ imageUrl: imageOf(product), altText: product.name }];
  return <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12"><Link to="/shop" className="text-sm text-zinc-500 underline underline-offset-4">← Back to shop</Link><div className="mt-7 grid gap-10 lg:grid-cols-2 lg:gap-16"><div><div className="overflow-hidden bg-zinc-100 dark:bg-zinc-900"><img className="aspect-[4/5] w-full object-cover" src={images[index]?.imageUrl} alt={images[index]?.altText || product.name} onError={(event) => { event.currentTarget.src = imageOf({}); }}/></div>{images.length > 1 && <div className="mt-3 flex gap-2">{images.map((img, i) => <button key={img.id || i} onClick={() => setIndex(i)} className={`h-16 w-14 overflow-hidden border ${i === index ? "border-black dark:border-white" : "border-transparent"}`}><img className="h-full w-full object-cover" src={img.imageUrl} alt="" onError={(event) => { event.currentTarget.src = imageOf({}); }}/></button>)}</div>}</div><div className="lg:pt-7"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">{product.brandName || "ANTEIKU"}</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{product.name}</h1><p className="mt-5 text-2xl">{money(selected?.price ?? product.price)}</p><p className="mt-7 max-w-xl whitespace-pre-line leading-7 text-zinc-600 dark:text-zinc-400">{product.description || "Details for this item will be available soon."}</p>{product.productVariants?.length > 0 && <div className="mt-8"><p className="text-sm font-semibold">Choose an option</p><div className="mt-3 flex flex-wrap gap-2">{product.productVariants.map((variant) => <button key={variant.id} onClick={() => setSelected(variant)} className={`border px-4 py-2 text-sm ${selected?.id === variant.id ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-zinc-300 dark:border-zinc-700"}`}>{variant.name || [variant.size, variant.color].filter(Boolean).join(" / ") || variant.sku}</button>)}</div></div>}<div className="mt-8 flex flex-wrap gap-3"><Button disabled={!selected} onClick={() => addToCart(toCartItem(product, selected))}>Add to cart</Button><button type="button" disabled={wishBusy} aria-pressed={wished} onClick={save} className="border border-zinc-300 px-5 py-3 text-sm font-semibold disabled:opacity-50 dark:border-zinc-700">{wishBusy ? "Updating…" : wished ? "Remove from wishlist" : "Save to wishlist"}</button></div>{wishMessage && <p role="status" className="mt-3 text-sm text-zinc-500">{wishMessage}</p>}<dl className="mt-10 grid grid-cols-2 gap-y-3 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800"><dt className="text-zinc-500">Category</dt><dd>{product.categoryName || "—"}</dd><dt className="text-zinc-500">Series</dt><dd>{product.seriesName || "—"}</dd><dt className="text-zinc-500">SKU</dt><dd>{selected?.sku || product.sku || "—"}</dd></dl></div></div></section>;
}

export function CartPage() { const { cart, updateQuantity, removeFromCart, user } = useContext(StoreContext); const navigate = useNavigate(); const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); return <Page eyebrow="Your bag" title="Shopping cart">{cart.length === 0 ? <div className="mt-10 border-y border-zinc-200 py-16 text-center dark:border-zinc-800"><p className="text-zinc-500">Your cart is waiting for something special.</p><Link to="/shop" className="mt-5 inline-block underline underline-offset-4">Browse the collection</Link></div> : <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]"><div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">{cart.map((item) => <div className="flex gap-4 py-5" key={item.variantId}><img src={item.image} alt="" className="h-28 w-20 bg-zinc-100 object-cover dark:bg-zinc-900"/><div className="min-w-0 flex-1"><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-zinc-500">{item.variantName}</p><p className="mt-2 text-sm">{money(item.price)}</p><div className="mt-4 flex items-center justify-between"><div className="flex items-center border border-zinc-300 dark:border-zinc-700"><button aria-label="Decrease quantity" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-2"><Minus size={14}/></button><span className="w-8 text-center text-sm">{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-2"><Plus size={14}/></button></div><button aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.variantId)} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white"><Trash2 size={17}/></button></div></div></div>)}</div><aside className="h-fit bg-zinc-100 p-6 dark:bg-zinc-900"><h2 className="font-bold">Order summary</h2><div className="mt-5 flex justify-between text-sm"><span className="text-zinc-500">Subtotal</span><span>{money(total)}</span></div><div className="mt-3 flex justify-between border-b border-zinc-300 pb-5 text-sm dark:border-zinc-700"><span className="text-zinc-500">Shipping</span><span>At checkout</span></div><div className="mt-5 flex justify-between font-bold"><span>Total</span><span>{money(total)}</span></div><Button onClick={() => navigate(user ? "/checkout" : "/login?returnTo=/checkout", { state: { notice: "Sign in or create an account to continue to checkout." } })} className="mt-6 w-full">Proceed to checkout <ArrowRight size={16}/></Button>{!user && <p className="mt-3 text-xs leading-5 text-zinc-500">You can keep shopping as a guest. Sign in is only required to place an order.</p>}</aside></div>}</Page>; }

function AuthPage({ register = false }) { const { user, signIn, syncCart } = useContext(StoreContext); const navigate = useNavigate(); const location = useLocation(); const [params] = useSearchParams(); const returnTo = params.get("returnTo") || "/account"; const [form, setForm] = useState(register ? { username: "", email: "", password: "", confirmPassword: "", firstName: "", lastName: "", phoneNumber: "", status: "ACTIVE" } : { email: "", password: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); if (user) return <Navigate to={returnTo} replace/>; const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { if (register) await authApi.register(form); await signIn({ email: form.email, password: form.password }); await syncCart().catch(() => {}); navigate(returnTo, { replace: true }); } catch (e) { setError(messageFrom(e)); } finally { setBusy(false); } }; return <section className="mx-auto max-w-md px-4 py-14 sm:py-20"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Account</p><h1 className="mt-3 text-3xl font-bold">{register ? "Create your account" : "Welcome back"}</h1>{location.state?.notice && <Notice type="info">{location.state.notice}</Notice>}<form onSubmit={submit} className="mt-8 space-y-4">{register && <div className="grid gap-4 sm:grid-cols-2"><Input label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })}/><Input label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })}/><Input label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })}/><Input label="Phone number" value={form.phoneNumber} onChange={(v) => setForm({ ...form, phoneNumber: v })}/></div>}<Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })}/><Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })}/>{register && <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={(v) => setForm({ ...form, confirmPassword: v })}/>} {error && <Notice>{error}</Notice>}<Button disabled={busy} className="mt-2 w-full">{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</Button></form><p className="mt-6 text-center text-sm text-zinc-500">{register ? "Already have an account?" : "New to ANTEIKU?"} <Link to={`${register ? "/login" : "/register"}?returnTo=${encodeURIComponent(returnTo)}`} className="text-zinc-950 underline underline-offset-4 dark:text-white">{register ? "Sign in" : "Create one"}</Link></p></section>; }
const Input = ({ label, type = "text", value, onChange }) => <label className="block text-sm font-medium">{label}<input type={type} required value={value || ""} onChange={(e) => onChange(e.target.value)} className="field mt-2"/></label>;
export const LoginPage = () => <AuthPage/>; export const RegisterPage = () => <AuthPage register/>;

const countries = ["Cambodia", "Australia", "Canada", "China", "France", "Germany", "Japan", "Singapore", "South Korea", "Thailand", "United Kingdom", "United States", "Vietnam"];
const checkoutPaymentOptions = [
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", available: true },
  { value: "CREDIT_CARD", label: "Credit / Debit Card", available: false },
  { value: "PAYPAL", label: "PayPal", available: false },
  { value: "ABA", label: "ABA PayWay", available: false },
  { value: "ACLEDA", label: "ACLEDA", available: false },
  { value: "KHQR", label: "KHQR / Bakong", available: false },
];
const emptyShippingAddress = () => ({ street: "", city: "", state: "", postalCode: "", country: "" });
const shippingFromAddress = (address) => ({
  street: address.street || "",
  city: address.city || "",
  state: address.state || "",
  postalCode: address.postalCode || "",
  country: address.country || "",
});
const formatShippingAddress = (shipping) => [
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
    accountApi.addresses().then((result) => {
      if (!active) return;
      const savedAddresses = Array.isArray(result) ? result : [];
      setAddresses(savedAddresses);
      setAddressError("");
      const preferred = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
      if (preferred) {
        setSelectedAddressId(String(preferred.id));
        setShipping((current) => Object.values(current).some(Boolean) ? current : shippingFromAddress(preferred));
      }
    }).catch((loadError) => {
      if (active) setAddressError(messageFrom(loadError));
    }).finally(() => {
      if (active) setAddressesLoading(false);
    });
    return () => { active = false; };
  }, [user]);

  if (!user) return <Navigate to="/login?returnTo=/checkout" replace/>;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code || couponBusy || busy) return;
    setCouponBusy(true);
    setCouponFeedback(null);
    try {
      const coupon = await accountApi.couponByCode(code);
      if (coupon.active === false) {
        setAppliedCoupon(null);
        setCouponFeedback({ type: "error", message: "This coupon is inactive." });
      } else {
        const now = Date.now();
        const startsAt = coupon.startDate ? new Date(coupon.startDate).getTime() : NaN;
        const endsAt = coupon.endDate ? new Date(coupon.endDate).getTime() : NaN;
        if (Number.isFinite(startsAt) && now < startsAt) {
          setAppliedCoupon(null);
          setCouponFeedback({ type: "error", message: "This coupon is not active yet." });
        } else if (Number.isFinite(endsAt) && now > endsAt) {
          setAppliedCoupon(null);
          setCouponFeedback({ type: "error", message: "This coupon has expired." });
        } else {
          setAppliedCoupon(coupon);
          setCouponFeedback({ type: "error", message: `Coupon ${coupon.code} is eligible, but coupon use cannot be recorded by the current order API. Remove it to place an order without a coupon.` });
        }
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponFeedback({ type: "error", message: err.response?.status === 404 ? "Coupon code not found." : messageFrom(err) });
    } finally {
      setCouponBusy(false);
    }
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponFeedback({ type: "info", message: "Coupon removed. You can enter another code." });
  };
  const updateShipping = (field, value) => {
    setShipping((current) => ({ ...current, [field]: value }));
    setSelectedAddressId("");
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };
  const selectAddress = (address) => {
    setSelectedAddressId(String(address.id));
    setShipping(shippingFromAddress(address));
    setFieldErrors({});
  };
  const validateShipping = () => {
    const errors = Object.fromEntries(
      Object.entries(shipping)
        .filter(([, value]) => !value.trim())
        .map(([field]) => [field, "This field is required."])
    );
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (couponBusy || busy || !validateShipping()) return;
    if (appliedCoupon) {
      setError("Remove the coupon before placing this order. The current order API cannot record coupon usage after a successful order.");
      return;
    }
    if (!checkoutPaymentOptions.some((option) => option.available && option.value === paymentMethod)) {
      setError("That payment method is not currently available.");
      return;
    }

    setBusy(true);
    try {
      await syncCart();
      const shippingAddress = formatShippingAddress(shipping);
      const order = await accountApi.createOrder({ couponId: appliedCoupon?.id ?? null, shippingAddress, paymentMethod });
      setDone(order);
      cart.forEach((item) => removeFromCart(item.variantId));
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setBusy(false);
    }
  };
  const field = (name, label, props = {}) => <label className="block text-sm font-semibold" htmlFor={`shipping-${name}`}>
    {label}
    <input
      id={`shipping-${name}`}
      name={name}
      value={shipping[name]}
      onChange={(event) => updateShipping(name, event.target.value)}
      aria-invalid={Boolean(fieldErrors[name])}
      aria-describedby={fieldErrors[name] ? `shipping-${name}-error` : undefined}
      className={`field mt-2 ${fieldErrors[name] ? "field-error" : ""}`}
      {...props}
    />
    {fieldErrors[name] && <span id={`shipping-${name}-error`} className="mt-1 block text-xs text-red-700 dark:text-red-300">{fieldErrors[name]}</span>}
  </label>;

  if (done) return <Page eyebrow="Order confirmation" title="Thank you for your order">
    <div className="mt-8 max-w-3xl border border-zinc-200 p-5 dark:border-zinc-800 sm:p-8">
      <div className="flex items-start gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-zinc-100 dark:bg-zinc-800"><Check size={22}/></span>
        <div className="min-w-0"><p className="text-lg font-bold">Order placed</p><p className="mt-1 text-sm text-zinc-500">{done.orderNumber != null ? `Order #${done.orderNumber}` : "Order number unavailable"}</p></div>
        <OrderStatus status={done.status}/>
      </div>
      <div className="py-6">
        <h2 className="text-sm font-bold uppercase tracking-wider">Purchased items</h2>
        <OrderItems items={done.orderItems}/>
      </div>
      <dl className="space-y-2 border-t border-zinc-200 py-5 text-sm dark:border-zinc-800">
        {[["Subtotal", done.subTotal], ["Shipping", done.shippingFee], ["Discount", done.discountAmount]].map(([label, amount]) => amount != null && <div key={label} className="flex justify-between gap-4"><dt className="text-zinc-500">{label}</dt><dd>{money(amount)}</dd></div>)}
      </dl>
      <div className="flex items-center justify-between border-t border-zinc-200 pt-5 text-lg font-bold dark:border-zinc-800"><span>Order total</span><span>{done.totalAmount != null ? money(done.totalAmount) : "Not provided"}</span></div>
      <div className="mt-7 flex flex-wrap gap-3">
        {done.id && <Link to={`/orders/${done.id}`} className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200">View order details</Link>}
        <Link to="/orders" className="inline-flex min-h-11 items-center justify-center border border-zinc-300 px-5 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">Order history</Link>
        <Link to="/shop" className="inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold underline underline-offset-4">Continue shopping</Link>
      </div>
    </div>
  </Page>;
  if (!cart.length) return <Navigate to="/cart" replace/>;

  return <Page eyebrow="Checkout" title="Complete your order">
    {error && <Notice>{error}</Notice>}
    <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-base font-bold">Shipping address</legend>
          {addressesLoading ? <p className="text-sm text-zinc-500">Loading saved addresses…</p> : addresses.length ? <div className="space-y-2 border-y border-zinc-200 py-4 dark:border-zinc-800">
            <p className="text-sm font-semibold">Saved addresses</p>
            {addresses.map((address) => <label key={address.id} className={`block cursor-pointer border p-3 text-sm ${String(address.id) === selectedAddressId ? "border-black dark:border-white" : "border-zinc-200 dark:border-zinc-800"}`}>
              <span className="flex items-start gap-3"><input type="radio" name="saved-address" checked={String(address.id) === selectedAddressId} onChange={() => selectAddress(address)} className="mt-1 accent-black dark:accent-white"/><span>{address.street}<br/>{address.city}, {address.state} {address.postalCode}<br/>{address.country}{address.isDefault && <span className="mt-1 block text-xs text-zinc-500">Default address</span>}</span></span>
            </label>)}
          </div> : null}
          {addressError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Saved addresses could not be loaded. You can still enter a shipping address below.</p>}
          {field("street", "Street address", { autoComplete: "street-address", placeholder: "House number, street name, apartment or unit" })}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("city", "City", { autoComplete: "address-level2" })}
            {field("state", "State / Province", { autoComplete: "address-level1" })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("postalCode", "Postal code", { autoComplete: "postal-code" })}
            <label className="block text-sm font-semibold" htmlFor="shipping-country">Country
              <select id="shipping-country" name="country" value={shipping.country} onChange={(event) => updateShipping("country", event.target.value)} autoComplete="country-name" aria-invalid={Boolean(fieldErrors.country)} aria-describedby={fieldErrors.country ? "shipping-country-error" : undefined} className={`field mt-2 ${fieldErrors.country ? "field-error" : ""}`}>
                <option value="">Select a country</option>
                {countries.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
              {fieldErrors.country && <span id="shipping-country-error" className="mt-1 block text-xs text-red-700 dark:text-red-300">{fieldErrors.country}</span>}
            </label>
          </div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-base font-bold">Payment method</legend>
          {checkoutPaymentOptions.map((option) => <label key={option.value} className={`flex items-start gap-3 border p-4 ${option.available ? "cursor-pointer border-zinc-400 dark:border-zinc-600" : "cursor-not-allowed border-zinc-200 opacity-60 dark:border-zinc-800"}`}>
            <input type="radio" name="payment-method" value={option.value} checked={paymentMethod === option.value} disabled={!option.available || busy || syncing} onChange={() => option.available && setPaymentMethod(option.value)} className="mt-1 accent-black dark:accent-white"/>
            <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold"><span>{option.label}</span><span className="text-xs font-medium text-zinc-500">{option.available ? "Available" : "Coming soon"}</span></span>{!option.available && <span className="mt-1 block text-xs leading-5 text-zinc-500">Not connected yet. This option cannot be selected or submitted.</span>}</span>
          </label>)}
          <p className="text-xs leading-5 text-zinc-500">No card or banking credentials are collected here. Cash on Delivery is the only selectable payment method. The current order API does not persist that selection or initiate payment processing.</p>
        </fieldset>
      </div>
      <aside className="h-fit bg-zinc-100 p-6 dark:bg-zinc-900">
        <h2 className="font-bold">Order summary</h2>
        {cart.map((item) => <div key={item.variantId} className="mt-4 flex justify-between gap-4 text-sm"><span>{item.name} × {item.quantity}</span><span>{money(item.price * item.quantity)}</span></div>)}
        <div className="mt-5 border-y border-zinc-300 py-5 dark:border-zinc-700">
          <label htmlFor="coupon-code" className="block text-sm font-semibold">Coupon code</label>
          <div className="mt-2 flex gap-2">
            <input id="coupon-code" value={couponCode} disabled={Boolean(appliedCoupon) || couponBusy || busy} onChange={(event) => { setCouponCode(event.target.value); setCouponFeedback(null); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyCoupon(); } }} placeholder="Enter code" autoComplete="off" className="field min-w-0 flex-1"/>
            {appliedCoupon ? <button type="button" disabled={couponBusy || busy} onClick={removeCoupon} className="min-h-11 border border-zinc-400 px-3 text-sm font-semibold hover:bg-zinc-200 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800">Remove</button> : <button type="button" disabled={!couponCode.trim() || couponBusy || busy} onClick={applyCoupon} className="min-h-11 bg-black px-4 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200">{couponBusy ? "Checking…" : "Apply"}</button>}
          </div>
          {couponFeedback && <p role="status" className={`mt-2 text-xs leading-5 ${couponFeedback.type === "error" ? "text-red-700 dark:text-red-300" : "text-zinc-600 dark:text-zinc-400"}`}>{couponFeedback.message}</p>}
          {appliedCoupon && <p className="mt-2 text-xs text-zinc-500">{appliedCoupon.minimumOrderAmount != null ? `Minimum order: ${money(appliedCoupon.minimumOrderAmount)}. ` : ""}Remove this coupon to place an order until coupon usage can be persisted with the order.</p>}
        </div>
        <div className="flex justify-between pt-5 text-sm"><span className="text-zinc-500">Items total</span><span>{money(total)}</span></div>
        {appliedCoupon && <div className="mt-2 flex justify-between gap-3 text-sm"><span className="text-zinc-500">Coupon</span><span className="font-medium">{appliedCoupon.code}</span></div>}
        <p className="mt-2 text-xs text-zinc-500">Shipping and final discount are calculated by the server.</p>
        <Button disabled={busy || syncing || couponBusy} className="mt-6 w-full">{busy || syncing ? "Preparing order…" : couponBusy ? "Checking coupon…" : "Place order"}</Button>
      </aside>
    </form>
  </Page>;
}

export function AccountPage() { const { user } = useContext(StoreContext); const [profile, setProfile] = useState(null); const [addresses, setAddresses] = useState([]); const [error, setError] = useState(""); const [saved, setSaved] = useState(""); const [form, setForm] = useState({ street: "", city: "", state: "", postalCode: "", country: "", addressType: "Home", isDefault: false }); const load = () => Promise.all([accountApi.profile(), accountApi.addresses()]).then(([p, a]) => { setProfile(p); setAddresses(a); }).catch((e) => setError(messageFrom(e))); useEffect(() => { load(); }, []); if (!user) return <Navigate to="/login?returnTo=/account" replace/>; if (!profile && !error) return <Loading/>; const saveProfile = async (e) => { e.preventDefault(); setSaved(""); try { const p = await accountApi.updateProfile(profile); setProfile(p); setSaved("Profile saved."); } catch (err) { setError(messageFrom(err)); } }; const addAddress = async (e) => { e.preventDefault(); try { await accountApi.createAddress({ ...form, userId: user.id }); setForm({ street: "", city: "", state: "", postalCode: "", country: "", addressType: "Home", isDefault: false }); load(); } catch (err) { setError(messageFrom(err)); } }; return <Page eyebrow="Account" title="Your details">{error && <Notice>{error}</Notice>}{saved && <Notice type="info">{saved}</Notice>}<div className="mt-10 grid gap-12 lg:grid-cols-2"><form onSubmit={saveProfile} className="space-y-4"><h2 className="text-lg font-bold">Profile</h2>{profile && <><div className="grid gap-4 sm:grid-cols-2"><Input label="First name" value={profile.firstName} onChange={(v) => setProfile({ ...profile, firstName: v })}/><Input label="Last name" value={profile.lastName} onChange={(v) => setProfile({ ...profile, lastName: v })}/></div><Input label="Username" value={profile.username} onChange={(v) => setProfile({ ...profile, username: v })}/><Input label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })}/><Input label="Phone number" value={profile.phoneNumber} onChange={(v) => setProfile({ ...profile, phoneNumber: v })}/><Button>Save profile</Button></>}</form><div><h2 className="text-lg font-bold">Saved addresses</h2><div className="mt-4 space-y-3">{addresses.map((a) => <div key={a.id} className="border border-zinc-200 p-4 text-sm dark:border-zinc-800"><div className="flex justify-between"><p>{a.street}<br/>{a.city}, {a.state} {a.postalCode}<br/>{a.country}</p><button onClick={() => accountApi.deleteAddress(a.id).then(load).catch((e) => setError(messageFrom(e)))} className="text-zinc-500 underline">Remove</button></div>{a.isDefault ? <p className="mt-3 text-xs font-bold uppercase tracking-wider">Default</p> : <button onClick={() => accountApi.setDefaultAddress(a.id, user.id).then(load).catch((e) => setError(messageFrom(e)))} className="mt-3 text-xs underline">Set default</button>}</div>)}</div><form onSubmit={addAddress} className="mt-6 grid gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800"><Input label="Street" value={form.street} onChange={(v) => setForm({ ...form, street: v })}/><div className="grid gap-3 sm:grid-cols-2"><Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })}/><Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })}/><Input label="Postal code" value={form.postalCode} onChange={(v) => setForm({ ...form, postalCode: v })}/><Input label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })}/></div><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}/> Set as default</label><Button className="w-fit">Add address</Button></form></div></div></Page>; }

const orderDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Date unavailable";
const OrderStatus = ({ status }) => <span className="inline-flex rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold dark:border-zinc-700">{status ? status.replaceAll("_", " ") : "Status not provided"}</span>;
const OrderItems = ({ items }) => items?.length ? <div className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">{items.map((item, index) => <div key={item.id ?? index} className="flex min-w-0 items-center gap-4 py-4">
  <img src={item.productImageUrl || imageOf(null)} alt={item.productName || ""} onError={(event) => { event.currentTarget.src = imageOf(null); }} className="h-16 w-14 shrink-0 bg-zinc-100 object-cover dark:bg-zinc-900"/>
  <div className="min-w-0 flex-1"><p className="break-words font-semibold">{item.productName || "Product information unavailable"}</p>{(item.variantName || item.variantSku) && <p className="mt-1 break-words text-sm text-zinc-500">{item.variantName || item.variantSku}</p>}
    <p className="mt-1 text-sm text-zinc-500">Quantity: {item.quantity ?? "Not provided"}{item.unitPrice != null && <> · {money(item.unitPrice)} each</>}</p>
  </div>
  <div className="shrink-0 text-right"><span className="block text-xs text-zinc-500">Line subtotal</span><span className="text-sm font-semibold">{item.subTotal != null ? money(item.subTotal) : "Not provided"}</span></div>
</div>)}</div> : <p className="mt-3 text-sm text-zinc-500">No purchased items were included in this order response.</p>;

export function OrdersPage() {
  const { user } = useContext(StoreContext);
  const location = useLocation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user) accountApi.orders().then(setOrders).catch((err) => setError(messageFrom(err)));
  }, [user]);
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`} replace state={{ notice: "Sign in to view your orders." }}/>;
  if (error) return <Page eyebrow="Account" title="Order history"><Notice>{error}</Notice></Page>;
  if (!orders) return <Loading/>;
  return <Page eyebrow="Account" title="Order history">
    <div className="mt-8 flex flex-wrap items-end justify-between gap-3"><p className="text-sm text-zinc-500">Orders placed with your account</p><Link to="/shop" className="text-sm font-semibold underline underline-offset-4">Continue shopping</Link></div>
    {orders.length ? <div className="mt-5 space-y-3">{orders.map((order) => <article key={order.id} className="border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{orderDate(order.orderDate)}</p><h2 className="mt-1 text-lg font-bold">{order.orderNumber != null ? `Order #${order.orderNumber}` : "Order record"}</h2><p className="mt-1 text-sm text-zinc-500">Record ID: {order.id}</p></div>
        <div className="flex flex-wrap items-center gap-4"><OrderStatus status={order.status}/><div className="sm:text-right"><p className="text-xs text-zinc-500">Total</p><p className="mt-1 font-bold">{order.totalAmount != null ? money(order.totalAmount) : "Not provided"}</p></div><Link to={`/orders/${order.id}`} className="inline-flex min-h-10 items-center justify-center border border-zinc-300 px-4 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">View details</Link></div>
      </div>
    </article>)}</div> : <div className="mt-8 border-y border-zinc-200 py-12 text-center dark:border-zinc-800"><p className="font-semibold">No orders yet</p><p className="mt-2 text-sm text-zinc-500">Orders you place will appear here.</p><Link to="/shop" className="mt-5 inline-flex min-h-11 items-center bg-black px-5 text-sm font-semibold text-white dark:bg-white dark:text-black">Browse the collection</Link></div>}
  </Page>;
}

export function OrderPage() {
  const { id } = useParams();
  const { user } = useContext(StoreContext);
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (user) accountApi.order(id).then((loadedOrder) => {
      if (active) {
        setError("");
        setOrder(loadedOrder);
      }
    }).catch((err) => { if (active) setError(messageFrom(err)); });
    return () => { active = false; };
  }, [id, user]);
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`} replace state={{ notice: "Sign in to view this order." }}/>;
  if (error) return <Page eyebrow="Account" title="Could not load order"><Notice>{error}</Notice><Link to="/orders" className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Back to orders</Link></Page>;
  if (!order || String(order.id) !== String(id)) return <Loading/>;
  const breakdown = [["Subtotal", order.subTotal], ["Shipping", order.shippingFee], ["Discount", order.discountAmount]];
  return <Page eyebrow="Order details" title={order.orderNumber != null ? `Order #${order.orderNumber}` : "Order details"}>
    <div className="mt-8 w-full min-w-0 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-zinc-200 py-5 dark:border-zinc-800"><div><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Placed {orderDate(order.orderDate)}</p><p className="mt-1 text-sm text-zinc-500">Record ID: {order.id}</p></div><OrderStatus status={order.status}/></div>
      <section className="min-w-0 border-b border-zinc-200 py-6 dark:border-zinc-800"><h2 className="font-bold">Items</h2><OrderItems items={order.orderItems}/></section>
      <section className="min-w-0 border-b border-zinc-200 py-6 dark:border-zinc-800"><h2 className="font-bold">Shipping address</h2><p className="mt-2 break-words [overflow-wrap:anywhere] whitespace-pre-line text-sm leading-6 text-zinc-600 dark:text-zinc-400">{order.shippingAddress || "Not provided"}</p></section>
      <section className="py-6"><h2 className="font-bold">Order total</h2><dl className="mt-3 space-y-2 text-sm">{breakdown.map(([label, amount]) => amount != null && <div key={label} className="flex justify-between gap-4"><dt className="text-zinc-500">{label}</dt><dd>{money(amount)}</dd></div>)}<div className="flex justify-between gap-4 border-t border-zinc-200 pt-3 text-base font-bold dark:border-zinc-800"><dt>Total</dt><dd>{order.totalAmount != null ? money(order.totalAmount) : "Not provided"}</dd></div></dl></section>
      <div className="mt-3 flex flex-wrap gap-3"><Link to="/orders" className="inline-flex min-h-11 items-center justify-center border border-zinc-300 px-5 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">Back to order history</Link><Link to="/shop" className="inline-flex min-h-11 items-center px-4 text-sm font-semibold underline underline-offset-4">Continue shopping</Link></div>
    </div>
  </Page>;
}

export function BrowsePage({ type }) { const { categories, brands, loading, error } = useCatalogue(); const navigate = useNavigate(); if (loading) return <Loading/>; const items = type === "categories" ? categories : brands; const label = type === "categories" ? "Categories" : "Brands"; return <Page eyebrow="Discover" title={label}>{error && <Notice>{error}</Notice>}<div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <button key={item.id} onClick={() => navigate(`/shop?${type === "categories" ? "category" : "brand"}=${item.id}`)} className="group border border-zinc-200 p-6 text-left hover:border-black dark:border-zinc-800 dark:hover:border-white"><p className="text-xl font-semibold">{item.name}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">{item.description || `Shop ${item.name}`}</p><p className="mt-8 text-xs font-bold uppercase tracking-wider">Explore →</p></button>)}</div>{!items.length && <p className="mt-10 text-zinc-500">No {label.toLowerCase()} are available.</p>}</Page>; }

export function WishlistPage() { const [wishlists, setWishlists] = useState(null); const [products, setProducts] = useState([]); const [error, setError] = useState(""); const { user } = useContext(StoreContext); const load = () => accountApi.wishlists().then(async (lists) => { setWishlists(lists); const ids = [...new Set(lists.flatMap((list) => list.productIds || []))]; const loaded = await Promise.all(ids.map((id) => catalogueApi.product(id).catch(() => null))); setProducts(loaded.filter(Boolean)); }).catch((e) => setError(messageFrom(e))); useEffect(() => { if (user) load(); }, [user]); if (!user) return <Navigate to="/login?returnTo=/wishlist" replace/>; if (error) return <Page eyebrow="Account" title="Wishlist"><Notice>{error}</Notice><p className="mt-4 text-sm text-zinc-500">The backend requires at least one product when creating a wishlist. Add a product from the shop to start one.</p></Page>; if (!wishlists) return <Loading/>; return <Page eyebrow="Account" title="Wishlist">{products.length ? <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p}/>)}</div> : <div className="mt-10 border-y border-zinc-200 py-16 text-center dark:border-zinc-800"><p className="text-zinc-500">Your wishlist is empty.</p><Link to="/shop" className="mt-5 inline-block underline underline-offset-4">Explore the collection</Link></div>}<p className="mt-8 text-xs text-zinc-500">The current API supports named wishlists; saving from product cards will be enabled when a default wishlist is present.</p></Page>; }
