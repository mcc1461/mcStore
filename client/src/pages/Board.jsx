import React, { useEffect, useState, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import Table, {
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "../components/table";

// --------------------------------------------------------------------
// Global Helper Functions
// --------------------------------------------------------------------
function formatCurrency(value) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getCategoryName(product) {
  if (!product) return "Unknown Category";
  if (
    product.categoryId &&
    typeof product.categoryId === "object" &&
    product.categoryId.name
  ) {
    return product.categoryId.name;
  }
  if (product.categoryId && typeof product.categoryId === "string") {
    const found = window.__dashboardCategories?.find(
      (c) => c._id === product.categoryId
    );
    if (found) return found.name;
  }
  if (product.category) return product.category;
  return "Unknown Category";
}

function getBrandName(product) {
  if (!product) return "Unknown Brand";
  if (
    product.brandId &&
    typeof product.brandId === "object" &&
    product.brandId.name
  ) {
    return product.brandId.name;
  }
  if (product.brandId && typeof product.brandId === "string") {
    const found = window.__dashboardBrands?.find(
      (b) => b._id === product.brandId
    );
    if (found) return found.name;
  }
  if (product.brand) return product.brand;
  return "Unknown Brand";
}

// In stock view, the average market price is stored in product.price.
function getAverageMarketPrice(product) {
  if (!product) return 0;
  return Number(product.price) || 0;
}

// For non-stock views (purchases/sells), lookup product name using its ID.
function getDisplayProductName(item, products, viewMode) {
  if (viewMode === "stock") return item.name;
  const prod = products.find((p) => p._id === item.productId);
  return prod ? prod.name : "Unknown Product";
}

// --------------------------------------------------------------------
// ExpandedDetails Component
// Displays detailed information (including product name and category)
// for the expanded breakdown row. Receives viewMode, getDisplayProductName, and products
// to properly look up product details for purchases and sells.
function ExpandedDetails({
  category,
  items = [],
  useAveragePrice = false,
  viewMode,
  getDisplayProductName,
  products,
}) {
  const total = items.reduce((acc, it) => {
    const price = useAveragePrice
      ? getAverageMarketPrice(it)
      : Number(it.price || it.purchasePrice || it.sellPrice) || 0;
    const qty = Number(it.quantity) || 0;
    return acc + price * qty;
  }, 0);
  return (
    <div className="p-3 mt-2 bg-white border rounded shadow-lg">
      <h3 className="mb-2 text-lg font-bold text-gray-800">
        {category} Details
      </h3>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-xs text-left table-auto">
          <thead>
            <tr className="bg-gray-100">
              <TableHeader className="px-2 py-1 text-sm text-gray-800 border">
                S/N
              </TableHeader>
              <TableHeader className="px-2 py-1 text-sm text-gray-800 border">
                Name
              </TableHeader>
              <TableHeader className="px-2 py-1 text-sm text-gray-800 border">
                Category
              </TableHeader>
              <TableHeader className="px-2 py-1 text-sm text-right text-gray-800 border">
                {useAveragePrice ? "Avg. Market Price" : "Price"}
              </TableHeader>
              <TableHeader className="px-2 py-1 text-sm text-right text-gray-800 border">
                Qty
              </TableHeader>
              <TableHeader className="px-2 py-1 text-sm text-right text-gray-800 border">
                Value
              </TableHeader>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const price = useAveragePrice
                ? getAverageMarketPrice(it)
                : Number(it.price || it.purchasePrice || it.sellPrice) || 0;
              const qty = Number(it.quantity) || 0;
              return (
                <TableRow
                  key={it._id}
                  className="transition bg-white border-b hover:bg-gray-50"
                >
                  <TableCell className="px-2 py-1 text-sm text-gray-800 border">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm font-semibold text-gray-900 border">
                    {viewMode === "stock"
                      ? it.name
                      : getDisplayProductName(it, products, viewMode)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm text-gray-800 border">
                    {getCategoryName(
                      it.productId
                        ? window.__dashboardProducts?.find(
                            (p) => p._id === it.productId
                          ) || {}
                        : it
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm text-right text-gray-800 border">
                    ${formatCurrency(price)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm text-right text-gray-800 border">
                    {qty.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-sm font-bold text-right text-gray-900 border">
                    ${formatCurrency(price * qty)}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-indigo-700">
              <TableCell
                className="px-2 py-1 text-sm font-bold text-white border"
                colSpan={5}
                align="right"
              >
                Total:
              </TableCell>
              <TableCell className="px-2 py-1 text-sm font-bold text-right text-white border">
                ${formatCurrency(total)}
              </TableCell>
            </TableRow>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------
// Main DashboardBoard Component
// --------------------------------------------------------------------
function DashboardBoard() {
  const navigate = useNavigate();

  // VIEW MODE: "stock", "purchases", or "sells"
  const [viewMode, setViewMode] = useState("stock");
  const [currentBreakdownType, setCurrentBreakdownType] = useState(
    viewMode === "stock" ? "combined" : "total"
  );
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sells, setSells] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // "See All Products" modal state and filters
  const [allProductsModalOpen, setAllProductsModalOpen] = useState(false);
  const [modalFilterCategory, setModalFilterCategory] = useState("all");
  const [modalFilterBrand, setModalFilterBrand] = useState("all");

  // --------------------------------------------------------------------
  // Data Fetching
  // --------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodResp, purchResp, sellResp] = await Promise.all([
          apiClient.get("/products?limit=100&page=1&populate=categoryId"),
          apiClient.get("/purchases?limit=100&page=1"),
          apiClient.get("/sells?limit=100&page=1"),
        ]);
        setProducts(prodResp.data.data || []);
        setPurchases(purchResp.data.data || []);
        setSells(sellResp.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Error fetching data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const resp = await apiClient.get("/categories?limit=0");
        const sorted = (resp.data.data || []).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setCategories(sorted);
        window.__dashboardCategories = sorted;
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const resp = await apiClient.get("/brands?limit=0");
        const sorted = (resp.data.data || []).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setBrands(sorted);
        window.__dashboardBrands = sorted;
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    window.__dashboardProducts = products;
  }, [products]);

  // --------------------------------------------------------------------
  // Local Helper Functions
  // --------------------------------------------------------------------
  function getDisplayCategory(item) {
    if (viewMode === "stock") return getCategoryName(item);
    const prod = products.find((p) => p._id === item.productId);
    return getCategoryName(prod);
  }

  function getDisplayProductNameWrapper(item) {
    return getDisplayProductName(item, products, viewMode);
  }

  // --------------------------------------------------------------------
  // Breakdown Calculations
  // --------------------------------------------------------------------
  const stockBreakdown = useMemo(() => {
    const groups = {};
    products.forEach((prod) => {
      const cat = getCategoryName(prod);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(prod);
    });
    return Object.entries(groups).map(([category, items]) => ({
      category,
      total: items.length,
      value: items.reduce(
        (acc, p) => acc + getAverageMarketPrice(p) * Number(p.quantity),
        0
      ),
      items,
    }));
  }, [products]);

  function computeBreakdown(data, priceField) {
    const breakdown = {};
    data.forEach((item) => {
      const cat = getDisplayCategory(item);
      if (!breakdown[cat]) breakdown[cat] = { total: 0, value: 0, items: [] };
      breakdown[cat].total += 1;
      const itemValue = Number(item[priceField]) * Number(item.quantity);
      breakdown[cat].value += itemValue;
      breakdown[cat].items.push({ ...item, value: itemValue });
    });
    return Object.entries(breakdown).map(([category, values]) => ({
      category,
      ...values,
    }));
  }

  const purchaseBreakdown = useMemo(
    () => computeBreakdown(purchases, "purchasePrice"),
    [purchases]
  );
  const sellBreakdown = useMemo(
    () => computeBreakdown(sells, "sellPrice"),
    [sells]
  );

  const purchaseMap = useMemo(() => {
    const map = {};
    purchases.forEach((p) => {
      const pid = p.productId;
      if (!map[pid]) map[pid] = { totalSpent: 0, totalQty: 0 };
      map[pid].totalSpent += Number(p.purchasePrice) * Number(p.quantity);
      map[pid].totalQty += Number(p.quantity);
    });
    return map;
  }, [purchases]);

  function getAveragePurchasePrice(productId) {
    const data = purchaseMap[productId];
    if (!data || data.totalQty === 0) return 0;
    return data.totalSpent / data.totalQty;
  }

  const sellProfitBreakdown = useMemo(() => {
    const breakdown = {};
    sells.forEach((sell) => {
      const cat = getDisplayCategory(sell);
      if (!breakdown[cat]) breakdown[cat] = { totalProfit: 0, items: [] };
      const avgPP = getAveragePurchasePrice(sell.productId);
      const profit = (Number(sell.sellPrice) - avgPP) * Number(sell.quantity);
      breakdown[cat].totalProfit += profit;
      breakdown[cat].items.push({ ...sell, profit });
    });
    return Object.entries(breakdown).map(([category, values]) => ({
      category,
      ...values,
    }));
  }, [sells, purchaseMap]);

  let breakdownData = [];
  if (viewMode === "stock") {
    breakdownData = stockBreakdown.map((item) => ({
      category: item.category,
      total: item.total,
      value: item.value,
      items: item.items,
      topItems: item.items
        .sort(
          (a, b) =>
            getAverageMarketPrice(b) * b.quantity -
            getAverageMarketPrice(a) * a.quantity
        )
        .slice(0, 3)
        .map(
          (it) =>
            `${it.name} - $${formatCurrency(getAverageMarketPrice(it) * it.quantity)}`
        ),
    }));
  } else if (viewMode === "purchases") {
    breakdownData = purchaseBreakdown.map((item) => ({
      category: item.category,
      total: item.total,
      value: item.value,
      items: item.items,
      topItems: item.items
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map(
          (it) =>
            `${getDisplayProductName(it, products, viewMode)} - $${formatCurrency(
              Number(it.purchasePrice) * Number(it.quantity)
            )}`
        ),
    }));
  } else if (viewMode === "sells") {
    if (currentBreakdownType === "profit") {
      breakdownData = sellProfitBreakdown.map((item) => ({
        category: item.category,
        totalProfit: item.totalProfit,
        items: item.items,
        topItems: item.items
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 3)
          .map(
            (it) =>
              `${getDisplayProductName(it, products, viewMode)} - $${formatCurrency(it.profit)}`
          ),
      }));
    } else {
      breakdownData = sellBreakdown.map((item) => ({
        category: item.category,
        total: item.total,
        value: item.value,
        items: item.items,
        topItems: item.items
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map(
            (it) =>
              `${getDisplayProductName(it, products, viewMode)} - $${formatCurrency(
                Number(it.sellPrice) * Number(it.quantity)
              )}`
          ),
      }));
    }
  }

  const grandTotal = useMemo(() => {
    if (viewMode === "sells" && currentBreakdownType === "profit") {
      return breakdownData.reduce(
        (acc, row) => acc + (row.totalProfit || 0),
        0
      );
    } else {
      return breakdownData.reduce((acc, row) => acc + (row.value || 0), 0);
    }
  }, [breakdownData, viewMode, currentBreakdownType]);

  function toggleExpand(category) {
    setExpandedCategory((prev) => (prev === category ? null : category));
  }

  const modalFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const catId = p.categoryId ? p.categoryId._id || p.categoryId : "";
      const brId = p.brandId ? p.brandId._id || p.brandId : "";
      if (modalFilterCategory !== "all" && catId !== modalFilterCategory)
        return false;
      if (modalFilterBrand !== "all" && brId !== modalFilterBrand) return false;
      return true;
    });
  }, [products, modalFilterCategory, modalFilterBrand]);

  const availableBrands = useMemo(() => {
    if (modalFilterCategory === "all") return brands;
    const prodBrands = products
      .filter((p) => {
        const catId = p.categoryId ? p.categoryId._id || p.categoryId : "";
        return catId === modalFilterCategory;
      })
      .map((p) =>
        typeof p.brandId === "object"
          ? p.brandId
          : { _id: p.brandId, name: p.brand }
      );
    return Array.from(new Map(prodBrands.map((b) => [b._id, b])).values());
  }, [modalFilterCategory, products, brands]);

  const availableCategories = useMemo(() => {
    if (modalFilterBrand === "all") return categories;
    const prodCats = products
      .filter((p) => {
        const brId = p.brandId ? p.brandId._id || p.brandId : "";
        return brId === modalFilterBrand;
      })
      .map((p) =>
        typeof p.categoryId === "object"
          ? p.categoryId
          : { _id: p.categoryId, name: p.category }
      );
    return Array.from(new Map(prodCats.map((c) => [c._id, c])).values());
  }, [modalFilterBrand, products, categories]);

  function AllProductsModal() {
    const modalTotal = useMemo(() => {
      return modalFilteredProducts.reduce(
        (acc, p) => acc + Number(p.price) * Number(p.quantity),
        0
      );
    }, [modalFilteredProducts]);

    return (
      <Transition appear show={allProductsModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setAllProductsModalOpen(false)}
        >
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
          <div className="fixed inset-0">
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
                <Dialog.Panel className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="p-3 mb-4 text-2xl font-bold text-white bg-blue-600 rounded">
                    All Products
                  </Dialog.Title>
                  <div className="flex flex-col gap-4 mb-4 sm:flex-row">
                    <div>
                      <label className="block mb-1 text-sm font-bold text-gray-800">
                        Category
                      </label>
                      <select
                        value={modalFilterCategory}
                        onChange={(e) => setModalFilterCategory(e.target.value)}
                        className="px-3 py-2 rounded border min-w-[150px]"
                      >
                        <option value="all">All Categories</option>
                        {availableCategories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-bold text-gray-800">
                        Brand
                      </label>
                      <select
                        value={modalFilterBrand}
                        onChange={(e) => setModalFilterBrand(e.target.value)}
                        className="px-3 py-2 rounded border min-w-[150px]"
                      >
                        <option value="all">All Brands</option>
                        {availableBrands.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="w-full overflow-x-auto max-h-[60vh]">
                    <Table className="w-full table-auto">
                      <TableHead>
                        <tr className="bg-gray-100">
                          <TableHeader
                            style={{ minWidth: "50px" }}
                            className="px-4 py-2 text-sm font-bold text-blue-900"
                          >
                            S/N
                          </TableHeader>
                          <TableHeader
                            style={{ minWidth: "150px" }}
                            className="px-4 py-2 text-sm font-bold text-blue-900 break-words whitespace-normal"
                          >
                            Name
                          </TableHeader>
                          <TableHeader
                            style={{ minWidth: "150px" }}
                            className="px-4 py-2 text-sm font-bold text-blue-900"
                          >
                            Category
                          </TableHeader>
                          <TableHeader
                            style={{ minWidth: "150px" }}
                            className="px-4 py-2 text-sm font-bold text-blue-900"
                          >
                            Brand
                          </TableHeader>
                          <TableHeader
                            style={{ minWidth: "150px" }}
                            className="px-4 py-2 text-sm font-bold text-right text-blue-900"
                          >
                            Avg. Market Price
                          </TableHeader>
                          <TableHeader
                            style={{ minWidth: "80px" }}
                            className="px-4 py-2 text-sm font-bold text-right text-blue-900"
                          >
                            Qty
                          </TableHeader>
                          <TableHeader
                            style={{ minWidth: "100px" }}
                            className="px-4 py-2 text-sm font-bold text-right text-blue-900"
                          >
                            Value
                          </TableHeader>
                        </tr>
                      </TableHead>
                      <TableBody>
                        {modalFilteredProducts.map((p, idx) => (
                          <TableRow
                            key={p._id}
                            className="transition bg-white border-b hover:bg-gray-50"
                          >
                            <TableCell className="px-4 py-2 text-sm text-gray-700">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm font-semibold text-gray-900 break-words whitespace-normal">
                              {p.name}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm text-gray-700">
                              {getCategoryName(p)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm text-gray-700">
                              {getBrandName(p)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm text-right text-gray-700">
                              ${formatCurrency(Number(p.price))}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm text-right text-gray-700">
                              {Number(p.quantity).toLocaleString()}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-sm font-bold text-right text-gray-900">
                              $
                              {formatCurrency(
                                Number(p.price) * Number(p.quantity)
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-indigo-700">
                          <TableCell
                            className="px-4 py-2 text-sm font-bold text-white"
                            colSpan={6}
                            align="right"
                          >
                            Grand Total:
                          </TableCell>
                          <TableCell className="px-4 py-2 text-sm font-bold text-right text-white">
                            ${formatCurrency(modalTotal)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setAllProductsModalOpen(false)}
                      className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  // --------------------------------------------------------------------
  // Render Breakdown Rows for the Summary Table
  // --------------------------------------------------------------------
  function renderBreakdownRows(breakdownData, expandedCategory, toggleExpand) {
    return breakdownData.map((row) => (
      <Fragment key={row.category}>
        <TableRow className="transition bg-white border-b hover:bg-gray-50">
          <TableCell className="px-4 py-2 text-sm text-gray-800">
            {row.category}
          </TableCell>
          <TableCell className="px-4 py-2 text-sm text-right text-gray-800">
            {row.total}
          </TableCell>
          <TableCell className="px-4 py-2 text-sm text-right text-gray-800">
            ${formatCurrency(row.value)}
          </TableCell>
          <TableCell>
            <button
              onClick={() => toggleExpand(row.category)}
              className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {expandedCategory === row.category ? "Hide Details" : "Details"}
            </button>
          </TableCell>
        </TableRow>
        {expandedCategory === row.category && (
          <TableRow>
            <TableCell colSpan={4}>
              <ExpandedDetails
                category={row.category}
                items={row.items || []}
                useAveragePrice={viewMode === "stock"}
                viewMode={viewMode}
                getDisplayProductName={getDisplayProductNameWrapper}
                products={products}
              />
            </TableCell>
          </TableRow>
        )}
      </Fragment>
    ));
  }

  // --------------------------------------------------------------------
  // Main Render
  // --------------------------------------------------------------------
  if (loading) {
    return (
      <div className="mt-8 text-xl text-center">Loading dashboard data...</div>
    );
  }
  if (error) {
    return <div className="mt-8 text-xl text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen p-4 text-gray-800 bg-gray-100">
      {/* Header: View Mode Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => {
            setViewMode("stock");
            setCurrentBreakdownType("combined");
            setExpandedCategory(null);
          }}
          className={clsx(
            "px-6 py-2 rounded-lg font-bold",
            viewMode === "stock"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          )}
        >
          Stock
        </button>
        <button
          onClick={() => {
            setViewMode("purchases");
            setCurrentBreakdownType("total");
            setExpandedCategory(null);
          }}
          className={clsx(
            "px-6 py-2 rounded-lg font-bold",
            viewMode === "purchases"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          )}
        >
          Purchases
        </button>
        <button
          onClick={() => {
            setViewMode("sells");
            setCurrentBreakdownType("total");
            setExpandedCategory(null);
          }}
          className={clsx(
            "px-6 py-2 rounded-lg font-bold",
            viewMode === "sells"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          )}
        >
          Sells
        </button>
      </div>

      {/* Breakdown Summary Table */}
      <div className="w-full mb-6 overflow-x-auto">
        <Table className="w-full table-auto">
          <TableHead>
            <tr className="text-white bg-gradient-to-r from-blue-500 to-blue-600">
              <TableHeader className="px-4 py-2 text-sm">Category</TableHeader>
              <TableHeader className="px-4 py-2 text-sm text-right">
                Count
              </TableHeader>
              <TableHeader className="px-4 py-2 text-sm text-right">
                Total Value
              </TableHeader>
              <TableHeader className="px-4 py-2 text-sm">Action</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {renderBreakdownRows(breakdownData, expandedCategory, toggleExpand)}
            <TableRow className="bg-indigo-700">
              <TableCell
                className="px-4 py-2 text-sm font-bold text-white"
                colSpan={3}
                align="right"
              >
                Grand Total:
              </TableCell>
              <TableCell className="px-4 py-2 text-sm font-bold text-right text-white">
                ${formatCurrency(grandTotal)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* "See All Products" Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setAllProductsModalOpen(true)}
          className="px-6 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
        >
          See All Products
        </button>
      </div>

      {/* "See All Products" Modal */}
      {allProductsModalOpen && <AllProductsModal />}
    </div>
  );
}

export default DashboardBoard;
