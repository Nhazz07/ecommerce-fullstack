import { LockKeyhole } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AdminContext } from "./AdminContext";
import { adminError } from "./api";

export function AdminLogin() {
  const { admin, checking, signIn } = useContext(AdminContext); const navigate = useNavigate(); const [form, setForm] = useState({ email: "", password: "" }); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  if (admin) return <Navigate to="/admin" replace/>;
  const submit = async (event) => { event.preventDefault(); if (!form.email.trim() || !form.password) { setError("Email and password are required."); return; } setBusy(true); setError(""); try { await signIn({ email: form.email.trim(), password: form.password }); navigate("/admin", { replace: true }); } catch (err) { setError(adminError(err)); } finally { setBusy(false); } };
  return <div className="admin-login">
    <form onSubmit={submit} className="admin-login-card">
      <div className="admin-login-mark"><LockKeyhole size={22}/>
      </div>
      <p className="admin-kicker">Anteiku Shop</p>
      <h1>Administrator sign in</h1>
      <p>Use the administrator account configured for this store.</p>
      {error && <div role="alert" className="admin-alert error">{error}</div>}
      <label>Email
        <input type="email" value={form.email} autoComplete="email" onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={busy || checking}/>
      </label>
      <label>Password
        <input type="password" value={form.password} autoComplete="current-password" onChange={(e) => setForm({ ...form, password: e.target.value })} disabled={busy || checking}/>
      </label>
      <button disabled={busy || checking}>{busy ? "Verifying access…" : "Sign in"}</button>
      <small>Access is checked against an administrator-only backend endpoint.</small>
    </form>
  </div>;
}
