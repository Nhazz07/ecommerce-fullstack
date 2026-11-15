
import { Edit3, Eye, MoreHorizontal, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

  function Status({ children, className = "" }) {
    return <span className={`admin-status ${className}`}>{children || "—"}</span>;
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
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const records = (products.data?.content || []).filter((item) =>
        `${item.name} ${item.sku}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    const save = async (form, newFiles = [], removedImageIds = [], setStatus) => {
      try {
        const payload = {
          productName: form.productName,
          description: form.description,
          sku: form.sku,
          price: Number(form.price),
          status: form.status,
          releaseDate: form.releaseDate || null,
          categoryId: Number(form.categoryId),
          brandId: Number(form.brandId),
          seriesId: Number(form.seriesId),
        };

        let productId = form.id;
        if (form.id) {
          setStatus?.("Saving product details…");
          await adminApi.updateProduct(form.id, payload);
        } else {
          setStatus?.("Creating product…");
          const created = await adminApi.createProduct(payload);
          productId = created?.id;
        }

        if (removedImageIds.length > 0) {
          setStatus?.("Deleting removed images…");
          for (const imageId of removedImageIds) {
            try {
              await adminApi.deleteProductImage(imageId);
            } catch (err) {
              console.error(`Failed to delete image ${imageId}:`, err);
            }
          }
        }

        if (newFiles.length > 0 && productId) {
          const existingCount = (form.productImages || []).filter(
            (img) => !removedImageIds.includes(img.id)
          ).length;

          for (let i = 0; i < newFiles.length; i++) {
            setStatus?.(`Uploading image ${i + 1} of ${newFiles.length}…`);
            const file = newFiles[i];
            const body = new FormData();
            body.append("productId", productId);
            body.append("file", file);
            body.append("altText", form.productName || file.name);
            body.append("displayOrder", existingCount + i);
            await adminApi.uploadProductImage(body);
          }
        }

        setEditing(null);
        setFeedback("Product saved successfully.");
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

    const changeArchiveState = async (item) => {
      const archived = item.status === "ARCHIVED";
      if (!window.confirm(`${archived ? "Restore" : "Archive"} this product?`)) return;

      try {
        if (archived) {
          await adminApi.restoreProduct(item.id);
        } else {
          await adminApi.archiveProduct(item.id);
        }
        setFeedback(`Product ${archived ? "restored" : "archived"}.`);
        await products.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    const viewProduct = async (id) => {
      setDetailsLoading(true);
      try {
        setSelectedProduct(await adminApi.product(id));
      } catch (error) {
        setFeedback(adminError(error));
      } finally {
        setDetailsLoading(false);
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
                /saved|deleted|archived|restored/.test(feedback)
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
                          onClick={() => viewProduct(item.id)}
                          aria-label={`View ${item.name}`}
                      >
                        <Eye size={15}/> View
                      </button>
                      <button
                          onClick={() =>
                              setEditing({
                                ...item,
                                productName: item.name,
                                price: item.price ?? "",
                                releaseDate: item.releaseDate?.slice(0, 10) || "",
                                productImages: item.productImages || [],
                              })
                          }
                      >
                        <Edit3 size={15}/> Edit
                      </button>

                      <button
                          onClick={() => changeArchiveState(item)}
                      >
                        {item.status === "ARCHIVED" ? "Restore" : "Archive"}
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

          {selectedProduct && (
              <ProductDetailsDialog
                  product={selectedProduct}
                  close={() => setSelectedProduct(null)}
                  createVariant={() => navigate("/admin/product-variants", {
                    state: {productId: selectedProduct.id},
                  })}
              />
          )}

          {detailsLoading && <div className="admin-loading-overlay">Loading product details…</div>}
        </>
    );
  }

  function ProductDialog({product, lookups, save, close}) {
    const [form, setForm] = useState(product);
    const [existingImages, setExistingImages] = useState(product.productImages || []);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const set = (key, value) =>
        setForm((current) => ({...current, [key]: value}));

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    const validateAndAddFiles = (fileList) => {
      setError("");
      const valid = [];
      const errors = [];

      Array.from(fileList).forEach((file) => {
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          errors.push(`"${file.name}" is not a supported image format (JPG, PNG, WEBP).`);
        } else if (file.size > maxSizeBytes) {
          errors.push(`"${file.name}" exceeds the maximum allowed file size of 5MB.`);
        } else {
          valid.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join(" "));
      }

      if (valid.length > 0) {
        setNewFiles((current) => [...current, ...valid]);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    };

    const removeExistingImage = (imageId) => {
      setRemovedImageIds((prev) => [...prev, imageId]);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    };

    const removeNewFile = (index) => {
      setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const submit = async (event) => {
      event.preventDefault();
      setBusy(true);
      setError("");
      setStatusMessage("Saving product…");

      try {
        await save(form, newFiles, removedImageIds, setStatusMessage);
      } catch (err) {
        setError(err.message || "Failed to save product.");
      } finally {
        setBusy(false);
        setStatusMessage("");
      }
    };

    return (
        <Dialog
            title={form.id ? "Edit product" : "Add product"}
            close={close}
        >
          <form className="admin-form" onSubmit={submit}>
            <Notice message={error}/>

            {/* Product Image Upload Section */}
            <div className="admin-image-upload-section">
              <label>
                Product images
                <span style={{ fontWeight: "normal", color: "#666", fontSize: "11px", marginLeft: "4px" }}>
                  (Formats: JPG, PNG, WEBP · Max 5MB per file)
                </span>
              </label>

              <div
                  className={`admin-dropzone ${dragActive ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("admin-product-image-input")?.click()}
              >
                <Upload size={22} style={{ margin: "0 auto", color: "#8d1d28" }} />
                <p>Drag & drop images here or click to browse</p>
                <small>Select one or multiple images from your computer</small>
                <input
                    id="admin-product-image-input"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files) validateAndAddFiles(e.target.files);
                      e.target.value = "";
                    }}
                />
              </div>

              {/* Previews Grid */}
              {(existingImages.length > 0 || newFiles.length > 0) && (
                  <div className="admin-image-grid">
                    {/* Existing Images */}
                    {existingImages.map((img, idx) => (
                        <div key={img.id || idx} className="admin-image-card">
                          <span className="admin-image-tag">Existing</span>
                          <img src={img.imageUrl} alt={img.altText || form.productName} />
                          <button
                              type="button"
                              className="admin-image-card-remove"
                              onClick={() => removeExistingImage(img.id)}
                              title="Remove image"
                          >
                            <X size={13} />
                          </button>
                        </div>
                    ))}

                    {/* New Selected Files */}
                    {newFiles.map((file, idx) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                          <div key={idx} className="admin-image-card">
                            <span className="admin-image-tag" style={{ background: "#286335" }}>New</span>
                            <img src={objectUrl} alt={file.name} onLoad={() => URL.revokeObjectURL(objectUrl)} />
                            <div className="admin-image-card-info">{file.name}</div>
                            <button
                                type="button"
                                className="admin-image-card-remove"
                                onClick={() => removeNewFile(idx)}
                                title="Remove file"
                            >
                              <X size={13} />
                            </button>
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>

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
                {busy ? (statusMessage || "Saving…") : "Save product"}
              </button>
            </div>
          </form>
        </Dialog>
    );
  }

  function ProductDetailsDialog({product, close, createVariant}) {
    const variants = product.productVariants || [];

    return (
        <Dialog title={`${product.name} details`} close={close}>
          <div className="admin-detail">
            <div className="admin-detail-grid">
              <p><b>Product</b><span>{product.name}</span></p>
              <p><b>SKU</b><span>{product.sku || "—"}</span></p>
              <p><b>Status</b><Status>{product.status}</Status></p>
              <p><b>Variants</b><span>{variants.length}</span></p>
            </div>

            <h4>Product variants</h4>
            {variants.length ? (
                <table className="admin-table">
                  <thead>
                  <tr><th>Variant</th><th>SKU</th><th>Attributes</th><th>Price</th></tr>
                  </thead>
                  <tbody>
                  {variants.map((variant) => (
                      <tr key={variant.id}>
                        <td>{variant.name}</td>
                        <td>{variant.sku}</td>
                        <td>{variant.size} · {variant.color}</td>
                        <td>{money(variant.price)}</td>
                      </tr>
                  ))}
                  </tbody>
                </table>
            ) : (
                <div className="admin-state">No variants have been created for this product.</div>
            )}

            <div className="admin-dialog-actions">
              <button type="button" className="admin-secondary" onClick={close}>Close</button>
              <button type="button" onClick={createVariant}><Plus size={15}/> Create variant</button>
            </div>
          </div>
        </Dialog>
    );
  }

  export function ProductVariantsPage() {
    const location = useLocation();
    const initialProductId = location.state?.productId ? String(location.state.productId) : "";
    const loadProducts = useCallback(() => adminApi.products(0, 100), []);
    const products = useLoad(loadProducts);
    const variants = useLoad(adminApi.productVariants);
    const inventories = useLoad(adminApi.inventory);
    const [editing, setEditing] = useState(null);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [query, setQuery] = useState("");
    const [productFilter, setProductFilter] = useState(initialProductId);
    const [statusFilter, setStatusFilter] = useState("");

    const productRecords = products.data?.content || [];
    const productMap = new Map(productRecords.map((product) => [Number(product.id), product]));
    const inventoryMap = new Map(
        (inventories.data || []).map((inventory) => [Number(inventory.productVariantId), inventory])
    );

    const records = (variants.data || []).map((variant) => ({
      ...variant,
      product: productMap.get(Number(variant.productId)),
      productStatus: productMap.get(Number(variant.productId))?.status || "—",
      inventory: inventoryMap.get(Number(variant.id)),
    }));

    const filteredRecords = records.filter((variant) => {
      const searchText = `${variant.productName || ""} ${variant.sku || ""} ${variant.name || ""} ${variant.size || ""} ${variant.color || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase())
          && (!productFilter || Number(variant.productId) === Number(productFilter))
          && (!statusFilter || variant.productStatus === statusFilter);
    });

    const save = async (form) => {
      const payload = {
        productId: Number(form.productId),
        sku: form.sku.trim(),
        name: form.name.trim(),
        price: Number(form.price),
        size: form.size.trim(),
        color: form.color.trim(),
      };

      try {
        if (form.id) {
          await adminApi.updateProductVariant(form.id, payload);
        } else {
          await adminApi.createProductVariant(payload);
        }
        setEditing(null);
        setFeedback(form.id ? "Product variant updated." : "Product variant created successfully.");
        await Promise.all([variants.load(), inventories.load()]);
      } catch (error) {
        setFeedback(adminError(error));
        throw new Error(adminError(error), {cause: error});
      }
    };

    const erase = async (variant) => {
      if (variant.inventoryId || variant.inventory) {
        setFeedback("Remove this variant's inventory record before deleting the variant.");
        return;
      }
      if (!window.confirm(`Delete product variant ${variant.sku}? This cannot be undone.`)) return;

      try {
        await adminApi.deleteProductVariant(variant.id);
        setSelected(null);
        setFeedback("Product variant deleted.");
        await variants.load();
      } catch (error) {
        setFeedback(adminError(error));
      }
    };

    const openCreate = () => setEditing({
      productId: productFilter,
      sku: "",
      name: "",
      price: "",
      size: "",
      color: "",
    });

    const loading = variants.loading || products.loading || inventories.loading;
    const error = variants.error || products.error || inventories.error;

    return (
        <>
          <Header
              title="Product Variants"
              detail="Manage the sellable options connected to each catalogue product."
              action={<button onClick={openCreate}><Plus size={16}/> Create product variant</button>}
          />

          <Notice
              message={feedback}
              type={/created|updated|deleted/.test(feedback) ? "success" : "error"}
          />

          <div className="admin-toolbar admin-variant-toolbar">
            <input
                placeholder="Search product, variant, or SKU"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />
            <select value={productFilter} onChange={(event) => setProductFilter(event.target.value)}>
              <option value="">All products</option>
              {productRecords.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              {["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED", "ARCHIVED"].map((status) => (
                  <option key={status}>{status}</option>
              ))}
            </select>
            <span>{filteredRecords.length} variants</span>
          </div>

          <State loading={loading} error={error} empty={!filteredRecords.length}>
            <table className="admin-table">
              <thead>
              <tr>
                <th>ID</th><th>Product</th><th>SKU</th><th>Variant</th><th>Price</th>
                <th>Attributes</th><th>Status</th><th>Inventory availability</th><th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredRecords.map((variant) => (
                  <tr key={variant.id}>
                    <td>#{variant.id}</td>
                    <td><b>{variant.productName || variant.product?.name || "Unknown product"}</b><small>Product #{variant.productId}</small></td>
                    <td>{variant.sku}</td>
                    <td>{variant.name}</td>
                    <td>{money(variant.price)}</td>
                    <td>{variant.size} · {variant.color}</td>
                    <td><Status>{variant.productStatus}</Status><small>Inherited from product</small></td>
                    <td>{variant.inventory ? `${variant.inventory.availableQuantity} available` : "Not configured"}</td>
                    <td className="admin-actions">
                      <button className="admin-icon" onClick={() => setSelected(variant)} aria-label="View variant"><Eye size={15}/></button>
                      <button onClick={() => setEditing(variant)}><Edit3 size={15}/> Edit</button>
                      <button className="danger" onClick={() => erase(variant)}><Trash2 size={15}/> Delete</button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </State>

          {editing && (
              <ProductVariantDialog
                  variant={editing}
                  products={productRecords}
                  existingVariants={variants.data || []}
                  save={save}
                  close={() => setEditing(null)}
              />
          )}
          {selected && (
              <ProductVariantDetailsDialog
                  variant={selected}
                  close={() => setSelected(null)}
                  edit={() => { setSelected(null); setEditing(selected); }}
              />
          )}
        </>
    );
  }

  function ProductVariantDialog({variant, products, existingVariants, save, close}) {
    const isNew = !variant.id;
    const [form, setForm] = useState(variant);
    const [productQuery, setProductQuery] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const set = (key, value) => setForm((current) => ({...current, [key]: value}));
    const productOptions = products.filter((product) =>
        `${product.name} ${product.sku}`.toLowerCase().includes(productQuery.toLowerCase())
    );

    const validate = () => {
      if (!form.productId) return "Parent product is required.";
      if (!form.sku?.trim()) return "SKU is required.";
      if (existingVariants.some((existing) =>
          existing.id !== form.id && existing.sku?.trim().toLowerCase() === form.sku.trim().toLowerCase()
      )) return "SKU is already used by another product variant.";
      if (!form.name?.trim()) return "Variant name is required.";
      if (!form.size?.trim()) return "Size is required.";
      if (!form.color?.trim()) return "Color is required.";
      if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0.01) return "Price must be greater than zero.";
      return "";
    };

    const submit = async (event) => {
      event.preventDefault();
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }
      setBusy(true);
      setError("");
      try {
        await save(form);
      } catch (saveError) {
        setError(saveError.message || "Could not save product variant.");
      } finally {
        setBusy(false);
      }
    };

    return (
        <Dialog title={isNew ? "Create product variant" : "Edit product variant"} close={close}>
          <form className="admin-form" onSubmit={submit}>
            <Notice message={error}/>
            {isNew && (
                <label>
                  Parent product
                  <input type="search" placeholder="Search product name or SKU" value={productQuery} onChange={(event) => setProductQuery(event.target.value)}/>
                  <select required value={form.productId || ""} onChange={(event) => set("productId", event.target.value)}>
                    <option value="">{products.length ? "Select parent product" : "Loading products…"}</option>
                    {productOptions.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}
                  </select>
                </label>
            )}
            {!isNew && <p><b>Parent product</b><br/>{variant.productName || `Product #${variant.productId}`}<small>Parent product cannot be changed by the existing update endpoint.</small></p>}

            <div className="admin-form-grid">
              <label>SKU<input required value={form.sku || ""} onChange={(event) => set("sku", event.target.value)}/></label>
              <label>Variant name / label<input required value={form.name || ""} onChange={(event) => set("name", event.target.value)}/></label>
              <label>Price<input required type="number" min="0.01" step="0.01" value={form.price ?? ""} onChange={(event) => set("price", event.target.value)}/></label>
              <label>Size<input required value={form.size || ""} onChange={(event) => set("size", event.target.value)}/></label>
              <label>Color<input required value={form.color || ""} onChange={(event) => set("color", event.target.value)}/></label>
            </div>

            <div className="admin-form-note"><b>Status</b><span>Inherited from the parent product: {products.find((product) => Number(product.id) === Number(form.productId))?.status || "—"}</span></div>
            <div className="admin-dialog-actions">
              <button type="button" className="admin-secondary" onClick={close}>Cancel</button>
              <button disabled={busy}>{busy ? "Saving…" : isNew ? "Create variant" : "Save changes"}</button>
            </div>
          </form>
        </Dialog>
    );
  }

  function ProductVariantDetailsDialog({variant, close, edit}) {
    return (
        <Dialog title={`Variant #${variant.id}`} close={close}>
          <div className="admin-detail">
            <div className="admin-detail-grid">
              <p><b>Product</b><span>{variant.productName || `Product #${variant.productId}`}</span></p>
              <p><b>SKU</b><span>{variant.sku}</span></p>
              <p><b>Variant</b><span>{variant.name}</span></p>
              <p><b>Price</b><span>{money(variant.price)}</span></p>
              <p><b>Size</b><span>{variant.size}</span></p>
              <p><b>Color</b><span>{variant.color}</span></p>
              <p><b>Inventory</b><span>{variant.inventory ? `${variant.inventory.availableQuantity} available` : "Not configured"}</span></p>
            </div>
            <div className="admin-dialog-actions">
              <button type="button" className="admin-secondary" onClick={close}>Close</button>
              <button type="button" onClick={edit}><Edit3 size={15}/> Edit variant</button>
            </div>
          </div>
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
    const users = useLoad(adminApi.users);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortDirection, setSortDirection] = useState("newest");
    const [page, setPage] = useState(0);
    const [menuId, setMenuId] = useState(null);
    const [selected, setSelected] = useState(null);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [statusBusy, setStatusBusy] = useState(false);
    const [feedback, setFeedback] = useState("");
    const pageSize = 10;

    const customers = (users.data || []).filter((user) => user.role !== "ADMIN");
    const filtered = customers
        .filter((user) => {
          const name = `${user.firstName || ""} ${user.lastName || ""}`;
          return `${name} ${user.username || ""} ${user.email || ""}`
              .toLowerCase()
              .includes(query.toLowerCase())
              && (!statusFilter || user.status === statusFilter);
        })
        .sort((a, b) => {
          const difference = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          return sortDirection === "newest" ? -difference : difference;
        });
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const visibleCustomers = filtered.slice(page * pageSize, (page + 1) * pageSize);

    const actionsFor = (user) => {
      switch (user.status) {
        case "ACTIVE":
          return [["Deactivate Account", "INACTIVE"], ["Suspend Account", "SUSPENDED"]];
        case "INACTIVE":
          return [["Activate Account", "ACTIVE"], ["Suspend Account", "SUSPENDED"]];
        case "SUSPENDED":
          return [["Reactivate Account", "ACTIVE"], ["Deactivate Account", "INACTIVE"]];
        default:
          return [];
      }
    };

    const changeStatus = async () => {
      if (!pendingStatus) return;
      setStatusBusy(true);
      try {
        await adminApi.updateUserStatus(pendingStatus.user.id, pendingStatus.status);
        setFeedback(`${pendingStatus.user.username} is now ${pendingStatus.status}.`);
        setPendingStatus(null);
        setMenuId(null);
        await users.load();
      } catch (error) {
        setFeedback(adminError(error));
      } finally {
        setStatusBusy(false);
      }
    };

    return (
        <>
          <Header
              title="Customers"
              detail="Search customer accounts, review activity, and manage access status."
              action={<button onClick={users.load}><RefreshCw size={15}/> Refresh</button>}
          />

          <Notice message={feedback} type={feedback.includes(" is now ") ? "success" : "error"}/>

          <div className="admin-toolbar admin-customer-toolbar">
            <input placeholder="Search name, username, or email" value={query} onChange={(event) => { setPage(0); setQuery(event.target.value); }}/>
            <select value={statusFilter} onChange={(event) => { setPage(0); setStatusFilter(event.target.value); }}>
              <option value="">All statuses</option>
              {["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"].map((status) => <option key={status}>{status}</option>)}
            </select>
            <select value={sortDirection} onChange={(event) => { setPage(0); setSortDirection(event.target.value); }}>
              <option value="newest">Registration: newest</option>
              <option value="oldest">Registration: oldest</option>
            </select>
            <span>{filtered.length} customers</span>
          </div>

          <State loading={users.loading} error={users.error} empty={!filtered.length}>
            <table className="admin-table">
              <thead>
              <tr><th>Customer</th><th>Username</th><th>Email</th><th>Phone</th><th>Status</th><th>Registered</th><th>Actions</th></tr>
              </thead>
              <tbody>
              {visibleCustomers.map((user) => (
                  <tr key={user.id}>
                    <td><b>{user.firstName} {user.lastName}</b></td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td><Status className={`admin-status-${user.status?.toLowerCase()}`}>{user.status}</Status></td>
                    <td>{date(user.createdAt)}</td>
                    <td className="admin-customer-actions">
                      <button className="admin-icon" onClick={() => setMenuId(menuId === user.id ? null : user.id)} aria-label={`Actions for ${user.username}`}><MoreHorizontal size={17}/></button>
                      {menuId === user.id && (
                          <div className="admin-row-menu">
                            <button type="button" onClick={() => { setSelected(user); setMenuId(null); }}>View Customer Details</button>
                            {actionsFor(user).map(([label, status]) => (
                                <button key={status} type="button" onClick={() => { setPendingStatus({user, status, label}); setMenuId(null); }}>{label}</button>
                            ))}
                          </div>
                      )}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
            <div className="admin-pagination">
              <span>Page {page + 1} of {pageCount}</span>
              <div>
                <button className="admin-secondary" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</button>
                <button className="admin-secondary" disabled={page >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>Next</button>
              </div>
            </div>
          </State>

          {selected && (
              <CustomerDetailsDialog
                  customer={selected}
                  close={() => setSelected(null)}
              />
          )}
          {pendingStatus && (
              <StatusConfirmationDialog
                  pending={pendingStatus}
                  busy={statusBusy}
                  close={() => !statusBusy && setPendingStatus(null)}
                  confirm={changeStatus}
              />
          )}
        </>
    );
  }

  function StatusConfirmationDialog({pending, busy, close, confirm}) {
    return (
        <Dialog title="Confirm account status change" close={close}>
          <div className="admin-detail">
            <p>This will change the customer account status and affect future authentication.</p>
            <div className="admin-line"><span>Username</span><b>{pending.user.username}</b></div>
            <div className="admin-line"><span>Current status</span><Status>{pending.user.status}</Status></div>
            <div className="admin-line"><span>New status</span><Status className={`admin-status-${pending.status.toLowerCase()}`}>{pending.status}</Status></div>
            <div className="admin-dialog-actions">
              <button type="button" className="admin-secondary" disabled={busy} onClick={close}>Cancel</button>
              <button type="button" disabled={busy} onClick={confirm}>{busy ? "Updating…" : pending.label}</button>
            </div>
          </div>
        </Dialog>
    );
  }

  function CustomerDetailsDialog({customer, close}) {
    const loadActivity = useCallback(() => Promise.all([adminApi.orders(), adminApi.payments()]), []);
    const activity = useLoad(loadActivity);
    const [orders, payments] = activity.data || [[], []];
    const customerOrders = (orders || [])
        .filter((order) => Number(order.userId) === Number(customer.id))
        .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0));
    const paymentByOrder = new Map((payments || []).map((payment) => [Number(payment.orderId), payment]));
    const totalSpending = customerOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return (
        <Dialog title={`${customer.firstName} ${customer.lastName}`} close={close}>
          <div className="admin-detail">
            <div className="admin-detail-grid">
              <p><b>Full name</b><span>{customer.firstName} {customer.lastName}</span></p>
              <p><b>Username</b><span>{customer.username}</span></p>
              <p><b>Email</b><span>{customer.email}</span></p>
              <p><b>Phone</b><span>{customer.phoneNumber}</span></p>
              <p><b>Status</b><Status className={`admin-status-${customer.status?.toLowerCase()}`}>{customer.status}</Status></p>
              <p><b>Registered</b><span>{date(customer.createdAt)}</span></p>
            </div>

            <div className="admin-stats admin-customer-stats">
              <Stat label="Total orders" value={activity.loading ? "…" : customerOrders.length}/>
              <Stat label="Total spending" value={activity.loading ? "…" : money(totalSpending)}/>
              <Stat label="Most recent order" value={activity.loading ? "…" : customerOrders[0] ? `#${customerOrders[0].orderNumber || customerOrders[0].id}` : "—"}/>
            </div>

            <h4>Order history</h4>
            {activity.loading ? <div className="admin-state">Loading customer activity…</div> : activity.error ? <Notice message={activity.error}/> : customerOrders.length ? (
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>{customerOrders.map((order) => <tr key={order.id}>
                    <td>#{order.orderNumber || order.id}</td>
                    <td>{date(order.orderDate)}</td>
                    <td>{money(order.totalAmount)}</td>
                    <td>{paymentByOrder.get(Number(order.id))?.status || (order.paymentId ? "Recorded" : "—")}</td>
                    <td><Status>{order.status}</Status></td>
                  </tr>)}</tbody>
                </table>
            ) : <div className="admin-state">No orders have been recorded for this customer.</div>}
          </div>
        </Dialog>
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
        const payload = {
          quantity: Number(form.quantity),
          reservedQuantity: Number(form.reservedQuantity),
          reorderLevel: Number(form.reorderLevel),
          productVariantId: Number(form.productVariantId),
        };

        if (form.id) {
          await adminApi.updateInventory(form.id, payload);
        } else {
          await adminApi.createInventory(payload);
        }

        setEditing(null);
        setFeedback(form.id ? "Inventory updated." : "Inventory created successfully.");
        await inventory.load();
      } catch (error) {
        setFeedback(adminError(error));
        throw new Error(adminError(error), {cause: error});
      }
    };

    return (
        <>
          <Header
              title="Inventory"
              detail="Stock levels are managed through the existing inventory service."
              action={
                <button onClick={() => setEditing({})}>
                  <Plus size={16}/> Add inventory
                </button>
              }
          />

          <Notice
              message={feedback}
              type={/created|updated successfully|updated\./i.test(feedback) ? "success" : "error"}
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
                  existingInventory={inventory.data || []}
                  save={save}
                  close={() => setEditing(null)}
              />
          )}
        </>
    );
  }

  function InventoryDialog({item, existingInventory, save, close}) {
    const isNew = !item.id;
    const [form, setForm] = useState(
        isNew
            ? {productVariantId: "", quantity: 0, reservedQuantity: 0, reorderLevel: 5}
            : item
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [variantQuery, setVariantQuery] = useState("");
    const loadVariants = useCallback(() => adminApi.productVariants(), []);
    const variants = useLoad(loadVariants);

    const existingVariantIds = new Set(
        existingInventory.map((inventoryItem) => Number(inventoryItem.productVariantId))
    );
    const availableVariants = (variants.data || []).filter((variant) => {
      if (!isNew && Number(variant.id) === Number(form.productVariantId)) return true;
      if (variant.inventoryId || existingVariantIds.has(Number(variant.id))) return false;

      const searchText = `${variant.productName || ""} ${variant.name || ""} ${variant.sku || ""} ${variant.size || ""} ${variant.color || ""}`.toLowerCase();
      return searchText.includes(variantQuery.toLowerCase());
    });

    const quantity = Number(form.quantity);
    const reservedQuantity = Number(form.reservedQuantity);
    const availableQuantity = Number.isFinite(quantity) && Number.isFinite(reservedQuantity)
        ? quantity - reservedQuantity
        : 0;

    const set = (key, value) => setForm((current) => ({...current, [key]: value}));

    const validate = () => {
      if (isNew && !form.productVariantId) return "Please select a product variant.";

      for (const [label, value] of [
        ["Initial stock quantity", form.quantity],
        ["Reserved quantity", form.reservedQuantity],
        ["Reorder level", form.reorderLevel],
      ]) {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 0) {
          return `${label} must be a whole number greater than or equal to zero.`;
        }
      }

      if (Number(form.reservedQuantity) > Number(form.quantity)) {
        return "Reserved quantity cannot exceed total quantity.";
      }

      return "";
    };

    const submit = async (event) => {
      event.preventDefault();

      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      setBusy(true);
      setError("");

      try {
        await save(form);
      } catch (saveError) {
        setError(saveError.message || "Could not save inventory.");
      } finally {
        setBusy(false);
      }
    };

    return (
        <Dialog title={isNew ? "Add new inventory" : "Update inventory"} close={close}>
          <form className="admin-form" onSubmit={submit}>
            <Notice message={error}/>

            {isNew ? (
                <div className="admin-variant-picker">
                  <label>
                    Product variant
                    <input
                        type="search"
                        placeholder="Search product, variant, or SKU"
                        value={variantQuery}
                        onChange={(event) => setVariantQuery(event.target.value)}
                    />
                    <select
                        required
                        value={form.productVariantId}
                        onChange={(event) => set("productVariantId", event.target.value)}
                    >
                      <option value="">
                        {variants.loading ? "Loading variants…" : "Select a product variant"}
                      </option>
                      {availableVariants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.productName || "Product"} · {variant.name || "Variant"} · {variant.sku}
                          </option>
                      ))}
                    </select>
                    {!variants.loading && !variants.error && !availableVariants.length && (
                        <small className="admin-form-hint">All matching variants already have inventory.</small>
                    )}
                    {variants.error && <Notice message={variants.error}/>}
                  </label>
                </div>
            ) : (
                <p>Variant #{form.productVariantId}</p>
            )}

            {["quantity", "reservedQuantity", "reorderLevel"].map((key) => (
                <label key={key}>
                  {key === "quantity" ? "Initial stock quantity" : key === "reservedQuantity" ? "Reserved quantity" : "Reorder level"}
                  <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={form[key]}
                      onChange={(event) => set(key, event.target.value)}
                  />
                </label>
            ))}

            <div className="admin-stock-preview" aria-live="polite">
              <p>Live stock preview</p>
              <div>
                <span><small>In stock</small><b>{Number.isFinite(quantity) ? quantity : 0}</b></span>
                <span><small>Reserved</small><b>{Number.isFinite(reservedQuantity) ? reservedQuantity : 0}</b></span>
                <span><small>Available</small><b className={availableQuantity < 0 ? "is-negative" : ""}>{availableQuantity}</b></span>
              </div>
            </div>

            <div className="admin-dialog-actions">
              <button
                  type="button"
                  className="admin-secondary"
                  onClick={close}
              >
                Cancel
              </button>
              <button disabled={busy || (isNew && variants.loading)}>
                {busy ? "Saving…" : isNew ? "Create inventory" : "Save"}
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
