import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { StoreProvider } from "./context/StoreContext";
import { BrowsePage, CartPage, CheckoutPage, HomePage, LoginPage, OrderPage, OrdersPage, ProductPage, ProductReviewsPage, RegisterPage, SeriesDetailPage, SeriesPage, ShopPage } from "./pages/Storefront";
import { AccountPage } from "./pages/AccountPage";
import { WishlistPage } from "./pages/WishlistPage";
import { AdminProvider } from "./admin/AdminContext";
import { AdminGate, AdminLayout } from "./admin/AdminLayout";
import { AdminLogin } from "./admin/AdminLogin";
import { BrandsPage, CategoriesPage, CouponsPage, CustomersPage, InventoryPage, OrdersPage as AdminOrdersPage, OverviewPage, ProductsPage } from "./admin/AdminPages";

function NotFound() { return <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6"><p className="text-sm text-zinc-500">404</p><h1 className="mt-2 text-4xl font-bold">Page not found</h1></div>; }

function SessionExpiredNotice() {
  const [params] = useSearchParams();
  if (params.get("reason") !== "session-expired") return null;
  return <p role="alert" className="mx-auto mt-6 max-w-md border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">Your session expired. Please sign in again to continue.</p>;
}

function StorefrontRoutes() {
  return <StoreProvider><Layout><Routes>
    <Route path="/" element={<HomePage/>}/><Route path="/shop" element={<ShopPage/>}/><Route path="/product/:id" element={<><ProductPage/><ProductReviewsPage/></>}/>
    <Route path="/categories" element={<BrowsePage type="categories"/>}/><Route path="/brands" element={<BrowsePage type="brands"/>}/><Route path="/series" element={<SeriesPage/>}/><Route path="/series/:id" element={<SeriesDetailPage/>}/><Route path="/cart" element={<CartPage/>}/><Route path="/checkout" element={<CheckoutPage/>}/>
    <Route path="/login" element={<><SessionExpiredNotice/><LoginPage/></>}/><Route path="/register" element={<RegisterPage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/wishlist" element={<WishlistPage/>}/><Route path="/orders" element={<OrdersPage/>}/><Route path="/orders/:id" element={<OrderPage/>}/><Route path="*" element={<NotFound/>}/>
  </Routes></Layout></StoreProvider>;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/admin/login" element={<AdminProvider><AdminLogin/></AdminProvider>}/>
    <Route path="/admin" element={<AdminProvider><AdminGate/></AdminProvider>}>
      <Route element={<AdminLayout/>}><Route index element={<OverviewPage/>}/><Route path="products" element={<ProductsPage/>}/><Route path="orders" element={<AdminOrdersPage/>}/><Route path="customers" element={<CustomersPage/>}/><Route path="categories" element={<CategoriesPage/>}/><Route path="brands" element={<BrandsPage/>}/><Route path="inventory" element={<InventoryPage/>}/><Route path="coupons" element={<CouponsPage/>}/></Route>
    </Route>
    <Route path="/*" element={<StorefrontRoutes/>}/>
  </Routes></BrowserRouter>;
}
