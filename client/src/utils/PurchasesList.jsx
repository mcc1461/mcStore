/********************************************************************************************
 * FILE: src/utils/PurchasesList.jsx
 * LINES: ~1080 (full code with minimal modifications to ensure product quantity is updated)
 ********************************************************************************************/

import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import { all } from "axios";
import { formatCurrency } from "./formatCurrency";

/************************************************************************************
 * 1) ROLE & NAVIGATION
 ************************************************************************************/
export default function PurchasesList() {
  // Access user info from Redux
  const { userInfo } = useSelector((state) => state.auth);
  const userRole = userInfo?.role || "user";
  const navigate = useNavigate();

  // Determine if user can add/edit/delete (admin/staff)
  const canAddPurchase = userRole === "admin" || userRole === "staff";

  /************************************************************************************
   * 2) STATES
   ************************************************************************************/
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [firms, setFirms] = useState([]);
  const [users, setUsers] = useState([]); // staff+admin list for Buyer dropdown
  const [allUsers, setAllUsers] = useState([]); // for filtering & name lookups
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // CREATE Purchase modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    productId: "",
    quantity: 1,
    purchasePrice: 0,
    firmId: "",
    userId: userInfo?._id || "",
    buyerId: "",
  });

  // EDIT Purchase modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPurchase, setEditPurchase] = useState({
    _id: null,
    productId: "",
    quantity: 1,
    purchasePrice: 0,
    firmId: "",
    buyerId: "",
  });

  /************************************************************************************
   * 3) FILTERS (top-level)
   ************************************************************************************/
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedFirm, setSelectedFirm] = useState("all");
  const [selectedBuyer, setSelectedBuyer] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");

  // Compute available categories based on current brand and product filters
  const availableCategories = categories.filter((cat) =>
    products.some((p) => {
      const pCat = p.categoryId?._id || p.categoryId;
      const pBrand = p.brandId?._id || p.brandId;
      if (selectedBrand !== "all" && pBrand !== selectedBrand) return false;
      if (selectedProduct !== "all" && p._id !== selectedProduct) return false;
      return pCat === cat._id;
    })
  );

  // Compute available brands based on current category and product filters
  const availableBrands = brands.filter((br) =>
    products.some((p) => {
      const pCat = p.categoryId?._id || p.categoryId;
      const pBrand = p.brandId?._id || p.brandId;
      if (selectedCategory !== "all" && pCat !== selectedCategory) return false;
      if (selectedProduct !== "all" && p._id !== selectedProduct) return false;
      return pBrand === br._id;
    })
  );

  // Compute available products based on current category and brand filters
  const availableProducts = products.filter((p) => {
    const pCat = p.categoryId?._id || p.categoryId;
    const pBrand = p.brandId?._id || p.brandId;
    if (selectedCategory !== "all" && pCat !== selectedCategory) return false;
    if (selectedBrand !== "all" && pBrand !== selectedBrand) return false;
    return true;
  });

  /************************************************************************************
   * 4) FETCH DATA (Initial load)
   ************************************************************************************/
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Purchases from /purchases
        const respPurch = await apiClient.get("/purchases?limit=0");
        setPurchases(respPurch.data.data || []);

        // 2) Products from /products
        const respProd = await apiClient.get("/products?limit=0");
        setProducts(respProd.data.data || []);

        // 3) Firms
        const respFirms = await apiClient.get("/firms?limit=0");
        setFirms(respFirms.data.data || []);

        // 4) All users
        const respUsers = await apiClient.get("/users?limit=0");
        const allFetchedUsers = respUsers.data.data || [];
        const staffAdmins = allFetchedUsers.filter(
          (u) => u.role === "staff" || u.role === "admin"
        );
        setUsers(staffAdmins); // for Buyer dropdown
        setAllUsers(allFetchedUsers); // entire list for name lookups

        // 5) Categories
        const respCats = await apiClient.get("/categories?limit=0");
        setCategories(respCats.data.data || []);

        // 6) Brands
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

  /************************************************************************************
   * 5) CREATE PURCHASE
   ************************************************************************************/
  const [modalCategory, setModalCategory] = useState("all");
  const [modalBrand, setModalBrand] = useState("all");

  const openModal = () => {
    setNewPurchase({
      productId: "",
      quantity: 1,
      purchasePrice: 0,
      firmId: "",
      userId: userInfo?._id || "",
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

  // Filter products by chosen category/brand in create modal
  const modalFilteredProducts = products.filter((p) => {
    const catId = p.categoryId?._id || p.categoryId;
    const brId = p.brandId?._id || p.brandId;

    if (modalCategory !== "all" && catId !== modalCategory) return false;
    if (modalBrand !== "all" && brId !== modalBrand) return false;
    return true;
  });

  // Save purchase => increments product quantity on server side
  async function savePurchase() {
    try {
      const quantity = Number(newPurchase.quantity) || 1;
      const purchasePrice = Number(newPurchase.purchasePrice) || 0;

      // quick validations
      if (!newPurchase.productId) {
        alert("Please select a product.");
        return;
      }
      if (!newPurchase.firmId) {
        alert("Please select a firm.");
        return;
      }
      if (!newPurchase.buyerId) {
        alert("Please select a buyer.");
        return;
      }
      if (!newPurchase.userId) {
        alert("No user ID found! Are you logged in?");
        return;
      }

      // find brandId from chosen product
      const chosenProduct = products.find(
        (prod) => prod._id === newPurchase.productId
      );
      const brandId =
        chosenProduct?.brandId?._id || chosenProduct?.brandId || null;
      if (!brandId) {
        alert("No brandId found for this product! brandId is required.");
        return;
      }

      const payload = {
        productId: newPurchase.productId,
        brandId,
        userId: newPurchase.userId,
        firmId: newPurchase.firmId,
        buyerId: newPurchase.buyerId,
        quantity,
        purchasePrice,
      };

      // POST /purchases => increments product quantity
      const resp = await apiClient.post("/purchases", payload);

      // Re-fetch products to see updated quantity
      const respProd = await apiClient.get("/products?limit=0");
      setProducts(respProd.data.data || []);

      // Add new purchase to local state
      const created = resp.data.data;
      if (created) {
        setPurchases((prev) => [...prev, created]);
        closeModal();
      }
    } catch (err) {
      console.error("Error saving purchase:", err);
      alert("Could not save purchase. See console for details.");
    }
  }

  /************************************************************************************
   * 6) EDIT PURCHASE
   ************************************************************************************/
  function openEditModal(purchase) {
    setEditPurchase({
      _id: purchase._id,
      productId: purchase.productId,
      quantity: purchase.quantity,
      purchasePrice: purchase.purchasePrice,
      firmId: purchase.firmId,
      buyerId: purchase.buyerId,
    });
    setEditModalOpen(true);
  }
  function closeEditModal() {
    setEditModalOpen(false);
  }
  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditPurchase((prev) => ({ ...prev, [name]: value }));
  }

  // Update purchase => adjusts product quantity by difference
  async function updatePurchase() {
    try {
      if (!editPurchase._id) return;

      const quantity = Number(editPurchase.quantity) || 1;
      const purchasePrice = Number(editPurchase.purchasePrice) || 0;

      const payload = {
        firmId: editPurchase.firmId,
        buyerId: editPurchase.buyerId,
        quantity,
        purchasePrice,
      };

      // PUT /purchases/:id => re-fetch products
      const resp = await apiClient.put(
        `/purchases/${editPurchase._id}`,
        payload
      );
      if (resp.data && resp.data.data) {
        const updated = resp.data.data;

        // update local purchases
        setPurchases((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );

        // re-fetch products => updated quantity
        const respProd = await apiClient.get("/products?limit=0");
        setProducts(respProd.data.data || []);

        closeEditModal();
      }
    } catch (err) {
      console.error("Error updating purchase:", err);
      alert("Could not update purchase. See console for details.");
    }
  }

  /************************************************************************************
   * 7) HELPERS
   ************************************************************************************/
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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
    if (!id) return "Unknown Buyer";
    const strId = id.toString();
    const found = allUsers.find((u) => u._id === strId);
    return found ? capitalize(found.username) : "Unknown Buyer";
  }

  /************************************************************************************
   * 8) FILTER
   ************************************************************************************/
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
    if (selectedBuyer !== "all") {
      const purchaseBuyerId = purchase.buyerId?._id || purchase.buyerId;
      if (purchaseBuyerId?.toString() !== selectedBuyer) {
        return false;
      }
    }
    // user
    if (selectedUser !== "all" && purchase.userId !== selectedUser) {
      return false;
    }
    return true;
  }

  const filteredPurchases = purchases.filter(matchesFilter);

  /************************************************************************************
   * 9) DELETE
   ************************************************************************************/
  async function handleDeletePurchase(purchaseId) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this purchase?"
      );
      if (!confirmDelete) return;

      // DELETE /purchases/:id => reverts product quantity
      await apiClient.delete(`/purchases/${purchaseId}`);
      setPurchases((prev) => prev.filter((p) => p._id !== purchaseId));

      // re-fetch products => updated quantity
      const respProd = await apiClient.get("/products?limit=0");
      setProducts(respProd.data.data || []);
    } catch (err) {
      console.error("Failed to delete purchase:", err);
      alert("Could not delete purchase. See console for details.");
    }
  }

  /************************************************************************************
   * 10) TABLE ROWS
   ************************************************************************************/
  const tableRows = filteredPurchases.map((purchase, index) => {
    const product = getProductById(purchase.productId);
    const marketPrice = product?.price || 0; // "market price" in DB
    const purchasePrice = purchase.purchasePrice || 0; // actual paid
    const qty = purchase.quantity || 0;
    const total = qty * purchasePrice;
    const actualBuyerId = purchase.buyerId?._id || purchase.buyerId;

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
        <td className="px-4 py-2 text-sm text-gray-600">
          ${marketPrice.toFixed(2)}
        </td>
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
          {getBuyerNameById(actualBuyerId)}
        </td>
        {/* Action Buttons */}
        <td className="px-4 py-2 space-x-2 text-center">
          {canAddPurchase && (
            <button
              onClick={() => openEditModal(purchase)}
              className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-800"
            >
              Edit
            </button>
          )}
          {canAddPurchase && (
            <button
              onClick={() => handleDeletePurchase(purchase._id)}
              className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </td>
      </tr>
    );
  });

  /************************************************************************************
   * 11) AGGREGATIONS
   ************************************************************************************/
  // Global total
  const totalPaidAll = filteredPurchases.reduce(
    (sum, p) => sum + (p.quantity || 0) * (p.purchasePrice || 0),
    0
  );

  // Buyer totals
  const buyerMap = {};
  filteredPurchases.forEach((p) => {
    const rawBuyer = p.buyerId?._id || p.buyerId;
    const bId = rawBuyer?.toString() || "unknown";
    if (!buyerMap[bId]) {
      buyerMap[bId] = 0;
    }
    buyerMap[bId] += (p.quantity || 0) * (p.purchasePrice || 0);
  });
  const buyerTotals = Object.keys(buyerMap).map((bId) => ({
    buyerId: bId,
    total: buyerMap[bId],
  }));

  // Average purchase price per product
  const productMap = {};
  filteredPurchases.forEach((p) => {
    if (!productMap[p.productId]) {
      productMap[p.productId] = { totalSpent: 0, totalQty: 0 };
    }
    productMap[p.productId].totalSpent += (p.quantity || 0) * p.purchasePrice;
    productMap[p.productId].totalQty += p.quantity;
  });
  const productAverages = Object.keys(productMap).map((prodId) => {
    const { totalSpent, totalQty } = productMap[prodId];
    const avgPrice = totalQty > 0 ? totalSpent / totalQty : 0;
    return { productId: prodId, avgPrice };
  });

  /************************************************************************************
   * 12) CONDITIONAL RENDER
   ************************************************************************************/
  if (loading) {
    return <p className="m-4 text-lg">Loading purchases...</p>;
  }
  if (error) {
    return <p className="m-4 text-lg text-red-600">{error}</p>;
  }

  /************************************************************************************
   * 13) RETURN (final render)
   ************************************************************************************/
  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Top Bar */}
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

      {/* Filters */}
      <div className="flex flex-col items-start mb-4 space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
        {/* Category filter */}
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
            {[...availableCategories]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Brand filter */}
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
            {[...availableBrands]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
          </select>
        </div>

        {/* Product filter */}
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
            {[...availableProducts]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        {/* Firm filter */}
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
            {[...firms]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
          </select>
        </div>

        {/* Buyer filter */}
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
            {[...allUsers]
              .sort((a, b) => a.username.localeCompare(b.username))
              .map((u) => (
                <option key={u._id} value={u._id}>
                  {capitalize(u.username)} ({u.role})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-600">
            {/* Empty space for alignment */}
            {"Reset Filters"}
          </label>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedBrand("all");
              setSelectedProduct("all");
              setSelectedFirm("all");
              // setSelectedSeller("all");
              setSelectedBuyer("all");
            }}
            className="px-4 py-2 font-medium text-blue-900 bg-orange-300 rounded hover:bg-orange-700 hover:text-white"
          >
            ✖︎ Reset
          </button>
        </div>
      </div>

      {/* Table */}
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
              <th className="px-4 py-3 text-xs font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{tableRows}</tbody>
        </table>
      </div>

      {/* Summaries (Global total, product averages, buyer totals) */}
      <div className="mt-6 space-y-4">
        {/* Global total */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Global Totals (Filtered)
          </h2>
          <p className="text-gray-700">
            <strong>Total Paid:</strong> {formatCurrency(totalPaidAll)}
          </p>
        </div>
        {/* Average purchase price per product (filtered) */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Average Purchase Price per Product (Filtered)
          </h2>
          {productAverages.map(({ productId, avgPrice }) => (
            <p key={productId} className="text-gray-700">
              <strong>{getProductNameById(productId)}</strong>: {""}
              {formatCurrency(avgPrice)}
            </p>
          ))}
        </div>
        {/* Total paid by each buyer (filtered)
        <div className="p-4 bg-white rounded shadow">
          <h2 className="w-1/5 mb-2 text-lg font-semibold text-gray-800">
            Total Paid by Buyer (Filtered)
          </h2>
          <div className="flex flex-col space-y-2">
            {buyerTotals.map(({ buyerId, total }) => (
              <p key={buyerId} className="text-gray-700">
                <strong>{getBuyerNameById(buyerId)}</strong>: {""}
                <span className="ml-2 font-semibold">Total Paid:</span>
                <span className="ml-1 text-right">{formatCurrency(total)}</span>
              </p>
            ))}
          </div>
        </div> */}
        {/* Total paid by each buyer (filtered) */}
        {/* <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Total Paid by Buyer (Filtered)
          </h2>
          <div className="space-y-2">
            {buyerTotals.map(({ buyerId, total }) => (
              <div
                key={buyerId}
                className="grid items-center w-max-[30%] grid-cols-2 gap-5"
              >
                <div>
                  <strong className="w-1/3">{getBuyerNameById(buyerId)}</strong>
                  : <span className="w-1/3 ml-2 ">Total Paid:</span>
                </div>
                <div className="w-1/3 text-right">{formatCurrency(total)}</div>
              </div>
            ))}
          </div>
        </div> */}
        {/* Total paid by each buyer (filtered) */}

        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Total Paid by Buyer (Filtered)
          </h2>
          <div className="w-1/3 space-y-2 ">
            {[...buyerTotals]
              .sort((a, b) => b.total - a.total)
              .map(({ buyerId, total }) => (
                <div
                  key={buyerId}
                  className="flex items-center gap-2 justify-left"
                >
                  <div className="w-[30%]">
                    <strong className="w-[30%]">
                      {getBuyerNameById(buyerId)}:
                    </strong>
                  </div>
                  <div className="w-[30%]text-right">Total Paid:</div>
                  <div></div>
                  {/* Fixed width container for right alignment */}
                  <div className="w-[40%] text-right">
                    {formatCurrency(total)}
                  </div>
                </div>
              ))}
          </div>
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
                {/* 
                  CREATE Purchase Modal Panel
                */}
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left bg-white rounded shadow-xl">
                  <Dialog.Title className="mb-4 text-lg font-bold text-gray-700">
                    Add New Purchase
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Category Filter for modalCategory */}
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
                        {[...availableCategories]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Brand Filter for modalBrand */}
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
                        {[...availableBrands]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((br) => (
                            <option key={br._id} value={br._id}>
                              {br.name}
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
                        {[...availableProducts]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* If product chosen, show read-only info (category, brand, market price) */}
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
                        Buyer
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
                            {capitalize(u.username)} ({u.role})
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

                    {/* Purchase Price */}
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

                  {/* Modal Footer: Save, Cancel */}
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
                {/* End of Dialog.Panel */}
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* EDIT PURCHASE MODAL */}
      <Transition appear show={editModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeEditModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* Dark overlay */}
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
                {/* 
                  EDIT Purchase Modal Panel
                */}
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left bg-white rounded shadow-xl">
                  <Dialog.Title className="mb-4 text-lg font-bold text-gray-700">
                    Edit Purchase
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Quantity */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={editPurchase.quantity}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    {/* Purchase Price */}
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
                          value={editPurchase.purchasePrice}
                          onChange={handleEditChange}
                          className="w-full py-2 border rounded px-7"
                        />
                      </div>
                    </div>

                    {/* Buyer */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Buyer
                      </label>
                      <select
                        name="buyerId"
                        value={editPurchase.buyerId}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Buyer --</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {capitalize(u.username)} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Firm */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Firm
                      </label>
                      <select
                        name="firmId"
                        value={editPurchase.firmId}
                        onChange={handleEditChange}
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
                  </div>

                  {/* Modal Footer: Update, Cancel */}
                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      onClick={updatePurchase}
                      className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      onClick={closeEditModal}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
                {/* End of Dialog.Panel */}
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
/********************************************************************/
/* END OF FILE: PurchasesList.jsx ~1080 lines (full logic preserved)*/
/********************************************************************/
