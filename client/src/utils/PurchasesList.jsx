import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";

export default function PurchasesList() {
  // ------------------------------------------------------------
  // 1) ROLE & NAVIGATION
  // ------------------------------------------------------------
  const { userInfo } = useSelector((state) => state.auth);
  const userRole = userInfo?.role || "user";
  const navigate = useNavigate();

  // Only admin/staff can add new purchases
  const canAddPurchase = userRole === "admin" || userRole === "staff";

  // ------------------------------------------------------------
  // 2) STATES
  // ------------------------------------------------------------
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [firms, setFirms] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal for adding a new Purchase
  const [modalOpen, setModalOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    productId: "",
    quantity: 1,
    purchasePrice: 0, // The actual price paid in this purchase
    firmId: "",
    buyerId: "",
  });

  // ------------------------------------------------------------
  // 3) TOP-LEVEL FILTERS (TABLE)
  // ------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedFirm, setSelectedFirm] = useState("all");
  const [selectedBuyer, setSelectedBuyer] = useState("all");

  // ------------------------------------------------------------
  // 4) FETCH DATA
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Purchases (all)
        const respPurch = await apiClient.get("/purchases?limit=0");
        setPurchases(respPurch.data.data || []);

        // 2) Products (all) - product.price => average market price
        const respProd = await apiClient.get("/products?limit=0");
        setProducts(respProd.data.data || []);

        // 3) Firms (all)
        const respFirms = await apiClient.get("/firms?limit=0");
        setFirms(respFirms.data.data || []);

        // 4) Users: fetch all, then filter to staff/admin only (for buyer dropdown)
        const respUsers = await apiClient.get("/users?limit=0");
        const allUsers = respUsers.data.data || [];
        const staffAdmins = allUsers.filter(
          (u) => u.role === "staff" || u.role === "admin"
        );
        setUsers(staffAdmins);

        // 5) Categories (all)
        const respCats = await apiClient.get("/categories?limit=0");
        setCategories(respCats.data.data || []);

        // 6) Brands (all)
        const respBrands = await apiClient.get("/brands?limit=0");
        setBrands(respBrands.data.data || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data in PurchasesList:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ------------------------------------------------------------
  // 5) ADD PURCHASE (MODAL) with Category/Brand filters
  // ------------------------------------------------------------
  const [modalCategory, setModalCategory] = useState("all");
  const [modalBrand, setModalBrand] = useState("all");

  const openModal = () => {
    setNewPurchase({
      productId: "",
      quantity: 1,
      purchasePrice: 0,
      firmId: "",
      buyerId: "",
    });
    setModalCategory("all");
    setModalBrand("all");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPurchase((prev) => ({ ...prev, [name]: value }));
  };

  // Modal logic: filter products by chosen category/brand
  const modalFilteredProducts = products.filter((p) => {
    const catId = p.categoryId?._id || p.categoryId;
    const brId = p.brandId?._id || p.brandId;

    if (modalCategory !== "all" && catId !== modalCategory) return false;
    if (modalBrand !== "all" && brId !== modalBrand) return false;

    return true;
  });

  const savePurchase = async () => {
    try {
      const quantity = Number(newPurchase.quantity) || 1;
      const purchasePrice = Number(newPurchase.purchasePrice) || 0;

      if (!newPurchase.productId) {
        alert("Please select a product");
        return;
      }
      if (!newPurchase.firmId) {
        alert("Please select a firm");
        return;
      }
      if (!newPurchase.buyerId) {
        alert("Please select a buyer");
        return;
      }

      const payload = {
        productId: newPurchase.productId,
        firmId: newPurchase.firmId,
        buyerId: newPurchase.buyerId,
        quantity,
        purchasePrice,
      };

      const resp = await apiClient.post("/purchases", payload);
      const created = resp.data.data;
      if (created) {
        // immediately add to state so it appears in the table
        setPurchases((prev) => [...prev, created]);
        closeModal();
      }
    } catch (err) {
      console.error("Error saving purchase:", err);
      alert("Could not save purchase. See console for details.");
    }
  };

  // ------------------------------------------------------------
  // 6) HELPERS: GET NAMES (Product, Category, Brand, Firm, Buyer)
  // ------------------------------------------------------------
  function getProductById(id) {
    return products.find((p) => p._id === id);
  }
  function getProductNameById(id) {
    const p = getProductById(id);
    return p ? p.name : "Unknown Product";
  }
  function getCategoryName(product) {
    if (!product) return "Unknown Category";
    const catId = product.categoryId?._id || product.categoryId;
    const cat = categories.find((c) => c._id === catId);
    return cat ? cat.name : "Unknown Category";
  }
  function getBrandName(product) {
    if (!product) return "Unknown Brand";
    const brId = product.brandId?._id || product.brandId;
    const br = brands.find((b) => b._id === brId);
    return br ? br.name : "Unknown Brand";
  }
  function getFirmNameById(id) {
    const f = firms.find((firm) => firm._id === id);
    return f ? f.name : "Unknown Firm";
  }
  function getBuyerNameById(id) {
    const u = users.find((user) => user._id === id);
    return u ? u.username : "Unknown Buyer";
  }

  // ------------------------------------------------------------
  // 7) FILTER LOGIC (TABLE)
  // ------------------------------------------------------------
  function matchesFilter(purchase) {
    const product = getProductById(purchase.productId);

    // Category
    if (selectedCategory !== "all") {
      if (!product) return false;
      const catId = product.categoryId?._id || product.categoryId;
      if (catId !== selectedCategory) return false;
    }

    // Brand
    if (selectedBrand !== "all") {
      if (!product) return false;
      const brId = product.brandId?._id || product.brandId;
      if (brId !== selectedBrand) return false;
    }

    // Product
    if (selectedProduct !== "all" && purchase.productId !== selectedProduct) {
      return false;
    }

    // Firm
    if (selectedFirm !== "all" && purchase.firmId !== selectedFirm) {
      return false;
    }

    // Buyer
    if (selectedBuyer !== "all" && purchase.buyerId !== selectedBuyer) {
      return false;
    }

    return true;
  }

  const filteredPurchases = purchases.filter(matchesFilter);

  // ------------------------------------------------------------
  // 8) TABLE ROWS
  // ------------------------------------------------------------
  const tableRows = filteredPurchases.map((purchase, index) => {
    const product = getProductById(purchase.productId);
    // The product's "price" field is the average market price from DB
    const marketPrice = product?.price || 0;

    // The actual purchase price for this record
    const purchasePrice = purchase.purchasePrice || 0;
    const qty = purchase.quantity || 0;
    const total = qty * purchasePrice;

    return (
      <tr
        key={purchase._id}
        className="transition bg-white border-b hover:bg-gray-50"
      >
        <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
        <td className="px-4 py-2 text-sm font-semibold text-gray-900">
          {getProductNameById(purchase.productId)}
        </td>
        <td className="px-4 py-2 text-sm text-gray-600">
          {getCategoryName(product)}
        </td>
        <td className="px-4 py-2 text-sm text-gray-600">
          {getBrandName(product)}
        </td>
        {/* Show product.price as the "Market Price" */}
        <td className="px-4 py-2 text-sm text-gray-600">
          ${marketPrice.toFixed(2)}
        </td>
        {/* The actual purchase price user paid */}
        <td className="px-4 py-2 text-sm text-gray-600">
          ${purchasePrice.toFixed(2)}
        </td>
        <td className="px-4 py-2 text-sm text-gray-600">{qty}</td>
        <td className="px-4 py-2 text-sm font-bold text-gray-800">
          ${total.toFixed(2)}
        </td>
        <td className="px-4 py-2 text-sm text-gray-600">
          {getFirmNameById(purchase.firmId)}
        </td>
        <td className="px-4 py-2 text-sm text-gray-600">
          {getBuyerNameById(purchase.buyerId)}
        </td>
      </tr>
    );
  });

  // ------------------------------------------------------------
  // 9) AGGREGATIONS
  // ------------------------------------------------------------
  // Global total paid (filtered)
  const totalPaidAll = filteredPurchases.reduce((sum, p) => {
    const qty = p.quantity || 0;
    const pp = p.purchasePrice || 0;
    return sum + qty * pp;
  }, 0);

  // Average purchase price per product (filtered)
  const productMap = {};
  filteredPurchases.forEach((p) => {
    if (!productMap[p.productId]) {
      productMap[p.productId] = { totalSpent: 0, totalQty: 0 };
    }
    productMap[p.productId].totalSpent += p.quantity * p.purchasePrice;
    productMap[p.productId].totalQty += p.quantity;
  });

  const productAverages = Object.keys(productMap).map((productId) => {
    const { totalSpent, totalQty } = productMap[productId];
    const avgPrice = totalQty > 0 ? totalSpent / totalQty : 0;
    return { productId, avgPrice };
  });

  // Total paid by each buyer (filtered)
  const buyerMap = {};
  filteredPurchases.forEach((p) => {
    if (!buyerMap[p.buyerId]) {
      buyerMap[p.buyerId] = 0;
    }
    buyerMap[p.buyerId] += p.quantity * p.purchasePrice;
  });
  const buyerTotals = Object.keys(buyerMap).map((buyerId) => ({
    buyerId,
    total: buyerMap[buyerId],
  }));

  // ------------------------------------------------------------
  // 10) CONDITIONAL RENDER
  // ------------------------------------------------------------
  if (loading) {
    return <p className="m-4 text-lg">Loading purchases...</p>;
  }
  if (error) {
    return <p className="m-4 text-lg text-red-600">{error}</p>;
  }

  // ------------------------------------------------------------
  // 11) RETURN
  // ------------------------------------------------------------
  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Top Bar: Title, Dashboard button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Purchases List</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            ➤ Dashboard
          </button>
          {canAddPurchase && (
            <button
              onClick={openModal}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              + Add Purchase
            </button>
          )}
        </div>
      </div>

      {/* FILTERS: Category, Brand, Product, Firm, Buyer (TOP) */}
      <div className="flex flex-col items-start mb-4 space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
        {/* Category Filter */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-48 px-2 py-1 border rounded"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-48 px-2 py-1 border rounded"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Filter */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-48 px-2 py-1 border rounded"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Firm Filter */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Firm
          </label>
          <select
            value={selectedFirm}
            onChange={(e) => setSelectedFirm(e.target.value)}
            className="w-48 px-2 py-1 border rounded"
          >
            <option value="all">All Firms</option>
            {firms.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buyer Filter */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            Buyer
          </label>
          <select
            value={selectedBuyer}
            onChange={(e) => setSelectedBuyer(e.target.value)}
            className="w-48 px-2 py-1 border rounded"
          >
            <option value="all">All Buyers</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.username} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                No
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Product
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Brand
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Market Price
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Purchase Price
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Qty
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Total
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Firm
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Buyer
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{tableRows}</tbody>
        </table>
      </div>

      {/* SUMMARIES */}
      <div className="mt-6 space-y-4">
        {/* Global total */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Global Totals (Filtered)
          </h2>
          <p className="text-gray-700">
            <strong>Total Paid:</strong> ${totalPaidAll.toFixed(2)}
          </p>
        </div>

        {/* Average purchase price per product (filtered) */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Average Purchase Price per Product (Filtered)
          </h2>
          {productAverages.map(({ productId, avgPrice }) => (
            <p key={productId} className="text-gray-700">
              <strong>{getProductNameById(productId)}</strong>:{" $"}
              {avgPrice.toFixed(2)}
            </p>
          ))}
        </div>

        {/* Total paid by each buyer (filtered) */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Total Paid by Buyer (Filtered)
          </h2>
          {buyerTotals.map(({ buyerId, total }) => (
            <p key={buyerId} className="text-gray-700">
              <strong>{getBuyerNameById(buyerId)}</strong>: ${total.toFixed(2)}
            </p>
          ))}
        </div>
      </div>

      {/* ADD PURCHASE MODAL */}
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left bg-white rounded shadow-xl">
                  <Dialog.Title className="mb-4 text-lg font-bold text-gray-700">
                    Add New Purchase
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Category (Modal Filter) */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Category
                      </label>
                      <select
                        name="modalCategory"
                        value={modalCategory}
                        onChange={(e) => setModalCategory(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand (Modal Filter) */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Brand
                      </label>
                      <select
                        name="modalBrand"
                        value={modalBrand}
                        onChange={(e) => setModalBrand(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="all">All Brands</option>
                        {brands.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Product (Filtered) */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Product
                      </label>
                      <select
                        name="productId"
                        value={newPurchase.productId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Product --</option>
                        {modalFilteredProducts.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Show category/brand/marketPrice read-only if product selected */}
                    {newPurchase.productId && (
                      <>
                        <div>
                          <label className="block mb-1 text-sm font-semibold">
                            Selected Category
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border rounded"
                            value={(function () {
                              const chosen = products.find(
                                (prod) => prod._id === newPurchase.productId
                              );
                              if (!chosen) return "Unknown Category";
                              const catId =
                                chosen.categoryId?._id || chosen.categoryId;
                              const cat = categories.find(
                                (c) => c._id === catId
                              );
                              return cat ? cat.name : "Unknown Category";
                            })()}
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-semibold">
                            Selected Brand
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border rounded"
                            value={(function () {
                              const chosen = products.find(
                                (prod) => prod._id === newPurchase.productId
                              );
                              if (!chosen) return "Unknown Brand";
                              const brId =
                                chosen.brandId?._id || chosen.brandId;
                              const br = brands.find((b) => b._id === brId);
                              return br ? br.name : "Unknown Brand";
                            })()}
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-semibold">
                            Market Price (from DB)
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border rounded"
                            value={(function () {
                              const chosen = products.find(
                                (prod) => prod._id === newPurchase.productId
                              );
                              if (!chosen) return "$0.00";
                              const mp = chosen.price || 0;
                              return `$${mp.toFixed(2)}`;
                            })()}
                          />
                        </div>
                      </>
                    )}

                    {/* Firm */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Firm
                      </label>
                      <select
                        name="firmId"
                        value={newPurchase.firmId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Firm --</option>
                        {firms.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Buyer */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Buyer (Staff/Admin)
                      </label>
                      <select
                        name="buyerId"
                        value={newPurchase.buyerId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Buyer --</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.username} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={newPurchase.quantity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    {/* Purchase Price (Paid) with $ sign */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Purchase Price
                      </label>
                      <div className="relative">
                        <span className="absolute text-gray-500 left-3 top-2">
                          $
                        </span>
                        <input
                          type="number"
                          name="purchasePrice"
                          step="0.01"
                          min="0"
                          value={newPurchase.purchasePrice}
                          onChange={handleInputChange}
                          className="w-full py-2 border rounded px-7"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      onClick={savePurchase}
                      className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
