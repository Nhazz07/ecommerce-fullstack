
import { Edit3, Eye, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { adminApi, adminError } from "./api";

const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value || 0));

const date = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

const emptyProduct = {
  productName: "",
  description: "",
  sku: "",
  price: "",
  status: "ACTIVE",
  releaseDate: "",
  categoryId: "",
  brandId: "",
  seriesId: "",
};

const emptyCoupon = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minimumOrderAmount: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
  active: true,
};

function Notice({ message, type = "error" }) {
  return message ? (
      <p
          role={type === "error" ? "alert" : "status"}
          className={`admin-alert ${type}`}
      >
        {message}
      </p>
  ) : null;
}

function State({ loading, error, empty, children }) {
  if (loading) return <div className="admin-state">Loading data…</div>;
  if (error) return <Notice message={error} />;
  if (empty) return <div className="admin-state">No records found.</div>;
  return children;
}

function Header({ title, detail, action }) {
  return (
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Management</p>
          <h2>{title}</h2>
          {detail && <p>{detail}</p>}
        </div>
        {action}
      </div>
  );
}

function Status({ children }) {
  return <span className="admin-status">{children || "—"}</span>;
}

function Dialog({ title, children, close }) {
  return (
      <div className="admin-dialog-backdrop" role="presentation">
        <section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="admin-dialog"
        >
          <div className="admin-dialog-head">
            <h3>{title}</h3>
            <button type="button" onClick={close} aria-label="Close">
              <X size={19} />
            </button>
          </div>
          {children}
        </section>
      </div>
  );
}

