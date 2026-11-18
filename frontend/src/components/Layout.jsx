/* eslint-disable react-refresh/only-export-components */
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
  ArrowRight,
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
  const { cart, user, signOut, openCartDrawer, wishlists } = useContext(StoreContext);
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
    { label: "Shop All", to: "/shop" },
    { label: "Categories", to: "/categories" },
    { label: "Brands", to: "/brands" },
    { label: "Series", to: "/series" },
    ...(user ? [{ label: "Orders", to: "/orders" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white text-black selection:bg-black selection:text-white">
      {/* Minimalist Top Announcement Bar - Black with White text */}
      <aside aria-label="Announcement" className="relative z-40 bg-black py-2 text-center text-[11px] font-medium tracking-[0.2em] uppercase text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
          <span className="flex items-center gap-3">
            <span>Complimentary Express Shipping On Orders Over $150</span>
            <span className="hidden sm:inline text-neutral-500">/</span>
            <span className="hidden sm:inline text-neutral-300">100% Guaranteed Japanese Authenticity</span>
          </span>
        </div>
      </aside>

      {/* Main Sticky Header - Clean White with Light Gray Border */}
      <header className="sticky top-0 z-30 border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md transition-all duration-200">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex flex-col tracking-tight group">
              <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-black">
                ANTEIKU
              </span>
              <span className="-mt-1 text-[9px] font-medium uppercase tracking-[0.35em] text-[#737373]">
                Tokyo Archive
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-[0.14em] uppercase">
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative py-2 transition-colors duration-150 ${
                      isActive
                        ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black"
                        : "text-[#737373] hover:text-black"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Action Icons: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Input / Toggle */}
            {searchOpen ? (
              <form onSubmit={goSearch} className="relative hidden sm:flex items-center animate-in fade-in duration-150">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search products or series..."
                  className="h-9 w-64 border border-black bg-white pl-3 pr-8 text-xs text-black placeholder:text-[#737373] outline-none focus:w-80 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 text-[#737373] hover:text-black"
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
                <Search size={18} strokeWidth={1.75} />
              </button>
            )}

            {/* Wishlist Link */}
            <Link
              aria-label="Wishlist"
              to="/wishlist"
              className="relative icon-button"
              title="Saved Wishlist"
            >
              <Heart size={18} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[9px] font-bold text-white">
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
                  className={`icon-button ${accountOpen ? "bg-[#F5F5F5]" : ""}`}
                >
                  <User size={18} strokeWidth={1.75} />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    aria-label="Account options"
                    className="absolute right-0 top-full z-40 mt-1 w-56 border border-[#E5E5E5] bg-white p-2 shadow-lg animate-in fade-in duration-100"
                  >
                    <div className="border-b border-[#E5E5E5] px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                        Account
                      </p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-black">
                        {user.username || user.email || "Collector"}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        role="menuitem"
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-[#F5F5F5] transition-colors"
                      >
                        <User size={14} className="text-black" />
                        <span>Profile & Addresses</span>
                      </Link>
                      <Link
                        role="menuitem"
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Package size={14} className="text-black" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        role="menuitem"
                        to="/wishlist"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Heart size={14} className="text-black" />
                        <span>Wishlist</span>
                      </Link>
                    </div>

                    <div className="border-t border-[#E5E5E5] pt-1">
                      <button
                        role="menuitem"
                        type="button"
                        onClick={logOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-[#F5F5F5] hover:text-black transition-colors"
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
              className="relative icon-button"
              title="Shopping Bag"
            >
              <ShoppingBag size={18} strokeWidth={1.75} />
              {count > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[9px] font-bold text-white">
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
          <div className="border-t border-[#E5E5E5] bg-white px-4 py-6 md:hidden animate-in slide-in-from-top-1 duration-150">
            {/* Mobile Search Bar */}
            <form onSubmit={goSearch} className="mb-5 flex border border-[#E5E5E5] bg-white focus-within:border-black">
              <input
                aria-label="Search products"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs text-black placeholder:text-[#737373] outline-none"
                placeholder="Search collection..."
              />
              <button type="submit" aria-label="Search" className="px-3 text-black hover:bg-[#F5F5F5]">
                <Search size={16} />
              </button>
            </form>

            <nav aria-label="Mobile Navigation" className="divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
              {links.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-3.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                      isActive ? "text-black font-bold" : "text-[#737373] hover:text-black"
                    }`
                  }
                >
                  <span>{label}</span>
                  <ArrowRight size={14} className="text-[#737373]" />
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-xs font-semibold text-black"
                  >
                    <User size={15} />
                    <span>My Account ({user.username || user.email})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logOut}
                    className="flex items-center gap-2 py-2 text-left text-xs font-medium text-[#737373] hover:text-black"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 border border-black bg-black py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors"
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

      {/* Minimalist Black Footer with White Typography */}
      <footer className="mt-28 w-full border-t border-black bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16">
            {/* Brand Information */}
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold tracking-[0.25em] text-white">
                  ANTEIKU
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.35em] text-neutral-400">
                  Tokyo Anime Collection
                </span>
              </Link>
              <p className="max-w-md text-xs leading-relaxed text-neutral-400">
                Curated official Japanese anime collectables, museum-grade statues,
                and limited edition figures. Built on uncompromising authenticity,
                monochromatic design, and meticulous craftsmanship.
              </p>
              <div className="pt-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-300">
                Official Studio Licensed Products
              </div>
            </div>

            {/* Explore Column */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Collection
              </p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/shop" className="text-neutral-400 hover:text-white transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-neutral-400 hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/brands" className="text-neutral-400 hover:text-white transition-colors">
                    Official Brands
                  </Link>
                </li>
                <li>
                  <Link to="/series" className="text-neutral-400 hover:text-white transition-colors">
                    Anime Series
                  </Link>
                </li>
              </ul>
            </div>

            {/* Client Services & Links */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Client Services
              </p>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/orders" className="text-neutral-400 hover:text-white transition-colors">
                    Order Tracking
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-neutral-400 hover:text-white transition-colors">
                    Saved Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="text-neutral-400 hover:text-white transition-colors">
                    Account Details
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-neutral-400 hover:text-white transition-colors">
                    Shopping Bag
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Navigation */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 sm:flex-row text-[11px] text-neutral-500">
            <p>© {new Date().getFullYear()} ANTEIKU. All rights reserved.</p>
            <p className="tracking-wider text-neutral-400">
              Clean. Modern. Monochromatic.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
