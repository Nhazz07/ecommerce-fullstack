import { BrowserRouter, Link, Route, Routes, useSearchParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { StoreProvider } from "./context/StoreContext";
import { BrowsePage, CartPage, CheckoutPage, HomePage, LoginPage, OrderPage, OrdersPage, ProductPage, ProductReviewsPage, RegisterPage, SeriesDetailPage, SeriesPage, ShopPage } from "./pages/Storefront";
import { AccountPage } from "./pages/AccountPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AdminProvider } from "./admin/AdminContext";
import { AdminGate, AdminLayout } from "./admin/AdminLayout";
import { AdminLogin } from "./admin/AdminLogin";
import { BrandsPage, CategoriesPage, CouponsPage, CustomersPage, InventoryPage, OrdersPage as AdminOrdersPage, OverviewPage, ProductVariantsPage, ProductsPage } from "./admin/AdminPages";

function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white">
        Page not found
      </h1>
      <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
        The archive entry or page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center border border-zinc-950 bg-zinc-950 px-7 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}

function SessionExpiredNotice() {
  const [params] = useSearchParams();
  if (params.get("reason") !== "session-expired") return null;
  return (
    <p
      role="alert"
      className="mx-auto mt-6 max-w-md border border-zinc-300 bg-zinc-50 px-4 py-3 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
    >
      Your session expired. Please sign in again to continue.
    </p>
  );
}

function StorefrontRoutes() {
  return (
    <StoreProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<><ProductPage /><ProductReviewsPage /></>} />
          <Route path="/categories" element={<BrowsePage type="categories" />} />
          <Route path="/brands" element={<BrowsePage type="brands" />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/series/:id" element={<SeriesDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<><SessionExpiredNotice /><LoginPage /></>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </StoreProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminProvider><AdminLogin /></AdminProvider>} />
        <Route path="/admin" element={<AdminProvider><AdminGate /></AdminProvider>}>
          <Route element={<AdminLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="product-variants" element={<ProductVariantsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="coupons" element={<CouponsPage />} />
          </Route>
        </Route>
        <Route path="/*" element={<StorefrontRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
