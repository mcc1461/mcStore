/********************************************************************************************
 * FILE: src/utils/SellsList.jsx
 * LINES: ~1000 (similar structure to PurchasesList, with modifications for Sells)
 ********************************************************************************************/

import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import { formatCurrency, formatNumber } from "../utils/helpers";

/************************************************************************************
 * 1) ROLE & NAVIGATION
 ************************************************************************************/
export default function SellsList() {
  // Access user info from Redux
  const { userInfo } = useSelector((state) => state.auth);
  const userRole = userInfo?.role || "user";
  const navigate = useNavigate();

  // Only admin/staff can add/edit/delete sells
  const canAddSell =
    userRole === "admin" || userRole === "staff" || userRole === "user";

  /************************************************************************************
   * 2) STATES
   ************************************************************************************/
  const [sells, setSells] = useState([]);
  const [purchases, setPurchases] = useState([]); // to compute average purchase price
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]); // staff+admin for Seller dropdown
  const [allUsers, setAllUsers] = useState([]); // for lookups
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // CREATE Sell modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newSell, setNewSell] = useState({
    productId: "",
    quantity: 1,
    sellPrice: 0,
    userId: userInfo?._id || "", // the user who is making this record
    sellerId: "", // the staff/admin responsible for the sell
  });

  // EDIT Sell modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSell, setEditSell] = useState({
    _id: null,
    productId: "",
    quantity: 1,
    sellPrice: 0,
    sellerId: "",
  });

  /************************************************************************************
   * 3) FILTERS
   ************************************************************************************/
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState("all");

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

        // 1) Sells
        const respSells = await apiClient.get("/sells?limit=0");
        setSells(respSells.data.data || []);

        // 2) Purchases (for average purchase price)
        const respPurchases = await apiClient.get("/purchases?limit=0");
        setPurchases(respPurchases.data.data || []);

        // 3) Products
        const respProd = await apiClient.get("/products?limit=0");
        setProducts(respProd.data.data || []);

        // 4) All users
        const respUsers = await apiClient.get("/users?limit=0");
        const allFetchedUsers = respUsers.data.data || [];
        // staff+admin as "sellers"
        const staffAdmins = allFetchedUsers.filter(
          (u) => u.role === "staff" || u.role === "admin" || u.role === "user"
        );
        setUsers(staffAdmins);
        setAllUsers(allFetchedUsers);

        // 5) Categories
        const respCats = await apiClient.get("/categories?limit=0");
        setCategories(respCats.data.data || []);

        // 6) Brands
        const respBrands = await apiClient.get("/brands?limit=0");
        setBrands(respBrands.data.data || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data in SellsList:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /************************************************************************************
   * 5) CREATE SELL
   ************************************************************************************/
  const [modalCategory, setModalCategory] = useState("all");
  const [modalBrand, setModalBrand] = useState("all");

  const openModal = () => {
    setNewSell({
      productId: "",
      quantity: 1,
      sellPrice: 0,
      userId: userInfo?._id || "",
      sellerId: "",
    });
    setModalCategory("all");
    setModalBrand("all");
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSell((prev) => ({ ...prev, [name]: value }));
  };

  // Filter products by category/brand in create modal
  const modalFilteredProducts = products.filter((p) => {
    const catId = p.categoryId?._id || p.categoryId;
    const brId = p.brandId?._id || p.brandId;

    if (modalCategory !== "all" && catId !== modalCategory) return false;
    if (modalBrand !== "all" && brId !== modalBrand) return false;
    return true;
  });

  // Save Sell => decrements product quantity on server side
  async function saveSell() {
    try {
      const quantity = Number(newSell.quantity) || 1;
      const sellPrice = Number(newSell.sellPrice) || 0;

      // quick validations
      if (!newSell.productId) {
        alert("Please select a product.");
        return;
      }
      if (!newSell.sellerId) {
        alert("Please select a seller (staff/admin).");
        return;
      }
      if (!newSell.userId) {
        alert("No user ID found! Are you logged in?");
        return;
      }

      // find brandId from chosen product
      const chosenProduct = products.find(
        (prod) => prod._id === newSell.productId
      );
      const brandId =
        chosenProduct?.brandId?._id || chosenProduct?.brandId || null;
      if (!brandId) {
        alert("No brandId found for this product! brandId is required.");
        return;
      }

      // Check if enough quantity is available
      if (chosenProduct.quantity < quantity) {
        alert(`Not enough stock! Only ${chosenProduct.quantity} in stock.`);
        return;
      }

      const payload = {
        productId: newSell.productId,
        brandId,
        userId: newSell.userId,
        sellerId: newSell.sellerId,
        quantity,
        sellPrice,
      };

      // POST /sells => should decrement product quantity
      const resp = await apiClient.post("/sells", payload);

      // Re-fetch products => updated quantity
      const respProd = await apiClient.get("/products?limit=0");
      setProducts(respProd.data.data || []);

      // Add new sell to local state
      const created = resp.data.data;
      if (created) {
        setSells((prev) => [...prev, created]);
        closeModal();
      }
    } catch (err) {
      console.error("Error saving sell:", err);
      alert("Could not save sell. See console for details.");
    }
  }

  /************************************************************************************
   * 6) EDIT SELL
   ************************************************************************************/
  function openEditModal(sell) {
    setEditSell({
      _id: sell._id,
      productId: sell.productId,
      quantity: sell.quantity,
      sellPrice: sell.sellPrice,
      sellerId: sell.sellerId,
    });
    setEditModalOpen(true);
  }
  function closeEditModal() {
    setEditModalOpen(false);
  }
  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditSell((prev) => ({ ...prev, [name]: value }));
  }

  // Update sell => adjusts product quantity by difference
  async function updateSell() {
    try {
      if (!editSell._id) return;

      const quantity = Number(editSell.quantity) || 1;
      const sellPrice = Number(editSell.sellPrice) || 0;

      // Get the original Sell object from local state, to see old quantity if needed
      const oldSell = sells.find((s) => s._id === editSell._id);
      if (!oldSell) {
        alert("Could not find original sell. Please refresh and try again.");
        return;
      }
      const oldQty = oldSell ? oldSell.quantity : 0;

      // Find the product
      const chosenProduct = products.find((p) => p._id === editSell.productId);
      if (!chosenProduct) {
        alert("Could not find product. Please refresh and try again.");
        return;
      }

      const diff = quantity - oldQty;
      if (diff > 0 && chosenProduct.quantity < diff) {
        alert(`Not enough stock! Only ${chosenProduct.quantity} in stock.`);
        return;
      }

      const payload = {
        sellerId: editSell.sellerId,
        quantity,
        sellPrice,
      };

      // PUT /sells/:id => re-fetch products
      const resp = await apiClient.put(`/sells/${editSell._id}`, payload);
      if (resp.data && resp.data.data) {
        const updated = resp.data.data;

        // update local sells
        setSells((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );

        // re-fetch products => updated quantity
        const respProd = await apiClient.get("/products?limit=0");
        setProducts(respProd.data.data || []);

        closeEditModal();
      }
    } catch (err) {
      console.error("Error updating sell:", err);
      alert("Could not update sell. See console for details.");
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
  function getSellerNameById(sellerId) {
    if (!sellerId) return "Unknown Seller";
    // If sellerId is an object with ._id, extract that.
    const strId = sellerId._id ? sellerId._id.toString() : sellerId.toString();
    const found = allUsers.find((u) => u._id === strId);
    return found ? capitalize(found.username) : "Unknown Seller";
  }

  // Build a map: productId => { totalSpent, totalQty } for average purchase cost
  const purchaseMap = {};
  purchases.forEach((p) => {
    if (!purchaseMap[p.productId]) {
      purchaseMap[p.productId] = { totalSpent: 0, totalQty: 0 };
    }
    purchaseMap[p.productId].totalSpent +=
      (p.quantity || 0) * (p.purchasePrice || 0);
    purchaseMap[p.productId].totalQty += p.quantity || 0;
  });

  // Modified getAveragePurchasePrice:
  // If no purchase data exists, we use 75% of the product’s market price.
  function getAveragePurchasePrice(productId) {
    const data = purchaseMap[productId];
    if (!data || data.totalQty === 0) {
      const product = getProductById(productId);
      if (product) return Number(product.price) * 0.75;
      return 0;
    }
    return data.totalSpent / data.totalQty;
  }

  /************************************************************************************
   * 8) FILTER
   ************************************************************************************/
  function matchesFilter(sell) {
    const product = getProductById(sell.productId);

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
    if (selectedProduct !== "all" && sell.productId !== selectedProduct) {
      return false;
    }
    // Seller
    if (selectedSeller !== "all") {
      let sellerIdValue = "";
      if (sell.sellerId) {
        if (typeof sell.sellerId === "object" && sell.sellerId._id) {
          sellerIdValue = sell.sellerId._id.toString();
        } else if (typeof sell.sellerId === "object") {
          sellerIdValue = "";
        } else {
          sellerIdValue = sell.sellerId.toString();
        }
      }
      if (sellerIdValue !== selectedSeller.toString()) return false;
    }
    return true;
  }

  const filteredSells = sells.filter(matchesFilter);

  /************************************************************************************
   * 9) DELETE
   ************************************************************************************/
  async function handleDeleteSell(sellId) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this sell?"
      );
      if (!confirmDelete) return;

      // DELETE /sells/:id => reverts product quantity
      await apiClient.delete(`/sells/${sellId}`);
      setSells((prev) => prev.filter((s) => s._id !== sellId));

      // re-fetch products => updated quantity
      const respProd = await apiClient.get("/products?limit=0");
      setProducts(respProd.data.data || []);
    } catch (err) {
      console.error("Failed to delete sell:", err);
      alert("Could not delete sell. See console for details.");
    }
  }

  /************************************************************************************
   * 10) TABLE ROWS
   ************************************************************************************/
  const tableRows = filteredSells.map((sell, index) => {
    const product = getProductById(sell.productId);
    const avgPurchasePrice = getAveragePurchasePrice(sell.productId);
    const inStock = product ? product.quantity : 0;
    const sellPrice = sell.sellPrice || 0;
    const qty = sell.quantity || 0;
    const total = sellPrice * qty;
    const profit = (sellPrice - avgPurchasePrice) * qty;

    return (
      <tr
        key={sell._id}
        className="transition bg-white border-b hover:bg-gray-50"
      >
        <td className="px-2 py-2 text-sm text-gray-600 sm:px-4">{index + 1}</td>
        <td className="px-2 py-2 text-sm font-semibold text-gray-900 sm:px-4">
          {getProductNameById(sell.productId)}
        </td>
        <td className="hidden px-2 py-2 text-sm text-gray-600 sm:px-4 sm:table-cell">
          {getCategoryName(product)}
        </td>
        <td className="hidden px-2 py-2 text-sm text-gray-600 sm:px-4 sm:table-cell">
          {getBrandName(product)}
        </td>
        <td className="hidden px-2 py-2 text-sm text-gray-600 sm:px-4 lg:table-cell">
          {inStock}
        </td>
        <td className="hidden px-2 py-2 text-sm text-gray-600 sm:px-4 lg:table-cell">
          ${avgPurchasePrice.toFixed(2)}
        </td>
        <td className="hidden px-2 py-2 text-sm text-gray-600 sm:px-4 sm:table-cell">
          ${sellPrice.toFixed(2)}
        </td>
        <td className="px-2 py-2 text-sm text-gray-600 sm:px-4">{qty}</td>
        <td className="px-2 py-2 text-sm font-semibold text-gray-700 sm:px-4">
          <span className="block sm:hidden">${formatNumber(total)} </span>
          <span className="hidden sm:block">${total.toFixed(2)}</span>
        </td>
        <td className="px-2 py-2 text-sm font-semibold text-gray-700 sm:px-4">
          <span className="block sm:hidden">${formatNumber(profit)} </span>
          <span className="hidden sm:block">${profit.toFixed(2)}</span>
        </td>
        <td className="hidden px-2 py-2 text-sm text-gray-600 sm:px-4 md:table-cell">
          {getSellerNameById(sell.sellerId)}
        </td>
        {/* Action Buttons */}
        <td className="px-2 py-2 space-x-2 text-center sm:px-4">
          {canAddSell && (
            <button
              onClick={() => openEditModal(sell)}
              className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-800"
            >
              Edit
            </button>
          )}
          {canAddSell && (
            <button
              onClick={() => handleDeleteSell(sell._id)}
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
  // 1) Global totals for the filtered sells
  let totalRevenue = 0;
  let totalProfit = 0;
  filteredSells.forEach((s) => {
    const qty = s.quantity || 0;
    const sp = s.sellPrice || 0;
    const avgPP = getAveragePurchasePrice(s.productId);
    totalRevenue += sp * qty;
    totalProfit += (sp - avgPP) * qty;
  });

  // 2) Average sell price per product (filtered)
  const sellMap = {};
  filteredSells.forEach((s) => {
    if (!sellMap[s.productId]) {
      sellMap[s.productId] = { totalSell: 0, totalQty: 0 };
    }
    sellMap[s.productId].totalSell += (s.sellPrice || 0) * (s.quantity || 0);
    sellMap[s.productId].totalQty += s.quantity || 0;
  });
  const productSellAverages = Object.keys(sellMap).map((prodId) => {
    const { totalSell, totalQty } = sellMap[prodId];
    const avgSellPrice = totalQty > 0 ? totalSell / totalQty : 0;
    const avgPurchasePrice = getAveragePurchasePrice(prodId);
    const avgProfit = avgSellPrice - avgPurchasePrice;
    return { productId: prodId, avgSellPrice, avgProfit };
  });

  // 3) Total sold by each seller (filtered)
  const sellerTotalsMap = {};
  filteredSells.forEach((s) => {
    let sid;
    if (s.sellerId && typeof s.sellerId === "object" && s.sellerId._id) {
      sid = s.sellerId._id.toString();
    } else {
      sid = s.sellerId?.toString() || "unknown";
    }
    if (!sellerTotalsMap[sid]) {
      sellerTotalsMap[sid] = { totalSold: 0, totalProfit: 0 };
    }
    const qty = s.quantity || 0;
    const sp = s.sellPrice || 0;
    const avgPP = getAveragePurchasePrice(s.productId);
    sellerTotalsMap[sid].totalSold += sp * qty;
    sellerTotalsMap[sid].totalProfit += (sp - avgPP) * qty;
  });
  const sellerTotals = Object.keys(sellerTotalsMap).map((sid) => ({
    sellerId: sid,
    totalSold: sellerTotalsMap[sid].totalSold,
    totalProfit: sellerTotalsMap[sid].totalProfit,
  }));

  /************************************************************************************
   * 12) CONDITIONAL RENDER
   ************************************************************************************/
  if (loading) {
    return <p className="m-4 text-lg">Loading sells...</p>;
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
        <h1 className="text-2xl font-bold text-gray-800">Sells List</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-xs text-white bg-blue-600 rounded-md md:text-base hover:bg-blue-700"
          >
            ➤ Dashboard
          </button>
          {canAddSell && (
            <button
              onClick={openModal}
              className="px-4 py-2 text-xs text-white bg-green-600 rounded-md md:text-base hover:bg-green-700"
            >
              + Add Sell
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
            className="w-40 px-2 py-1 border rounded"
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
            className="w-40 px-2 py-1 border rounded"
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
            className="w-40 px-2 py-1 border rounded"
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
        {/* Seller filter */}
        <div>
          <label className="hidden mb-1 text-sm font-semibold text-gray-600 md:block">
            Seller
          </label>
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="hidden w-40 px-2 py-1 border rounded md:block"
          >
            <option value="all">All Sellers</option>
            {[...users]
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
            {"Reset Filters"}
          </label>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedBrand("all");
              setSelectedProduct("all");
              setSelectedSeller("all");
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
              <th className="px-2 py-3 text-xs font-medium text-gray-700 sm:px-4">
                No
              </th>
              <th className="px-2 py-3 text-xs font-medium text-gray-700 sm:px-4">
                Product
              </th>
              <th className="hidden px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:table-cell">
                Category
              </th>
              <th className="hidden px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:table-cell">
                Brand
              </th>
              <th className="hidden px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 lg:table-cell">
                In Stock
              </th>
              <th className="hidden px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 lg:table-cell">
                Avg Purchase Price
              </th>
              <th className="hidden px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:table-cell">
                Sell Price
              </th>
              <th className="px-2 py-3 text-xs font-medium text-gray-700 sm:px-4">
                Qty
              </th>
              <th className="px-2 py-3 text-xs font-medium text-gray-700 sm:px-4">
                Total
              </th>
              <th className="px-2 py-3 text-xs font-medium text-gray-700 sm:px-4">
                Profit
              </th>
              <th className="hidden px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 md:table-cell">
                Seller
              </th>
              <th className="px-2 py-3 text-xs font-medium text-gray-700 sm:px-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{tableRows}</tbody>
        </table>
      </div>

      {/* Summaries (Global totals, product averages, seller totals) */}
      <div className="mt-6 space-y-4">
        {/* Global totals */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Global Totals (Filtered)
          </h2>
          <p className="text-gray-700">
            <strong>Total Revenue:</strong> {formatCurrency(totalRevenue)}
          </p>
          <p className="text-gray-700">
            <strong>Total Profit:</strong> {formatCurrency(totalProfit)}
          </p>
        </div>

        {/* Average sell price & profit per product (filtered) */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Average Sell Price & Profit per Product (Filtered)
          </h2>
          {productSellAverages.map(({ productId, avgSellPrice, avgProfit }) => (
            <div key={productId} className="text-gray-700">
              <strong>{getProductNameById(productId)}</strong>:
              <ul className="ml-4 list-disc">
                <li>Avg Sell Price: {formatCurrency(avgSellPrice)}</li>
                <li>Avg Profit (per unit): {formatCurrency(avgProfit)}</li>
              </ul>
            </div>
          ))}
        </div>

        {/* Total sold & profit by seller (filtered) */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Total Sold by Seller (Filtered)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="flex border-b">
                  <th className="w-1/6 py-2 text-left">Seller</th>
                  <th className="w-1/6 py-2 pr-10 text-right">Sold</th>
                  <th className="w-1/6 py-2 pr-10 text-right">Profit</th>
                  <th className="w-3/6 px-2 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {[...sellerTotals]
                  .sort((a, b) => b.totalSold - a.totalSold)
                  .map(({ sellerId, totalSold, totalProfit }) => (
                    <tr key={sellerId} className="flex border-b">
                      <td className="w-1/6 px-2 py-2 text-left">
                        {getSellerNameById(sellerId)}
                      </td>
                      <td className="w-1/6 px-2 py-2 text-right">
                        ${totalSold.toFixed(2)}
                      </td>
                      <td className="w-1/6 px-2 py-2 text-right">
                        ${totalProfit.toFixed(2)}
                      </td>
                      <td className="w-3/6 px-2 py-2 text-center"></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD SELL MODAL */}
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
                {/* CREATE Sell Modal Panel */}
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left bg-white rounded shadow-xl">
                  <Dialog.Title className="mb-4 text-lg font-bold text-gray-700">
                    Add New Sell
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Category Filter */}
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
                        {[...categories]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Brand Filter */}
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
                        {[...brands]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Product (filtered) */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Product
                      </label>
                      <select
                        name="productId"
                        value={newSell.productId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Product --</option>
                        {[...modalFilteredProducts]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* If product chosen, read-only info about it */}
                    {newSell.productId && (
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
                                (prod) => prod._id === newSell.productId
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
                                (prod) => prod._id === newSell.productId
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
                            In Stock
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border rounded"
                            value={(function () {
                              const chosen = products.find(
                                (prod) => prod._id === newSell.productId
                              );
                              return chosen ? chosen.quantity : 0;
                            })()}
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-semibold">
                            Avg Market Price
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border rounded"
                            value={(function () {
                              const chosen = products.find(
                                (prod) => prod._id === newSell.productId
                              );
                              return chosen ? `$${chosen.price.toFixed(2)}` : 0;
                            })()}
                          />
                        </div>

                        <div>
                          <label className="block mb-1 text-sm font-semibold">
                            Avg Purchase Price (computed)
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border rounded"
                            value={(function () {
                              const app = getAveragePurchasePrice(
                                newSell.productId
                              );
                              return `$${app.toFixed(2)}`;
                            })()}
                          />
                        </div>
                      </>
                    )}

                    {/* Seller */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Seller
                      </label>
                      <select
                        name="sellerId"
                        value={newSell.sellerId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Seller --</option>
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
                        value={newSell.quantity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    {/* Sell Price */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Sell Price
                      </label>
                      <div className="relative">
                        <span className="absolute text-gray-500 left-3 top-2">
                          $
                        </span>
                        <input
                          type="number"
                          name="sellPrice"
                          step="0.01"
                          min="0"
                          value={newSell.sellPrice}
                          onChange={handleInputChange}
                          className="w-full py-2 border rounded px-7"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer: Save, Cancel */}
                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      onClick={saveSell}
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

      {/* EDIT SELL MODAL */}
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
                {/* EDIT Sell Modal Panel */}
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left bg-white rounded shadow-xl">
                  <Dialog.Title className="mb-4 text-lg font-bold text-gray-700">
                    Edit Sell
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
                        value={editSell.quantity}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>

                    {/* Sell Price */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Sell Price
                      </label>
                      <div className="relative">
                        <span className="absolute text-gray-500 left-3 top-2">
                          $
                        </span>
                        <input
                          type="number"
                          name="sellPrice"
                          step="0.01"
                          min="0"
                          value={editSell.sellPrice}
                          onChange={handleEditChange}
                          className="w-full py-2 border rounded px-7"
                        />
                      </div>
                    </div>

                    {/* Seller */}
                    <div>
                      <label className="block mb-1 text-sm font-semibold">
                        Seller
                      </label>
                      <select
                        name="sellerId"
                        value={editSell.sellerId}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">-- Select Seller --</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {capitalize(u.username)} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Modal Footer: Update, Cancel */}
                  <div className="flex justify-end mt-6 space-x-3">
                    <button
                      onClick={updateSell}
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
/* END OF FILE: SellsList.jsx (with aggregator fix)                  */
/********************************************************************/
