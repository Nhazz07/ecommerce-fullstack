import { Boxes, ChevronDown, LayoutDashboard, LogOut, Menu, Package, ReceiptText, Tags, Users, Warehouse, X } from "lucide-react";
import { useContext, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { AdminContext } from "./AdminContext";

const links = [
  ["Overview", "/admin", LayoutDashboard], ["Products", "/admin/products", Package], ["Orders", "/admin/orders", ReceiptText],
  ["Customers", "/admin/customers", Users], ["Categories", "/admin/categories", Tags], ["Brands", "/admin/brands", Boxes],
  ["Inventory", "/admin/inventory", Warehouse], ["Coupons", "/admin/coupons", Tags],
];

export function AdminGate() {
  const { admin, checking } = useContext(AdminContext);
  if (checking) return <div className="admin-loading">Checking administrator access…</div>;
  return admin ? <Outlet/> : <Navigate to="/admin/login" replace/>;
}

export function AdminLayout() {
  const { admin, signOut } = useContext(AdminContext); const [open, setOpen] = useState(false); const [menu, setMenu] = useState(false);
  const close = () => setOpen(false);
  return <div className="admin-shell">
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
    <div className="admin-brand">
      <span>ANTEIKU</span>
      <button className="admin-mobile-close" onClick={close} aria-label="Close navigation"><X size={18}/>
      </button>
    </div>
    <p className="admin-kicker">Management</p>
      <nav>{links.map(([label, to, Icon]) => <NavLink end={to === "/admin"} key={to} to={to} onClick={close} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}><Icon size={18}/>{label}</NavLink>)}</nav>
    <p className="admin-sidebar-note">Anteiku Shop<br/><span>Administrator console</span></p>
  </aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu-button" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={21}/></button><div><p className="admin-kicker">Anteiku Shop</p><h1>Admin dashboard</h1></div><div className="admin-account"><button onClick={() => setMenu(!menu)} className="admin-account-button"><span>{admin?.username?.slice(0, 1).toUpperCase() || "A"}</span><b>{admin?.username || "Admin"}</b><ChevronDown size={15}/></button>{menu && <div className="admin-account-menu"><p>{admin?.email}</p><button onClick={signOut}><LogOut size={15}/> Sign out</button></div>}</div></header><main className="admin-content"><Outlet/></main></div></div>;
}