// Keep the latest loader without changing the identity of load.
// This prevents inline loader functions from triggering endless refetches.
  function useLoad(loader) {
    const [state, setState] = useState({
      loading: true,
      error: "",
      data: null,
    });

    const load = useCallback(async () => {
      setState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      try {
        const data = await loader();

        setState({
          loading: false,
          error: "",
          data,
        });

        return data;
      } catch (error) {
        setState({
          loading: false,
          error: adminError(error),
          data: null,
        });

        return null;
      }
    }, [loader]);

    useEffect(() => {
      let cancelled = false;

      async function initialLoad() {
        try {
          const data = await loader();

          if (!cancelled) {
            setState({
              loading: false,
              error: "",
              data,
            });
          }
        } catch (error) {
          if (!cancelled) {
            setState({
              loading: false,
              error: adminError(error),
              data: null,
            });
          }
        }
      }

      void initialLoad();

      return () => {
        cancelled = true;
      };
    }, [loader]);

    return {...state, load};
  }


  export function OverviewPage() {
    const {data, loading, error, load} = useLoad(() =>
        Promise.all([
          adminApi.products(0, 100),
          adminApi.orders(),
          adminApi.users(),
        ])
    );

    const [products, orders, users] = data || [];

    const revenue = (orders || []).reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
    );

    const recent = [...(orders || [])]
        .sort(
            (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
        )
        .slice(0, 5);

    return (
        <>
          <Header
              title="Overview"
              detail="A live view of your store operations."
              action={
                <button onClick={load}>
                  <RefreshCw size={15}/> Refresh
                </button>
              }
          />

          <State loading={loading} error={error} empty={!data}>
            {data && (
                <>
                  <div className="admin-stats">
                    <Stat
                        label="Products"
                        value={
                            products.totalElements ??
                            products.content?.length ??
                            0
                        }
                    />
                    <Stat label="Orders" value={orders.length}/>
                    <Stat label="Customers" value={users.length}/>
                    <Stat label="Recorded revenue" value={money(revenue)}/>
                  </div>

                  <section className="admin-panel">
                    <h3>Recent orders</h3>

                    {recent.length ? (
                        <table className="admin-table">
                          <thead>
                          <tr>
                            <th>Order</th>
                            <th>Placed</th>
                            <th>Status</th>
                            <th>Total</th>
                          </tr>
                          </thead>
                          <tbody>
                          {recent.map((order) => (
                              <tr key={order.id}>
                                <td>#{order.orderNumber || order.id}</td>
                                <td>{date(order.orderDate)}</td>
                                <td>
                                  <Status>{order.status}</Status>
                                </td>
                                <td>{money(order.totalAmount)}</td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                    ) : (
                        <div className="admin-state">
                          No orders have been recorded.
                        </div>
                    )}
                  </section>
                </>
            )}
          </State>
        </>
    );
  }

  function Stat({label, value}) {
    return (
        <article className="admin-stat">
          <p>{label}</p>
          <strong>{value}</strong>
        </article>
    );
  }

  export function ProductsPage() {
    const products = useLoad(() => adminApi.products(0, 100));

    const lookups = useLoad(() =>
        Promise.all([
          adminApi.categories(),
          adminApi.brands(),
          adminApi.series(),
        ])
    );

    const [editing, setEditing] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [query, setQuery] = useState("");

    const records = (products.data?.content || []).filter((item) =>
        `${item.name} ${item.sku}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    const save = async (form) => {
      try {
        const payload = {
          ...form,
          price: Number(form.price),
          categoryId: Number(form.categoryId),
          brandId: Number(form.brandId),
          seriesId: Number(form.seriesId),
          releaseDate: form.releaseDate || null,
        };

        if (form.id) {
          await adminApi.updateProduct(form.id, payload);
        } else {
          await adminApi.createProduct(payload);
        }

        setEditing(null);
        setFeedback("Product saved.");
        await products.load();
      } catch (error) {
        throw new Error(adminError(error), {cause: error});
      }
    };

    const remove = async (id) => {
      if (!window.confirm("Delete this product?")) return;

      try {
        await adminApi.deleteProduct(id);
        setFeedback("Product deleted.");
        await products.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    return (
        <>
          <Header
              title="Products"
              detail="Create and maintain catalogue records."
              action={
                <button onClick={() => setEditing(emptyProduct)}>
                  <Plus size={16}/> Add product
                </button>
              }
          />

          <Notice
              message={feedback}
              type={
                feedback.includes("saved") || feedback.includes("deleted")
                    ? "success"
                    : "error"
              }
          />

          <div className="admin-toolbar">
            <input
                placeholder="Search name or SKU"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />
            <span>{records.length} products</span>
          </div>

          <State
              loading={products.loading || lookups.loading}
              error={products.error || lookups.error}
              empty={!records.length}
          >
            <table className="admin-table">
              <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {records.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.name}</b>
                      <small>{item.categoryName || "Uncategorized"}</small>
                    </td>
                    <td>{item.sku}</td>
                    <td>{money(item.price)}</td>
                    <td>
                      <Status>{item.status}</Status>
                    </td>
                    <td className="admin-actions">
                      <button
                          onClick={() =>
                              setEditing({
                                ...item,
                                productName: item.name,
                                price: item.price ?? "",
                                releaseDate: item.releaseDate?.slice(0, 10) || "",
                              })
                          }
                      >
                        <Edit3 size={15}/> Edit
                      </button>

                      <button
                          className="danger"
                          onClick={() => remove(item.id)}
                      >
                        <Trash2 size={15}/> Delete
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>

          {editing && (
              <ProductDialog
                  product={editing}
                  lookups={lookups.data}
                  save={save}
                  close={() => setEditing(null)}
              />
          )}
        </>
    );
  }

  function ProductDialog({product, lookups, save, close}) {
    const [form, setForm] = useState(product);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (key, value) =>
        setForm((current) => ({...current, [key]: value}));

    const submit = async (event) => {
      event.preventDefault();
      setBusy(true);
      setError("");

      try {
        await save(form);
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    };

    return (
        <Dialog
            title={form.id ? "Edit product" : "Add product"}
            close={close}
        >
          <form className="admin-form" onSubmit={submit}>
            <Notice message={error}/>

            <label>
              Name
              <input
                  required
                  value={form.productName}
                  onChange={(event) => set("productName", event.target.value)}
              />
            </label>

            <label>
              Description
              <textarea
                  required
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
              />
            </label>

            <div className="admin-form-grid">
              <label>
                SKU
                <input
                    required
                    value={form.sku}
                    onChange={(event) => set("sku", event.target.value)}
                />
              </label>

              <label>
                Price
                <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => set("price", event.target.value)}
                />
              </label>

              <label>
                Status
                <select
                    value={form.status}
                    onChange={(event) => set("status", event.target.value)}
                >
                  {[
                    "ACTIVE",
                    "INACTIVE",
                    "OUT_OF_STOCK",
                    "DISCONTINUED",
                  ].map((status) => (
                      <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label>
                Release date
                <input
                    type="datetime-local"
                    value={form.releaseDate}
                    onChange={(event) => set("releaseDate", event.target.value)}
                />
              </label>
            </div>

            <Lookup
                label="Category"
                value={form.categoryId}
                set={(value) => set("categoryId", value)}
                items={lookups?.[0]}
                required
            />

            <Lookup
                label="Brand"
                value={form.brandId}
                set={(value) => set("brandId", value)}
                items={lookups?.[1]}
                required
            />

            <Lookup
                label="Series"
                value={form.seriesId}
                set={(value) => set("seriesId", value)}
                items={lookups?.[2]}
                required
            />

            <div className="admin-dialog-actions">
              <button
                  type="button"
                  className="admin-secondary"
                  onClick={close}
              >
                Cancel
              </button>
              <button disabled={busy}>
                {busy ? "Saving…" : "Save product"}
              </button>
            </div>
          </form>
        </Dialog>
    );
  }

  function Lookup({label, value, set, items, required}) {
    return (
        <label>
          {label}
          <select
              required={required}
              value={value || ""}
              onChange={(event) => set(event.target.value)}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {(items || []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
            ))}
          </select>
        </label>
    );
  }

  export function OrdersPage() {
    const orders = useLoad(() => adminApi.orders());
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState("");

    const update = async (id, status) => {
      try {
        await adminApi.updateOrderStatus(id, status);
        setFeedback("Order status updated.");
        await orders.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    return (
        <>
          <Header
              title="Orders"
              detail="Review all customer orders and update their fulfilment status."
          />

          <Notice
              message={feedback}
              type={feedback.includes("updated") ? "success" : "error"}
          />

          <State
              loading={orders.loading}
              error={orders.error}
              empty={!orders.data?.length}
          >
            <table className="admin-table">
              <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Placed</th>
                <th>Status</th>
                <th>Total</th>
                <th/>
              </tr>
              </thead>
              <tbody>
              {orders.data?.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.orderNumber || order.id}</td>
                    <td>Customer #{order.userId}</td>
                    <td>{date(order.orderDate)}</td>
                    <td>
                      <select
                          value={order.status}
                          onChange={(event) =>
                              update(order.id, event.target.value)
                          }
                      >
                        {[
                          "PENDING",
                          "CONFIRMED",
                          "PAID",
                          "PROCESSING",
                          "SHIPPED",
                          "DELIVERED",
                          "CANCELED",
                        ].map((status) => (
                            <option key={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>{money(order.totalAmount)}</td>
                    <td>
                      <button
                          className="admin-icon"
                          onClick={() => setSelected(order)}
                          aria-label="View order"
                      >
                        <Eye size={16}/>
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>

          {selected && (
              <OrderDialog
                  order={selected}
                  close={() => setSelected(null)}
              />
          )}
        </>
    );
  }

  function OrderDialog({order, close}) {
    return (
        <Dialog
            title={`Order #${order.orderNumber || order.id}`}
            close={close}
        >
          <div className="admin-detail">
            <p>
              <b>Status</b>
              <Status>{order.status}</Status>
            </p>

            <p>
              <b>Shipping</b>
              <span className="preline">
            {order.shippingAddress || "Not provided"}
          </span>
            </p>

            <p>
              <b>Payment record</b>
              {order.paymentId ? `#${order.paymentId}` : "Not available"}
            </p>

            <h4>Items</h4>

            {order.orderItems?.length ? (
                order.orderItems.map((item) => (
                    <div className="admin-line" key={item.id}>
              <span>
                {item.productName || "Product"} ·{" "}
                {item.variantName || item.variantSku || "Variant"} ×{" "}
                {item.quantity}
              </span>
                      <b>{money(item.subTotal)}</b>
                    </div>
                ))
            ) : (
                <p>No item details were returned.</p>
            )}

            <div className="admin-line total">
              <span>Total</span>
              <b>{money(order.totalAmount)}</b>
            </div>
          </div>
        </Dialog>
    );
  }

  export function CustomersPage() {
    const users = useLoad(() => adminApi.users());

    return (
        <>
          <Header
              title="Customers"
              detail="Customer records exposed by the administrator API."
          />

          <State
              loading={users.loading}
              error={users.error}
              empty={!users.data?.length}
          >
            <table className="admin-table">
              <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
              </thead>
              <tbody>
              {users.data?.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <b>
                        {user.firstName} {user.lastName}
                      </b>
                      <small>{user.username}</small>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>
                      <Status>{user.status}</Status>
                    </td>
                    <td>{date(user.createdAt)}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>
        </>
    );
  }

  export function CategoriesPage() {
    return (
        <SimpleManager
            title="Categories"
            load={adminApi.categories}
            create={adminApi.createCategory}
            update={adminApi.updateCategory}
            remove={adminApi.deleteCategory}
            fields={["name", "description", "imageUrl"]}
        />
    );
  }

  export function BrandsPage() {
    const brands = useLoad(() => adminApi.brands());
    const [editing, setEditing] = useState(null);
    const [feedback, setFeedback] = useState("");

    const save = async (form) => {
      try {
        const body = new FormData();
        body.append("name", form.name);
        body.append("description", form.description);

        if (form.file) body.append("file", form.file);

        if (form.id) {
          await adminApi.updateBrand(form.id, body);
        } else {
          await adminApi.createBrand(body);
        }

        setEditing(null);
        setFeedback("Brand saved.");
        await brands.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    const erase = async (id) => {
      if (!window.confirm("Delete this brand?")) return;

      try {
        await adminApi.deleteBrand(id);
        setFeedback("Brand deleted.");
        await brands.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    return (
        <>
          <Header
              title="Brands"
              detail="Brand media requires a file because the backend uses multipart uploads."
              action={
                <button
                    onClick={() =>
                        setEditing({name: "", description: "", file: null})
                    }
                >
                  <Plus size={16}/> Add brand
                </button>
              }
          />

          <Notice
              message={feedback}
              type={
                feedback.includes("saved") || feedback.includes("deleted")
                    ? "success"
                    : "error"
              }
          />

          <State
              loading={brands.loading}
              error={brands.error}
              empty={!brands.data?.length}
          >
            <table className="admin-table">
              <thead>
              <tr>
                <th>Brand</th>
                <th>Description</th>
                <th>Products</th>
                <th/>
              </tr>
              </thead>
              <tbody>
              {brands.data?.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <b>{brand.name}</b>
                    </td>
                    <td>{brand.description || "—"}</td>
                    <td>{brand.productId?.length || 0}</td>
                    <td className="admin-actions">
                      <button
                          onClick={() => setEditing({...brand, file: null})}
                      >
                        <Edit3 size={15}/> Edit
                      </button>
                      <button
                          className="danger"
                          onClick={() => erase(brand.id)}
                      >
                        <Trash2 size={15}/> Delete
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>

          {editing && (
              <BrandDialog
                  form={editing}
                  save={save}
                  close={() => setEditing(null)}
              />
          )}
        </>
    );
  }

  function BrandDialog({form: initial, save, close}) {
    const [form, setForm] = useState(initial);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (event) => {
      event.preventDefault();

      if (!form.id && !form.file) {
        setError("Please select a brand image.");
        return;
      }

      setBusy(true);
      setError("");

      try {
        await save(form);
      } catch (err) {
        setError(err.message || "Could not save brand.");
      } finally {
        setBusy(false);
      }
    };

    return (
        <Dialog
            title={`${form.id ? "Edit" : "Add"} brand`}
            close={close}
        >
          <form className="admin-form" onSubmit={submit}>
            <Notice message={error}/>

            <label>
              Name
              <input
                  required
                  value={form.name}
                  onChange={(event) =>
                      setForm({...form, name: event.target.value})
                  }
              />
            </label>

            <label>
              Description
              <textarea
                  required
                  value={form.description}
                  onChange={(event) =>
                      setForm({...form, description: event.target.value})
                  }
              />
            </label>

            <label>
              Brand image
              <input
                  type="file"
                  accept="image/*"
                  required={!form.id}
                  onChange={(event) =>
                      setForm({
                        ...form,
                        file: event.target.files?.[0] || null,
                      })
                  }
              />
            </label>

            <div className="admin-dialog-actions">
              <button
                  type="button"
                  className="admin-secondary"
                  onClick={close}
              >
                Cancel
              </button>
              <button disabled={busy}>
                {busy ? "Saving…" : "Save brand"}
              </button>
            </div>
          </form>
        </Dialog>
    );
  }

  export function InventoryPage() {
    const inventory = useLoad(() => adminApi.inventory());
    const [editing, setEditing] = useState(null);
    const [feedback, setFeedback] = useState("");

    const save = async (form) => {
      try {
        await adminApi.updateInventory(form.id, {
          quantity: Number(form.quantity),
          reservedQuantity: Number(form.reservedQuantity),
          reorderLevel: Number(form.reorderLevel),
          productVariantId: Number(form.productVariantId),
        });

        setEditing(null);
        setFeedback("Inventory updated.");
        await inventory.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    return (
        <>
          <Header
              title="Inventory"
              detail="Stock levels are managed through the existing inventory service."
          />

          <Notice
              message={feedback}
              type={feedback.includes("updated") ? "success" : "error"}
          />

          <State
              loading={inventory.loading}
              error={inventory.error}
              empty={!inventory.data?.length}
          >
            <table className="admin-table">
              <thead>
              <tr>
                <th>Variant</th>
                <th>In stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Reorder at</th>
                <th/>
              </tr>
              </thead>
              <tbody>
              {inventory.data?.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.productVariantId}</td>
                    <td>{item.quantity}</td>
                    <td>{item.reservedQuantity}</td>
                    <td>
                      <b>{item.availableQuantity}</b>
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      <button
                          className="admin-icon"
                          onClick={() => setEditing(item)}
                          aria-label="Edit inventory"
                      >
                        <Edit3 size={16}/>
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>

          {editing && (
              <InventoryDialog
                  item={editing}
                  save={save}
                  close={() => setEditing(null)}
              />
          )}
        </>
    );
  }

  function InventoryDialog({item, save, close}) {
    const [form, setForm] = useState(item);
    const [busy, setBusy] = useState(false);

    const submit = async (event) => {
      event.preventDefault();
      setBusy(true);

      try {
        await save(form);
      } finally {
        setBusy(false);
      }
    };

    return (
        <Dialog title="Update inventory" close={close}>
          <form className="admin-form" onSubmit={submit}>
            <p>Variant #{form.productVariantId}</p>

            {["quantity", "reservedQuantity", "reorderLevel"].map((key) => (
                <label key={key}>
                  {key.replace(/([A-Z])/g, " $1")}
                  <input
                      type="number"
                      min="0"
                      required
                      value={form[key]}
                      onChange={(event) =>
                          setForm({...form, [key]: event.target.value})
                      }
                  />
                </label>
            ))}

            <div className="admin-dialog-actions">
              <button
                  type="button"
                  className="admin-secondary"
                  onClick={close}
              >
                Cancel
              </button>
              <button disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Dialog>
    );
  }

  function SimpleManager({title, load, create, update, remove, fields}) {
    const records = useLoad(load);
    const [editing, setEditing] = useState(null);
    const [feedback, setFeedback] = useState("");

    const save = async (form) => {
      try {
        if (form.id) {
          await update(form.id, form);
        } else {
          await create(form);
        }

        setEditing(null);
        setFeedback(`${title.slice(0, -1)} saved.`);
        await records.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    const erase = async (id) => {
      if (
          !window.confirm(
              `Delete this ${title.slice(0, -1).toLowerCase()}?`
          )
      ) {
        return;
      }

      try {
        await remove(id);
        setFeedback(`${title.slice(0, -1)} deleted.`);
        await records.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    return (
        <>
          <Header
              title={title}
              detail={`Manage ${title.toLowerCase()} used throughout the catalogue.`}
              action={
                <button
                    onClick={() =>
                        setEditing(
                            Object.fromEntries(fields.map((field) => [field, ""]))
                        )
                    }
                >
                  <Plus size={16}/> Add {title.slice(0, -1)}
                </button>
              }
          />

          <Notice
              message={feedback}
              type={
                feedback.includes("saved") || feedback.includes("deleted")
                    ? "success"
                    : "error"
              }
          />

          <State
              loading={records.loading}
              error={records.error}
              empty={!records.data?.length}
          >
            <table className="admin-table">
              <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th/>
              </tr>
              </thead>
              <tbody>
              {records.data?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <b>{item.name}</b>
                    </td>
                    <td>{item.description || "—"}</td>
                    <td>{item.productId?.length || 0}</td>
                    <td className="admin-actions">
                      <button onClick={() => setEditing(item)}>
                        <Edit3 size={15}/> Edit
                      </button>
                      <button
                          className="danger"
                          onClick={() => erase(item.id)}
                      >
                        <Trash2 size={15}/> Delete
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>

          {editing && (
              <SimpleDialog
                  title={title.slice(0, -1)}
                  form={editing}
                  fields={fields}
                  save={save}
                  close={() => setEditing(null)}
              />
          )}
        </>
    );
  }

  function SimpleDialog({title, form: initial, fields, save, close}) {
    const [form, setForm] = useState(initial);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (event) => {
      event.preventDefault();
      setError("");
      setBusy(true);

      try {
        await save(form);
      } catch (err) {
        setError(err.message || "Could not save record.");
      } finally {
        setBusy(false);
      }
    };

    return (
        <Dialog
            title={`${form.id ? "Edit" : "Add"} ${title}`}
            close={close}
        >
          <form className="admin-form" onSubmit={submit}>
            <Notice message={error}/>

            {fields.map((field) => (
                <label key={field}>
                  {field === "imageUrl"
                      ? "Image URL"
                      : field[0].toUpperCase() + field.slice(1)}

                  {field === "description" ? (
                      <textarea
                          value={form[field] || ""}
                          onChange={(event) =>
                              setForm({...form, [field]: event.target.value})
                          }
                      />
                  ) : (
                      <input
                          required={field === "name"}
                          value={form[field] || ""}
                          onChange={(event) =>
                              setForm({...form, [field]: event.target.value})
                          }
                      />
                  )}
                </label>
            ))}

            <div className="admin-dialog-actions">
              <button
                  type="button"
                  className="admin-secondary"
                  onClick={close}
              >
                Cancel
              </button>
              <button disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Dialog>
    );
  }

  function CouponManager() {
    const coupons = useLoad(() => adminApi.coupons());
    const [editing, setEditing] = useState(null);
    const [feedback, setFeedback] = useState("");

    const save = async (form) => {
      try {
        const payload = {
          ...form,
          discountValue: Number(form.discountValue),
          minimumOrderAmount: Number(form.minimumOrderAmount),
          usageLimit: Number(form.usageLimit),
        };

        if (form.id) {
          await adminApi.updateCoupon(form.id, payload);
        } else {
          await adminApi.createCoupon(payload);
        }

        setEditing(null);
        setFeedback("Coupon saved.");
        await coupons.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    const erase = async (id) => {
      if (!window.confirm("Delete this coupon?")) return;

      try {
        await adminApi.deleteCoupon(id);
        setFeedback("Coupon deleted.");
        await coupons.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    return (
        <>
          <Header
              title="Coupons"
              detail="Create and manage server-validated discount codes."
              action={
                <button onClick={() => setEditing(emptyCoupon)}>
                  <Plus size={16}/> Add coupon
                </button>
              }
          />

          <Notice
              message={feedback}
              type={
                feedback.includes("saved") || feedback.includes("deleted")
                    ? "success"
                    : "error"
              }
          />

          <State
              loading={coupons.loading}
              error={coupons.error}
              empty={!coupons.data?.length}
          >
            <table className="admin-table">
              <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Period</th>
                <th>Active</th>
                <th/>
              </tr>
              </thead>
              <tbody>
              {coupons.data?.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <b>{coupon.code}</b>
                      <small>{coupon.description}</small>
                    </td>
                    <td>
                      {coupon.discountType} {coupon.discountValue}
                    </td>
                    <td>
                      {date(coupon.startDate)} — {date(coupon.endDate)}
                    </td>
                    <td>
                      <Status>
                        {coupon.active ? "ACTIVE" : "INACTIVE"}
                      </Status>
                    </td>
                    <td className="admin-actions">
                      <button
                          onClick={() =>
                              setEditing({
                                ...coupon,
                                startDate: coupon.startDate?.slice(0, 16) || "",
                                endDate: coupon.endDate?.slice(0, 16) || "",
                              })
                          }
                      >
                        <Edit3 size={15}/> Edit
                      </button>
                      <button
                          className="danger"
                          onClick={() => erase(coupon.id)}
                      >
                        <Trash2 size={15}/> Delete
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>

          {editing && (
              <CouponDialog
                  form={editing}
                  save={save}
                  close={() => setEditing(null)}
              />
          )}
        </>
    );
  }

  function CouponDialog({form: initial, save, close}) {
    const [form, setForm] = useState(initial);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (key, value) =>
        setForm((current) => ({...current, [key]: value}));

    const submit = async (event) => {
      event.preventDefault();
      setError("");
      setBusy(true);

      try {
        await save(form);
      } catch (err) {
        setError(err.message || "Could not save coupon.");
      } finally {
        setBusy(false);
      }
    };

    return (
        <Dialog
            title={`${form.id ? "Edit" : "Add"} coupon`}
            close={close}
        >
          <form className="admin-form" onSubmit={submit}>
            <Notice message={error}/>

            <div className="admin-form-grid">
              <label>
                Code
                <input
                    required
                    value={form.code}
                    onChange={(event) => set("code", event.target.value)}
                />
              </label>

              <label>
                Type
                <select
                    value={form.discountType}
                    onChange={(event) => set("discountType", event.target.value)}
                >
                  <option>PERCENTAGE</option>
                  <option>FIXED</option>
                </select>
              </label>

              <label>
                Discount value
                <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.discountValue}
                    onChange={(event) => set("discountValue", event.target.value)}
                />
              </label>

              <label>
                Minimum order
                <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minimumOrderAmount}
                    onChange={(event) =>
                        set("minimumOrderAmount", event.target.value)
                    }
                />
              </label>

              <label>
                Usage limit
                <input
                    required
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(event) => set("usageLimit", event.target.value)}
                />
              </label>

              <label>
                Active
                <select
                    value={String(form.active)}
                    onChange={(event) =>
                        set("active", event.target.value === "true")
                    }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>

            <label>
              Description
              <textarea
                  required
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
              />
            </label>

            <div className="admin-form-grid">
              <label>
                Starts
                <input
                    required
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(event) => set("startDate", event.target.value)}
                />
              </label>

              <label>
                Ends
                <input
                    required
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(event) => set("endDate", event.target.value)}
                />
              </label>
            </div>

            <div className="admin-dialog-actions">
              <button
                  type="button"
                  className="admin-secondary"
                  onClick={close}
              >
                Cancel
              </button>
              <button disabled={busy}>
                {busy ? "Saving…" : "Save coupon"}PA
              </button>
            </div>
          </form>
        </Dialog>
    );
  }

  export function CouponsPage() {
    return <CouponManager/>;
  }