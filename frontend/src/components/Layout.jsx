/* eslint-disable react-refresh/only-export-components */
import {
  Compass,
  Heart,
  Layers,
  LogOut,
  Menu,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
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
  const { cart, user, theme, setTheme, signOut, openCartDrawer, wishlists } = useContext(StoreContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const searchInputRef = useRef(null);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Close mobile menu on route change
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
    { label: "Collection", to: "/shop" },
    { label: "Categories", to: "/categories" },
    { label: "Brands", to: "/brands" },
    { label: "Series", to: "/series" },
    ...(user ? [{ label: "Orders", to: "/orders" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-zinc-950 text-zinc-100 selection:bg-[#c5a880]/30 selection:text-[#dfc79b]">
      {/* Top Luxury Announcement Bar */}
      <aside aria-label="Announcement" className="relative z-40 border-b border-zinc-900 bg-black/90 py-1.5 text-center text-[10px] sm:text-[11px] font-medium tracking-[0.22em] uppercase text-zinc-400">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#c5a880]" />
            <span>Complimentary Express Worldwide Shipping Over $150</span>
            <span className="hidden md:inline text-zinc-600">·</span>
            <span className="hidden md:inline text-[#c5a880]">Direct from Tokyo</span>
            <span className="h-1 w-1 rounded-full bg-[#c5a880]" />
          </span>
        </div>
      </aside>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex flex-col tracking-tight">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.28em] text-zinc-100 transition-colors duration-200 group-hover:text-[#dfc79b]">
                ANTEIKU
              </span>
              <span className="-mt-1 text-[8px] font-semibold uppercase tracking-[0.38em] text-[#c5a880] opacity-80 group-hover:opacity-100 transition-opacity">
                Tokyo Archive
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 text-xs font-medium tracking-[0.16em] uppercase">
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative py-1 transition-colors duration-200 ${
                      isActive
                        ? "text-[#dfc79b] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#c5a880]"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Search Bar - Expandable Desktop */}
          <div className="flex items-center gap-2 sm:gap-3">
            {searchOpen ? (
              <form onSubmit={goSearch} className="relative hidden sm:flex items-center animate-in fade-in duration-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search archive or characters..."
                  className="h-9 w-64 border border-[#c5a880]/60 bg-zinc-900/90 pl-3 pr-8 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:w-80 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 text-zinc-400 hover:text-white"
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
                title="Search (Archive)"
              >
                <Search size={18} strokeWidth={1.75} />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="icon-button"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
            </button>

            {/* Wishlist Link */}
            <Link
              aria-label="Wishlist"
              to="/wishlist"
              className="relative icon-button"
              title="Saved Wishlist"
            >
              <Heart size={18} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c5a880] px-1 text-[9px] font-bold text-black">
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
                  className={`icon-button ${accountOpen ? "border border-[#c5a880]/60 text-[#dfc79b]" : ""}`}
                >
                  <User size={18} strokeWidth={1.75} />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    aria-label="Account options"
                    className="absolute right-0 top-full z-40 mt-2 w-56 border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in duration-150"
                  >
                    <div className="border-b border-zinc-800/80 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#c5a880]">
                        Signed In
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-zinc-200">
                        {user.username || user.email || "Collector"}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        role="menuitem"
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                      >
                        <User size={14} className="text-[#c5a880]" />
                        <span>Account & Addresses</span>
                      </Link>
                      <Link
                        role="menuitem"
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                      >
                        <Package size={14} className="text-[#c5a880]" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        role="menuitem"
                        to="/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                      >
                        <Heart size={14} className="text-[#c5a880]" />
                        <span>Saved Artefacts</span>
                      </Link>
                    </div>

                    <div className="border-t border-zinc-800/80 pt-1">
                      <button
                        role="menuitem"
                        type="button"
                        onClick={logOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition-colors"
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
                <User size={18} strokeWidth={1.75} />
              </Link>
            )}

            {/* Shopping Bag Button (Opens Drawer) */}
            <button
              type="button"
              aria-label="Open shopping bag"
              onClick={openCartDrawer}
              className="relative icon-button group"
              title="Shopping Bag"
            >
              <ShoppingBag size={18} strokeWidth={1.75} className="group-hover:text-[#dfc79b] transition-colors" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#dfc79b] to-[#c5a880] px-1 text-[9px] font-bold text-black shadow-[0_0_8px_rgba(197,168,128,0.4)]">
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
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Panel */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-6 md:hidden animate-in slide-in-from-top-2 duration-200">
            {/* Mobile Search Bar */}
            <form onSubmit={goSearch} className="mb-5 flex border border-zinc-700 bg-zinc-900">
              <input
                aria-label="Search products"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
                placeholder="Search collection..."
              />
              <button type="submit" aria-label="Search" className="px-3 text-[#c5a880] hover:text-white">
                <Search size={16} />
              </button>
            </form>

            <nav aria-label="Mobile Navigation" className="space-y-1 divide-y divide-zinc-900 border-y border-zinc-900 py-2">
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-3 text-xs uppercase tracking-[0.18em] transition-colors ${
                      isActive ? "text-[#dfc79b] font-bold" : "text-zinc-300 hover:text-white"
                    }`
                  }
                >
                  <span>{label}</span>
                  <span className="text-zinc-600">→</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-2 pt-2">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    <User size={15} className="text-[#c5a880]" />
                    <span>Manage Account ({user.username || user.email})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logOut}
                    className="flex items-center gap-2 py-2 text-left text-xs text-zinc-500 hover:text-red-400"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-zinc-700 bg-zinc-900 py-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-200 hover:border-[#c5a880]"
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

      {/* Luxury Editorial Footer */}
      <footer className="mt-28 w-full border-t border-zinc-800 bg-black text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-14">
            {/* Brand Manifesto */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <span className="font-serif text-2xl font-bold tracking-[0.28em] text-zinc-100">
                  ANTEIKU
                </span>
                <span className="block text-[9px] uppercase tracking-[0.38em] text-[#c5a880]">
                  Tokyo Connoisseur Archive
                </span>
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-zinc-400 font-sans">
                Curating authentic Japanese anime collectables, limited-edition statues,
                and high-fashion apparel. Inspired by the calm sanctuary of the 20th Ward.
              </p>
              <div className="flex items-center gap-3 pt-2 text-[11px] text-[#dfc79b]">
                <Sparkles size={14} />
                <span className="tracking-widest uppercase text-[10px]">100% Guaranteed Japanese Authenticity</span>
              </div>
            </div>

            {/* Navigation Column: Explore */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-200">
                The Archive
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/shop" className="hover:text-[#dfc79b] transition-colors">
                    Complete Collection
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="hover:text-[#dfc79b] transition-colors">
                    Curated Categories
                  </Link>
                </li>
                <li>
                  <Link to="/brands" className="hover:text-[#dfc79b] transition-colors">
                    Official Brands & Studios
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="hover:text-[#dfc79b] transition-colors">
                    Anime Series Index
                  </Link>
                </li>
              </ul>
            </div>

            {/* Client Services */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-200">
                Client Sanctuary
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/orders" className="hover:text-[#dfc79b] transition-colors">
                    Order Tracking
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-[#dfc79b] transition-colors">
                    Your Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="hover:text-[#dfc79b] transition-colors">
                    Account Details
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-[#dfc79b] transition-colors">
                    Shopping Bag
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 sm:flex-row text-[11px] text-zinc-600">
            <p>© {new Date().getFullYear()} ANTEIKU TOKYO. All rights reserved.</p>
            <p className="tracking-wider text-zinc-500">
              Handcrafted for anime connoisseurs and art collectors worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
