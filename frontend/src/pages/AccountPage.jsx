import { Check, MapPin, User } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { accountApi } from "../api/services";
import { messageFrom } from "../api/client";
import { StoreContext } from "../context/StoreContext";
import { Page, Notice, Button } from "./Storefront";

const accountError = (error, method, endpoint) => {
  const status = error.response?.status;
  const request = `${method} ${endpoint}`;
  if (status === 401)
    return `${request} returned 401. Your session may have expired; sign in again to load account details.`;
  if (status === 403)
    return `${request} returned 403. The backend denied this request. Check that the current session has the CUSTOMER role and that its access token is valid.`;
  if (status >= 500)
    return `${request} returned ${status}. The account service is temporarily unavailable.`;
  if (!error.response)
    return `${request} could not reach the server. Check the API connection and try again.`;
  return `${request} failed: ${messageFrom(error)}`;
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <label className="block space-y-1.5 text-xs font-semibold">
    <span className="uppercase tracking-wider text-black">{label}</span>
    <input
      required
      type={type}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className="field text-xs border-[#E5E5E5] bg-white text-black focus:border-black"
    />
  </label>
);

const initialAddress = () => ({
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  addressType: "Home",
  isDefault: false,
});

export function AccountPage() {
  const { user, showToast } = useContext(StoreContext);
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

    accountApi
      .profile()
      .then((result) => {
        if (active) {
          setProfile(result);
          setProfileError("");
        }
      })
      .catch((error) => {
        if (active) setProfileError(accountError(error, "GET", "/api/users/me"));
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    accountApi
      .addresses()
      .then((result) => {
        if (active) {
          setAddresses(Array.isArray(result) ? result : []);
          setAddressError("");
        }
      })
      .catch((error) => {
        if (active) setAddressError(accountError(error, "GET", "/api/address"));
      })
      .finally(() => {
        if (active) setAddressesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!user) return <Navigate to="/login?returnTo=/account" replace />;

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
      const updated = await accountApi.updateProfile(payload);
      setProfile(updated);
      setProfileFeedback("Collector profile saved successfully.");
      showToast("Profile details updated", "success");
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
      const msg = refreshed
        ? "Address registered."
        : "Address added, but saved address list could not be refreshed.";
      setAddressFeedback(msg);
      showToast("Shipping destination added", "success");
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
      if (refreshed) {
        setAddressFeedback("Address removed.");
        showToast("Address removed", "info");
      }
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
      if (refreshed) {
        setAddressFeedback("Default shipping address updated.");
        showToast("Default address updated", "success");
      }
    } catch (error) {
      setAddressError(accountError(error, "PUT", `/api/address/${addressId}/default/${user.id}`));
    }
  };

  return (
    <Page
      eyebrow="Account"
      title="Your Profile"
      subtitle="Manage your personal details and shipping addresses."
      actions={
        <Link
          to="/shop"
          className="text-xs font-semibold uppercase tracking-wider text-black hover:underline underline-offset-4"
        >
          Explore Collection →
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Section */}
        <section
          aria-labelledby="profile-heading"
          className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
            <div className="flex h-9 w-9 items-center justify-center border border-black bg-black text-white">
              <User size={16} />
            </div>
            <div>
              <h2 id="profile-heading" className="text-base font-bold text-black">
                Collector Profile
              </h2>
              <span className="text-[11px] text-[#737373]">
                Primary contact details and credentials
              </span>
            </div>
          </div>

          {profileLoading ? (
            <p className="text-xs text-[#737373]">Loading profile data…</p>
          ) : profileError ? (
            <Notice>{profileError}</Notice>
          ) : profile ? (
            <form onSubmit={saveProfile} className="space-y-4">
              {profileFeedback && (
                <div className="flex items-center gap-2 border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs text-black">
                  <Check size={13} className="shrink-0" />
                  {profileFeedback}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  value={profile.firstName}
                  onChange={(value) => setProfile({ ...profile, firstName: value })}
                />
                <Field
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(value) => setProfile({ ...profile, lastName: value })}
                />
              </div>

              <Field
                label="Username"
                value={profile.username}
                onChange={(value) => setProfile({ ...profile, username: value })}
              />
              <Field
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(value) => setProfile({ ...profile, email: value })}
              />
              <Field
                label="Phone Number"
                value={profile.phoneNumber}
                onChange={(value) => setProfile({ ...profile, phoneNumber: value })}
              />

              <Button disabled={savingProfile} className="w-full mt-2">
                {savingProfile ? "Saving Details…" : "Save Profile"}
              </Button>
            </form>
          ) : (
            <p className="text-xs text-[#737373]">
              Profile information is not available from the account response.
            </p>
          )}
        </section>

        {/* Addresses Section */}
        <section
          aria-labelledby="addresses-heading"
          className="border border-[#E5E5E5] bg-white p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
            <div className="flex h-9 w-9 items-center justify-center border border-black bg-black text-white">
              <MapPin size={16} />
            </div>
            <div>
              <h2 id="addresses-heading" className="text-base font-bold text-black">
                Shipping Destinations
              </h2>
              <span className="text-[11px] text-[#737373]">
                Registered delivery addresses
              </span>
            </div>
          </div>

          {addressError && <Notice>{addressError}</Notice>}
          {addressFeedback && (
            <div className="flex items-center gap-2 border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs text-black">
              <Check size={13} className="shrink-0" />
              {addressFeedback}
            </div>
          )}

          {addressesLoading ? (
            <p className="text-xs text-[#737373]">Loading saved addresses…</p>
          ) : addresses.length ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className="border border-[#E5E5E5] bg-[#FAFAFA] p-4 text-xs space-y-2"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <p className="text-[#737373] leading-relaxed">
                      <span className="font-semibold text-black">{address.street}</span>
                      <br />
                      {address.city}
                      {address.state ? `, ${address.state}` : ""} {address.postalCode}
                      <br />
                      {address.country}
                    </p>

                    <div className="flex shrink-0 gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => deleteAddress(address.id)}
                        className="text-[#737373] hover:text-black underline underline-offset-4 transition-colors"
                      >
                        Remove
                      </button>
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => makeDefault(address.id)}
                          className="text-black font-semibold underline underline-offset-4"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E5E5E5] text-[10px] uppercase tracking-wider">
                    <span className="text-[#737373]">{address.addressType || "Home"}</span>
                    {address.isDefault && (
                      <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-bold tracking-widest">
                        Default
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            !addressError && (
              <p className="border border-[#E5E5E5] bg-[#FAFAFA] p-5 text-center text-xs text-[#737373]">
                No saved shipping addresses registered yet.
              </p>
            )
          )}

          {/* Add Address Form */}
          <form
            onSubmit={addAddress}
            className="border-t border-[#E5E5E5] pt-6 space-y-4 text-xs"
          >
            <h3 className="text-sm font-bold text-black">
              Add New Address
            </h3>

            <Field
              label="Street Address"
              value={form.street}
              onChange={(value) => setForm({ ...form, street: value })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="City"
                value={form.city}
                onChange={(value) => setForm({ ...form, city: value })}
              />
              <Field
                label="State / Province"
                value={form.state}
                onChange={(value) => setForm({ ...form, state: value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Postal Code"
                value={form.postalCode}
                onChange={(value) => setForm({ ...form, postalCode: value })}
              />
              <Field
                label="Country"
                value={form.country}
                onChange={(value) => setForm({ ...form, country: value })}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
                  className="accent-black"
                />
                <span>Set as default address</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#737373]">
                <span>Type:</span>
                <select
                  value={form.addressType}
                  onChange={(event) => setForm({ ...form, addressType: event.target.value })}
                  className="bg-white border border-[#E5E5E5] px-2 py-1 text-xs text-black focus:border-black focus:outline-none"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>

            <Button disabled={savingAddress} className="w-full mt-2">
              {savingAddress ? "Registering Address…" : "Add Shipping Address"}
            </Button>
          </form>
        </section>
      </div>
    </Page>
  );
}
