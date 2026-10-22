import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { accountApi } from "../api/services";
import { messageFrom } from "../api/client";
import { StoreContext } from "../context/StoreContext";

const accountError = (error, method, endpoint) => {
  const status = error.response?.status;
  const request = `${method} ${endpoint}`;
  if (status === 401) return `${request} returned 401. Your session may have expired; sign in again to load account details.`;
  if (status === 403) return `${request} returned 403. The backend denied this request. Check that the current session has the CUSTOMER role and that its access token is valid.`;
  if (status >= 500) return `${request} returned ${status}. The account service is temporarily unavailable.`;
  if (!error.response) return `${request} could not reach the server. Check the API connection and try again.`;
  return `${request} failed: ${messageFrom(error)}`;
};

const Field = ({ label, value, onChange, type = "text" }) => <label className="block text-sm font-medium">{label}<input required type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="field mt-2"/></label>;
const Button = ({ children, className = "", ...props }) => <button className={`inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 ${className}`} {...props}>{children}</button>;
const Notice = ({ children, success = false }) => <p role="status" className={`mt-4 border px-4 py-3 text-sm ${success ? "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200" : "border-red-200 bg-red-50 text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200"}`}>{children}</p>;
const initialAddress = () => ({ street: "", city: "", state: "", postalCode: "", country: "", addressType: "Home", isDefault: false });

