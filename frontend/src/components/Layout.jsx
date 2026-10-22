/* eslint-disable react-refresh/only-export-components */
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { StoreContext } from "../context/StoreContext";

export const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

export function Layout({ children }) {
  const { cart, user, theme, setTheme, signOut } = useContext(StoreContext);
  const [open, setOpen] = useState(false); const [accountOpen, setAccountOpen] = useState(false); const [term, setTerm] = useState(""); const navigate = useNavigate();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const goSearch = (event) => { event.preventDefault(); navigate(`/shop?q=${encodeURIComponent(term)}`); setOpen(false); };
  const logOut = () => { signOut(); setOpen(false); setAccountOpen(false); navigate("/", { replace: true }); };
  const links = [["Shop", "/shop"], ["Categories", "/categories"], ["Brands", "/brands"], ["Series", "/series"], ...(user ? [["Orders", "/orders"]] : [])];
  return <div className="flex min-h-screen flex-col overflow-x-clip bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-xl font-black tracking-[0.25em]">ANTEIKU</Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">{links.map(([label, to]) => <NavLink key={to} to={to} className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">{label}</NavLink>)}</nav>
        <div className="flex items-center gap-1">
          <button aria-label="Toggle theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="icon-button">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button>
          <Link aria-label="Wishlist" to="/wishlist" className="icon-button"><Heart size={19} /></Link>
          {user ? <div className="relative hidden md:block">
            <button type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)} className="icon-button"><UserRound size={19} /></button>
            {accountOpen && <div role="menu" aria-label="Account" className="absolute right-0 top-full z-40 mt-2 w-44 border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <Link role="menuitem" to="/account" onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Your account</Link>
              <Link role="menuitem" to="/orders" onClick={() => setAccountOpen(false)} className="block px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Orders</Link>
              <button role="menuitem" type="button" onClick={logOut} className="block w-full px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Sign out</button>
            </div>}
          </div> : <Link aria-label="Account" to="/login" className="icon-button"><UserRound size={19} /></Link>}
          {user && <Link aria-label="Account" to="/account" className="icon-button md:hidden"><UserRound size={19} /></Link>}
          <Link aria-label="Shopping cart" to="/cart" className="relative icon-button"><ShoppingBag size={19} />{count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[10px] text-white dark:bg-white dark:text-black">{count}</span>}</Link>
          <button aria-label="Open menu" onClick={() => setOpen(!open)} className="icon-button md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800 md:hidden"><form onSubmit={goSearch} className="mb-4 flex border border-zinc-300 dark:border-zinc-700"><input aria-label="Search products" value={term} onChange={(e) => setTerm(e.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" placeholder="Search"/><button className="px-3"><Search size={17}/></button></form>{links.map(([label, to]) => <NavLink onClick={() => setOpen(false)} key={to} to={to} className="block py-2 font-medium">{label}</NavLink>)}{user && <button type="button" onClick={logOut} className="py-2 text-sm text-zinc-500">Sign out</button>}</div>}
    </header>
    <main className="w-full min-w-0 flex-1">{children}</main>
    <footer className="mt-20 w-full min-w-0 border-t border-zinc-200 dark:border-zinc-800"><div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-3 px-4 py-10 text-sm text-zinc-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6"><span className="font-bold tracking-[0.16em] text-zinc-900 dark:text-white">ANTEIKU</span><span className="max-w-full break-words">Curated anime collectables, figures and apparel.</span></div></footer>
  </div>;
}
