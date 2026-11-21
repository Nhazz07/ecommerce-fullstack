/* eslint-disable react-refresh/only-export-components */
import {
  ArrowRight,
  Heart,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sun,
  User,
  X,
} from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { StoreContext } from "../context/StoreContext";
import { CartDrawer } from "./CartDrawer";
import { QuickViewModal } from "./QuickViewModal";
import { ToastContainer } from "./Toast";

export const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

export function Layout({ children }) {
  const { cart, user, signOut, openCartDrawer, wishlists, theme, setTheme } = useContext(StoreContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const searchInputRef = useRef(null);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = theme === "dark";
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlists
    ? wishlists.reduce((total, list) => total + (list.productIds?.length || 0), 0)
    : 0;

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const goSearch = (event) => {
    event.preventDefault();
    if (!term.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(term.trim())}`);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return !prev;
    });
  };

  const logOut = () => {
    signOut();
    setMobileMenuOpen(false);
    setAccountOpen(false);
    navigate("/", { replace: true });
  };

  const links = [
    { label: "Shop", to: "/shop" },
    { label: "Categories", to: "/categories" },
    { label: "Brands", to: "/brands" },
    { label: "Series", to: "/series" },
    ...(user ? [{ label: "Orders", to: "/orders" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 selection:bg-zinc-950 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950 transition-colors duration-200">
      {/* Top Announcement Bar */}
      <aside
        aria-label="Announcement"
        className="relative z-40 border-b border-zinc-200 bg-zinc-100 py-2 text-center text-[10px] font-medium tracking-[0.22em] uppercase text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
          <span className="flex items-center gap-3">
            <span>Complimentary Express Shipping Over $150</span>
            <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">/</span>
            <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">Authenticated Japanese Editions</span>
          </span>
        </div>
      </aside>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex flex-col tracking-tight group">
              <span className="font-display text-lg sm:text-xl font-bold tracking-[0.26em] text-zinc-950 dark:text-white">
                ANTEIKU
              </span>
              <span className="-mt-0.5 text-[8px] font-semibold uppercase tracking-[0.38em] text-zinc-500 dark:text-zinc-400">
                Tokyo Archive
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-7 text-[11px] font-semibold tracking-[0.16em] uppercase"
            >
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative py-2 transition-colors duration-150 ${
                      isActive
                        ? "text-zinc-950 dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-zinc-950 dark:after:bg-white"
                        : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Action Bar: Search, Theme Switcher, Wishlist, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search Input / Toggle */}
            {searchOpen ? (
              <form onSubmit={goSearch} className="relative hidden sm:flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search archive..."
                  className="h-9 w-56 lg:w-64 border border-zinc-950 bg-white pl-3 pr-8 text-xs text-zinc-950 placeholder:text-zinc-400 outline-none dark:border-zinc-200 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="absolute right-2 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                aria-label="Open search bar"
                onClick={handleSearchToggle}
                className="icon-button hidden sm:grid"
                title="Search"
              >
                <Search size={17} strokeWidth={1.75} />
              </button>
            )}

            {/* Theme Mode Switcher Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDark}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex h-9 items-center gap-2 border border-zinc-200 bg-zinc-50 px-2.5 sm:px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-900 hover:border-zinc-950 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? (
                <>
                  <Sun size={14} strokeWidth={1.9} />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon size={14} strokeWidth={1.9} />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Wishlist Link */}
            <Link
              aria-label="Wishlist"
              to="/wishlist"
              className="relative icon-button"
              title="Saved Wishlist"
            >
              <Heart size={17} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center bg-zinc-950 px-1 text-[9px] font-bold text-white dark:bg-white dark:text-zinc-950">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Dropdown */}
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen(!accountOpen)}
                  className={`icon-button ${
                    accountOpen ? "bg-zinc-100 dark:bg-zinc-800" : ""
                  }`}
                >
                  <User size={17} strokeWidth={1.75} />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    aria-label="Account options"
                    className="absolute right-0 top-full z-40 mt-2 w-56 border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        Account
                      </p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-zinc-950 dark:text-white">
                        {user.username || user.email || "Collector"}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        role="menuitem"
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <User size={14} />
                        <span>Profile & Addresses</span>
                      </Link>
                      <Link
                        role="menuitem"
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <Package size={14} />
                        <span>Order History</span>
                      </Link>
                      <Link
                        role="menuitem"
                        to="/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <Heart size={14} />
                        <span>Wishlist</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-200 pt-1 dark:border-zinc-800">
                      <button
                        role="menuitem"
                        type="button"
                        onClick={logOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                aria-label="Sign in"
                to="/login"
                className="icon-button"
                title="Sign In"
              >
                <User size={17} strokeWidth={1.75} />
              </Link>
            )}

            {/* Shopping Bag Button */}
            <button
              type="button"
              aria-label="Open shopping bag"
              onClick={openCartDrawer}
              className="relative icon-button"
              title="Shopping Bag"
            >
              <ShoppingBag size={17} strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center bg-zinc-950 px-1 text-[9px] font-bold text-white dark:bg-white dark:text-zinc-950">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="icon-button md:hidden"
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white px-4 py-6 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
            <form
              onSubmit={goSearch}
              className="mb-5 flex border border-zinc-200 bg-white focus-within:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-zinc-200"
            >
              <input
                aria-label="Search products"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 outline-none dark:text-white dark:placeholder:text-zinc-500"
                placeholder="Search collection..."
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-3 text-zinc-950 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800"
              >
                <Search size={16} />
              </button>
            </form>

            <nav
              aria-label="Mobile Navigation"
              className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800"
            >
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                      isActive
                        ? "text-zinc-950 font-bold dark:text-white"
                        : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    }`
                  }
                >
                  <span>{label}</span>
                  <ArrowRight size={14} className="text-zinc-400" />
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-xs font-semibold text-zinc-950 dark:text-white"
                  >
                    <User size={15} />
                    <span>My Account ({user.username || user.email})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logOut}
                    className="flex items-center gap-2 py-2 text-left text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
                >
                  <User size={14} />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full min-w-0 flex-1">{children}</main>

      {/* Global Interactive Elements */}
      <CartDrawer />
      <QuickViewModal />
      <ToastContainer />

      {/* Minimalist Architectural Footer */}
      <footer className="mt-24 w-full border-t border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16">
            {/* Brand Information */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <span className="font-display text-2xl font-bold tracking-[0.26em] text-zinc-950 dark:text-white">
                  ANTEIKU
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.36em] text-zinc-500 dark:text-zinc-400">
                  Tokyo Anime Collection
                </span>
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Curated official Japanese anime collectables, museum-grade statues,
                and limited edition figures. Built on uncompromising authenticity,
                monochromatic clarity, and meticulous craftsmanship.
              </p>
              <div className="pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-200">
                Official Studio Licensed Products
              </div>
            </div>

            {/* Collection Column */}
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-950 dark:text-white">
                Collection
              </p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/shop" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/brands" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Official Brands
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Anime Series
                  </Link>
                </li>
              </ul>
            </div>

            {/* Client Services */}
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-950 dark:text-white">
                Client Services
              </p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/orders" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Order Tracking
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Saved Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Account Details
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Shopping Bag
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 sm:flex-row text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <p>© {new Date().getFullYear()} ANTEIKU. All rights reserved.</p>
            <p className="uppercase tracking-[0.18em] text-[10px]">
              Minimalist Monochrome Edition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