export function AccountPage() {
  const { user } = useContext(StoreContext);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [profileFeedback, setProfileFeedback] = useState("");
  const [addressFeedback, setAddressFeedback] = useState("");
  const [form, setForm] = useState(initialAddress);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) return () => { active = false; };

    accountApi.profile().then((result) => {
      if (active) { setProfile(result); setProfileError(""); }
    }).catch((error) => {
      if (active) setProfileError(accountError(error, "GET", "/api/users/me"));
    }).finally(() => { if (active) setProfileLoading(false); });

    accountApi.addresses().then((result) => {
      if (active) { setAddresses(Array.isArray(result) ? result : []); setAddressError(""); }
    }).catch((error) => {
      if (active) setAddressError(accountError(error, "GET", "/api/address"));
    }).finally(() => { if (active) setAddressesLoading(false); });

    return () => { active = false; };
  }, [user]);

  if (!user) return <Navigate to="/login?returnTo=/account" replace/>;

  const refreshAddresses = async () => {
    setAddressesLoading(true);
    try {
      const result = await accountApi.addresses();
      setAddresses(Array.isArray(result) ? result : []);
      setAddressError("");
      return true;
    } catch (error) {
      setAddressError(accountError(error, "GET", "/api/address"));
      return false;
    } finally {
      setAddressesLoading(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileError("");
    setProfileFeedback("");
    const payload = {
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
    };
    try {
      setProfile(await accountApi.updateProfile(payload));
      setProfileFeedback("Profile saved.");
    } catch (error) {
      setProfileError(accountError(error, "PUT", "/api/users/me"));
    } finally {
      setSavingProfile(false);
    }
  };

  const addAddress = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    setAddressError("");
    setAddressFeedback("");
    try {
      await accountApi.createAddress({ ...form, userId: user.id });
      setForm(initialAddress());
      const refreshed = await refreshAddresses();
      setAddressFeedback(refreshed ? "Address added." : "Address added, but the saved-address list could not be refreshed.");
    } catch (error) {
      setAddressError(accountError(error, "POST", "/api/address"));
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (addressId) => {
    setAddressError("");
    setAddressFeedback("");
    try {
      await accountApi.deleteAddress(addressId);
      const refreshed = await refreshAddresses();
      if (refreshed) setAddressFeedback("Address removed.");
    } catch (error) {
      setAddressError(accountError(error, "DELETE", `/api/address/${addressId}`));
    }
  };

  const makeDefault = async (addressId) => {
    setAddressError("");
    setAddressFeedback("");
    try {
      await accountApi.setDefaultAddress(addressId, user.id);
      const refreshed = await refreshAddresses();
      if (refreshed) setAddressFeedback("Default address updated.");
    } catch (error) {
      setAddressError(accountError(error, "PUT", `/api/address/${addressId}/default/${user.id}`));
    }
  };

  return <section className="mx-auto w-full min-w-0 max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Account</p>
    <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">Your details</h1>
    <div className="mt-10 grid gap-12 lg:grid-cols-2">
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="text-lg font-bold">Profile</h2>
        {profileLoading ? <p className="mt-4 text-sm text-zinc-500">Loading profile…</p> : profileError ? <Notice>{profileError}</Notice> : profile ? <form onSubmit={saveProfile} className="mt-5 space-y-4">
          {profileFeedback && <Notice success>{profileFeedback}</Notice>}
          <div className="grid gap-4 sm:grid-cols-2"><Field label="First name" value={profile.firstName} onChange={(value) => setProfile({ ...profile, firstName: value })}/><Field label="Last name" value={profile.lastName} onChange={(value) => setProfile({ ...profile, lastName: value })}/></div>
          <Field label="Username" value={profile.username} onChange={(value) => setProfile({ ...profile, username: value })}/>
          <Field label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })}/>
          <Field label="Phone number" value={profile.phoneNumber} onChange={(value) => setProfile({ ...profile, phoneNumber: value })}/>
          <Button disabled={savingProfile}>{savingProfile ? "Saving…" : "Save profile"}</Button>
        </form> : <p className="mt-4 text-sm text-zinc-500">Profile information is not available from the account response.</p>}
      </section>

      <section aria-labelledby="addresses-heading">
        <h2 id="addresses-heading" className="text-lg font-bold">Saved addresses</h2>
        {addressError && <Notice>{addressError}</Notice>}
        {addressFeedback && <Notice success>{addressFeedback}</Notice>}
        {addressesLoading ? <p className="mt-4 text-sm text-zinc-500">Loading saved addresses…</p> : addresses.length ? <div className="mt-4 space-y-3">{addresses.map((address) => <article key={address.id} className="border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <div className="flex flex-wrap justify-between gap-3"><p className="min-w-0 break-words">{address.street}<br/>{address.city}{address.state ? `, ${address.state}` : ""} {address.postalCode}<br/>{address.country}</p><div className="flex shrink-0 gap-3"><button type="button" onClick={() => deleteAddress(address.id)} className="text-zinc-500 underline underline-offset-4">Remove</button>{!address.isDefault && <button type="button" onClick={() => makeDefault(address.id)} className="text-zinc-500 underline underline-offset-4">Set default</button>}</div></div>
          <p className="mt-3 text-xs text-zinc-500">{address.addressType || "Address"}{address.isDefault ? " · Default" : ""}</p>
        </article>)}</div> : !addressError && <p className="mt-4 border-y border-zinc-200 py-5 text-sm text-zinc-500 dark:border-zinc-800">No saved addresses yet.</p>}

        <form onSubmit={addAddress} className="mt-6 grid gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <h3 className="font-semibold">Add an address</h3>
          <Field label="Street" value={form.street} onChange={(value) => setForm({ ...form, street: value })}/>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })}/><Field label="State / Province" value={form.state} onChange={(value) => setForm({ ...form, state: value })}/><Field label="Postal code" value={form.postalCode} onChange={(value) => setForm({ ...form, postalCode: value })}/><Field label="Country" value={form.country} onChange={(value) => setForm({ ...form, country: value })}/></div>
          <label className="block text-sm font-medium">Address type<select value={form.addressType} onChange={(event) => setForm({ ...form, addressType: event.target.value })} className="field mt-2"><option value="Home">Home</option><option value="Work">Work</option><option value="OTHER">Other</option></select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}/> Set as default</label>
          <Button disabled={savingAddress} className="w-fit">{savingAddress ? "Adding…" : "Add address"}</Button>
        </form>
        <p className="mt-3 text-xs leading-5 text-zinc-500">Addresses are loaded and saved for the signed-in customer.</p>
      </section>
    </div>
    <Link to="/shop" className="mt-10 inline-block text-sm text-zinc-500 underline underline-offset-4">Continue shopping</Link>
  </section>;
}
