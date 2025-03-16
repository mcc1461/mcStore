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
} from "../components/Table";

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

function getAverageMarketPrice(product) {
  if (!product) return 0;
  return Number(product.price) || 0;
}

function getDisplayProductName(item, products, viewMode) {
  if (viewMode === "stock") return item.name;
  const prod = products.find((p) => String(p._id) === String(item.productId));
  return prod ? prod.name : "Unknown Product";
}

function getDisplayCategory(item, products, viewMode) {
  if (viewMode === "stock") return getCategoryName(item);
  if (item.category && item.category.trim() !== "") return item.category;
  if (item.categoryName && item.categoryName.trim() !== "")
    return item.categoryName;
  if (item.product) return getCategoryName(item.product);
  if (item.productId) {
    const prod = products.find((p) => String(p._id) === String(item.productId));
    if (prod) return getCategoryName(prod);
  }
  return "Unknown Category";
}

// --------------------------------------------------------------------
// Custom Hook to detect window width
// --------------------------------------------------------------------
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

// --------------------------------------------------------------------
// ExpandedDetails Component
// --------------------------------------------------------------------
// This component renders the details for a given category.
// On mobile (width < 640px), it displays each record in a vertical grid of label–value pairs,
// while on larger screens it renders a table.
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

  // Fallback if no items
  if (!items.length) {
    return (
      <div className="p-3 mt-2 bg-white border rounded shadow">
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          {category.trim()} Details
        </h3>
        <p className="text-gray-700">No data available.</p>
      </div>
    );
  }

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640; // "sm" breakpoint

  if (isMobile) {
    // Mobile: Render a vertical list of cards
    return (
      <div className="p-3 mt-2 bg-white border rounded shadow">
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          {category.trim()} Details
        </h3>
        <div className="flex flex-col gap-4">
          {items.map((it, idx) => {
            const price = useAveragePrice
              ? getAverageMarketPrice(it)
              : Number(it.price || it.purchasePrice || it.sellPrice) || 0;
            const qty = Number(it.quantity) || 0;
            const value = price * qty;
            // For mobile, show a simple grid of label/value pairs
            return (
              <div
                key={it._id}
                className="p-3 text-gray-900 border rounded bg-gray-50"
              >
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-semibold">S/N:</span>
                  <span>{idx + 1}</span>

                  <span className="font-semibold">Name:</span>
                  <span className="truncate">
                    {viewMode === "stock"
                      ? it.name
                      : getDisplayProductName(it, products, viewMode)}
                  </span>

                  {viewMode !== "stock" && (
                    <>
                      <span className="font-semibold">Brand:</span>
                      <span className="truncate">
                        {(() => {
                          const prod = it.productId
                            ? window.__dashboardProducts?.find(
                                (p) => p._id === it.productId
                              ) || {}
                            : it;
                          return getBrandName(prod);
                        })()}
                      </span>
                    </>
                  )}

                  <span className="font-semibold">
                    {useAveragePrice ? "Avg. Price:" : "Price:"}
                  </span>
                  <span>${formatCurrency(price)}</span>

                  <span className="font-semibold">Qty:</span>
                  <span>{qty.toLocaleString()}</span>

                  <span className="font-semibold">Value:</span>
                  <span>${formatCurrency(value)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-2 mt-3 font-bold text-right text-indigo-700 border-t">
          Total: ${formatCurrency(total)}
        </div>
      </div>
    );
  } else {
    // Desktop: Render table layout (ensure all text has high contrast)
    return (
      <div className="p-3 mt-2 bg-white border rounded shadow">
        <h3 className="mb-3 text-lg font-bold text-gray-900">
          {category.trim()} Details
        </h3>
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100">
                <TableHeader className="px-2 py-1 text-sm text-gray-900 border">
                  S/N
                </TableHeader>
                <TableHeader
                  style={{ minWidth: "250px" }}
                  className="px-2 py-1 text-sm text-gray-900 border"
                >
                  Name
                </TableHeader>
                <TableHeader className="hidden px-2 py-1 text-sm text-gray-900 border md:table-cell">
                  Brand
                </TableHeader>
                <TableHeader className="px-2 py-1 text-sm text-right text-gray-900 border">
                  {useAveragePrice ? "Avg. Price" : "Price"}
                </TableHeader>
                <TableHeader className="px-2 py-1 text-sm text-right text-gray-900 border">
                  Qty
                </TableHeader>
                <TableHeader className="px-2 py-1 text-sm text-right text-gray-900 border">
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
                    <TableCell className="px-2 py-1 text-sm text-gray-900 border">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-sm font-semibold text-gray-900 border">
                      {viewMode === "stock"
                        ? it.name
                        : getDisplayProductName(it, products, viewMode)}
                    </TableCell>
                    <TableCell className="hidden px-2 py-1 text-sm text-gray-900 border md:table-cell">
                      {(() => {
                        const prod = it.productId
                          ? window.__dashboardProducts?.find(
                              (p) => p._id === it.productId
                            ) || {}
                          : it;
                        return getBrandName(prod);
                      })()}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-sm text-right text-gray-900 border">
                      ${formatCurrency(price)}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-sm text-right text-gray-900 border">
                      {qty.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-2 py-1 text-sm font-bold text-right text-gray-900 border">
                      ${formatCurrency(price * qty)}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-indigo-700">
                <TableCell colSpan={6} className="px-2 py-1 border">
                  <div className="text-sm font-bold text-right text-white">
                    Total: ${formatCurrency(total)}
                  </div>
                </TableCell>
              </TableRow>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
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

  // "See All" modal state and filters
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
  // Category Display for breakdown
  // --------------------------------------------------------------------
  function getDisplayCategoryForBreakdown(item) {
    return getDisplayCategory(item, products, viewMode);
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
      const cat = getDisplayCategoryForBreakdown(item);
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
    [purchases, products, viewMode]
  );
  const sellBreakdown = useMemo(
    () => computeBreakdown(sells, "sellPrice"),
    [sells, products, viewMode]
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
    if (!data || data.totalQty === 0) {
      const product = products.find((p) => String(p._id) === String(productId));
      if (product) return getAverageMarketPrice(product) * 0.75;
      return 0;
    }
    return data.totalSpent / data.totalQty;
  }

  const sellProfitBreakdown = useMemo(() => {
    const breakdown = {};
    sells.forEach((sell) => {
      const cat = getDisplayCategoryForBreakdown(sell);
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
  }, [sells, purchaseMap, products, viewMode]);

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
            `${it.name} - $${formatCurrency(
              getAverageMarketPrice(it) * it.quantity
            )}`
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
              `${getDisplayProductName(it, products, viewMode)} - $${formatCurrency(
                it.profit
              )}`
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

  const totalItems = useMemo(() => {
    return breakdownData.reduce((acc, row) => acc + (row.total || 0), 0);
  }, [breakdownData]);

  function toggleExpand(category) {
    setExpandedCategory((prev) => (prev === category ? null : category));
  }

  // --------------------------------------------------------------------
  // Modal Data Filtering Based on View Mode
  // --------------------------------------------------------------------
  const modalFilteredData = useMemo(() => {
    return (() => {
      if (viewMode === "stock") {
        return (products || []).filter((p) => {
          const catId = p.categoryId ? p.categoryId._id || p.categoryId : "";
          const brId = p.brandId ? p.brandId._id || p.brandId : "";
          if (modalFilterCategory !== "all" && catId !== modalFilterCategory)
            return false;
          if (modalFilterBrand !== "all" && brId !== modalFilterBrand)
            return false;
          return true;
        });
      } else {
        const dataList = viewMode === "purchases" ? purchases : sells;
        return (dataList || []).filter((rec) => {
          const product = products.find(
            (prod) => String(prod._id) === String(rec.productId)
          );
          let catId = "";
          let brId = "";
          if (product) {
            catId = product.categoryId
              ? product.categoryId._id || product.categoryId
              : "";
            brId = product.brandId
              ? product.brandId._id || product.brandId
              : "";
          }
          if (modalFilterCategory !== "all" && catId !== modalFilterCategory)
            return false;
          if (modalFilterBrand !== "all" && brId !== modalFilterBrand)
            return false;
          return true;
        });
      }
    })();
  }, [
    viewMode,
    products,
    purchases,
    sells,
    modalFilterCategory,
    modalFilterBrand,
  ]);

  const availableBrands = useMemo(() => {
    if (modalFilterCategory === "all") return brands;
    return brands.filter((b) => {
      return products.some((p) => {
        const pCatId = p.categoryId ? p.categoryId._id || p.categoryId : "";
        const pBrId = p.brandId ? p.brandId._id || p.brandId : "";
        return pCatId === modalFilterCategory && pBrId === b._id;
      });
    });
  }, [modalFilterCategory, products, brands]);

  const availableCategories = useMemo(() => {
    if (modalFilterBrand === "all") return categories;
    return categories.filter((c) => {
      return products.some((p) => {
        const pCatId = p.categoryId ? p.categoryId._id || p.categoryId : "";
        const pBrId = p.brandId ? p.brandId._id || p.brandId : "";
        return pBrId === modalFilterBrand && pCatId === c._id;
      });
    });
  }, [modalFilterBrand, products, categories]);

  // --------------------------------------------------------------------
  // "See All" Modal with responsive layout
  // --------------------------------------------------------------------
  function AllProductsModal() {
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 640; // mobile breakpoint

    const modalTotal = useMemo(() => {
      return modalFilteredData.reduce((acc, p) => {
        let price = 0;
        if (viewMode === "stock") {
          price = Number(p.price) || 0;
        } else if (viewMode === "purchases") {
          price = Number(p.purchasePrice) || 0;
        } else {
          price = Number(p.sellPrice) || 0;
        }
        return acc + price * Number(p.quantity);
      }, 0);
    }, [modalFilteredData, viewMode]);

    const priceLabel =
      viewMode === "stock"
        ? "Avg. Market Price"
        : viewMode === "purchases"
          ? "Purchase Price"
          : "Sell Price";

    if (isMobile) {
      // MOBILE LAYOUT: Render each record as a vertical card (omit less important columns)
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
                  <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                    <Dialog.Title className="p-3 mb-4 text-2xl font-bold text-white bg-blue-600 rounded">
                      {viewMode === "stock"
                        ? "All Products"
                        : viewMode === "purchases"
                          ? "All Purchases"
                          : "All Sells"}
                    </Dialog.Title>
                    <div className="flex flex-col gap-3">
                      {modalFilteredData.map((p, idx) => {
                        let price = 0;
                        if (viewMode === "stock") {
                          price = Number(p.price) || 0;
                        } else if (viewMode === "purchases") {
                          price = Number(p.purchasePrice) || 0;
                        } else {
                          price = Number(p.sellPrice) || 0;
                        }
                        const qty = Number(p.quantity) || 0;
                        const value = price * qty;
                        let prod = null;
                        if (viewMode === "stock") {
                          prod = p;
                        } else {
                          prod = products.find(
                            (x) => String(x._id) === String(p.productId)
                          );
                        }
                        return (
                          <div
                            key={p._id}
                            className="p-3 text-gray-900 border rounded bg-gray-50"
                          >
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <span className="font-bold">S/N:</span>
                              <span>{idx + 1}</span>
                              <span className="font-bold">Name:</span>
                              <span className="truncate max-w-[150px]">
                                {viewMode === "stock"
                                  ? p.name
                                  : getDisplayProductName(
                                      p,
                                      products,
                                      viewMode
                                    )}
                              </span>
                              <span className="font-bold">{priceLabel}:</span>
                              <span>${formatCurrency(price)}</span>
                              <span className="font-bold">Qty:</span>
                              <span>{qty.toLocaleString()}</span>
                              <span className="font-bold">Value:</span>
                              <span>${formatCurrency(value)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-2 mt-4 font-bold text-right text-indigo-700 border-t">
                      Grand Total: ${formatCurrency(modalTotal)}
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setAllProductsModalOpen(false)}
                        className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
    } else {
      // DESKTOP LAYOUT: Render full table with horizontal scroll if needed.
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
                      {viewMode === "stock"
                        ? "All Products"
                        : viewMode === "purchases"
                          ? "All Purchases"
                          : "All Sells"}
                    </Dialog.Title>
                    <p className="mb-2 text-xs text-gray-600">
                      Swipe horizontally to view more columns
                    </p>
                    <div className="relative overflow-x-auto max-h-[60vh]">
                      <table className="w-full text-sm border-collapse table-auto">
                        <thead className="text-white bg-blue-600">
                          <tr>
                            <th
                              className="sticky left-0 z-10 px-3 py-2 align-middle bg-blue-600"
                              style={{ minWidth: "auto" }}
                            >
                              S/N
                            </th>
                            <th
                              style={{ minWidth: "250px" }}
                              className="px-3 py-2 align-middle"
                            >
                              Name
                            </th>
                            <th
                              className="hidden px-3 py-2 align-middle sm:table-cell"
                              style={{ minWidth: "auto" }}
                            >
                              Category
                            </th>
                            <th
                              className="hidden px-3 py-2 align-middle md:table-cell"
                              style={{ minWidth: "auto" }}
                            >
                              Brand
                            </th>
                            <th className="px-3 py-2 text-right align-middle">
                              {priceLabel}
                            </th>
                            <th className="px-3 py-2 text-right align-middle">
                              Qty
                            </th>
                            <th className="px-3 py-2 text-right align-middle">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalFilteredData.map((p, idx) => {
                            let price = 0;
                            if (viewMode === "stock") {
                              price = Number(p.price) || 0;
                            } else if (viewMode === "purchases") {
                              price = Number(p.purchasePrice) || 0;
                            } else {
                              price = Number(p.sellPrice) || 0;
                            }
                            const qty = Number(p.quantity) || 0;
                            const value = price * qty;
                            let prod = null;
                            if (viewMode === "stock") {
                              prod = p;
                            } else {
                              prod = products.find(
                                (x) => String(x._id) === String(p.productId)
                              );
                            }
                            return (
                              <tr
                                key={p._id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="sticky left-0 z-10 px-3 py-2 text-gray-700 align-middle bg-white">
                                  {idx + 1}
                                </td>
                                <td
                                  style={{ minWidth: "250px" }}
                                  className="px-3 py-2 font-semibold text-gray-900 break-words truncate whitespace-normal align-middle"
                                >
                                  {viewMode === "stock"
                                    ? p.name
                                    : getDisplayProductName(
                                        p,
                                        products,
                                        viewMode
                                      )}
                                </td>
                                <td className="hidden px-3 py-2 text-gray-700 align-middle sm:table-cell">
                                  {prod
                                    ? getCategoryName(prod)
                                    : "Unknown Category"}
                                </td>
                                <td className="hidden px-3 py-2 text-gray-700 align-middle md:table-cell">
                                  {prod ? getBrandName(prod) : "Unknown Brand"}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-700 align-middle">
                                  ${formatCurrency(price)}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-700 align-middle">
                                  {qty.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 font-bold text-right text-gray-900 align-middle">
                                  ${formatCurrency(value)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="text-white bg-indigo-700">
                            <td
                              className="px-3 py-2 font-bold"
                              colSpan={6}
                              align="right"
                            >
                              Grand Total:
                            </td>
                            <td className="px-3 py-2 font-bold text-right">
                              ${formatCurrency(modalTotal)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setAllProductsModalOpen(false)}
                        className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
  }

  // --------------------------------------------------------------------
  // Render Breakdown Rows for the Summary Table
  // --------------------------------------------------------------------
  function renderBreakdownRows(breakdownData, expandedCategory, toggleExpand) {
    return breakdownData.map((row) => (
      <Fragment key={row.category}>
        <TableRow className="transition bg-white border-b hover:bg-gray-50">
          <TableCell className="px-4 py-2 text-sm text-gray-900">
            {row.category}
          </TableCell>
          <TableCell className="px-4 py-2 text-sm text-right text-gray-900">
            {row.total}
          </TableCell>
          <TableCell className="px-4 py-2 text-sm text-right text-gray-900">
            {viewMode === "sells" && currentBreakdownType === "profit"
              ? `$${formatCurrency(row.totalProfit || 0)}`
              : `$${formatCurrency(row.value || 0)}`}
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
          <TableRow className="bg-blue-100">
            <TableCell colSpan={4}>
              <ExpandedDetails
                category={row.category}
                items={row.items || []}
                useAveragePrice={viewMode === "stock"}
                viewMode={viewMode}
                getDisplayProductName={getDisplayProductName}
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
    <div className="min-h-screen p-4 text-gray-900 bg-gray-100">
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
              : "bg-gray-200 text-gray-900"
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
              : "bg-gray-200 text-gray-900"
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
              : "bg-gray-200 text-gray-900"
          )}
        >
          Sells
        </button>
      </div>

      {/* Breakdown Summary Table */}
      <div className="w-full mb-6 overflow-x-auto">
        <Table className="w-full border-collapse table-auto">
          <TableHead>
            <tr className="text-white bg-gradient-to-r from-blue-500 to-blue-600">
              <TableHeader className="px-4 py-2 text-sm">Category</TableHeader>
              <TableHeader className="px-4 py-2 text-sm text-right">
                Count
              </TableHeader>
              <TableHeader className="px-4 py-2 text-sm text-right">
                {viewMode === "sells" && currentBreakdownType === "profit"
                  ? "Total Profit"
                  : "Total Value"}
              </TableHeader>
              <TableHeader className="px-4 py-2 text-sm">Action</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {renderBreakdownRows(breakdownData, expandedCategory, toggleExpand)}
            <TableRow className="bg-indigo-700">
              <TableCell
                className="px-4 py-2 text-sm font-bold text-white"
                colSpan={1}
                align="right"
              >
                Grand Total:
              </TableCell>
              <TableCell
                className="px-4 py-2 text-sm font-bold text-white"
                colSpan={1}
                align="right"
              >
                {Number(totalItems).toLocaleString()}
              </TableCell>
              <TableCell
                className="px-4 py-2 text-sm font-bold text-right text-white"
                colSpan={1}
              >
                ${formatCurrency(grandTotal)}
              </TableCell>
              <TableCell className="px-4 py-2 text-sm font-bold text-left text-white">
                {/* Empty */}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {viewMode === "stock" && (
        <div className="mt-4 text-sm text-center text-gray-700">
          Note: In the Stock view, the grand total is calculated using the
          average market price.
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setAllProductsModalOpen(true)}
          className="px-6 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
        >
          {viewMode === "stock"
            ? "See All Products"
            : viewMode === "purchases"
              ? "See All Purchases"
              : "See All Sells"}
        </button>
      </div>

      {allProductsModalOpen && <AllProductsModal />}
    </div>
  );
}

export default DashboardBoard;
