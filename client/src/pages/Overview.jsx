/********************************************************************************************
 * FILE: src/pages/Overview.jsx
 ********************************************************************************************/
import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

// Register Chart.js components and plugins.
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);

// Define category colors.
const categoryColors = {
  Electronics: "#FF5733",
  "Home Appliances": "#33aF99",
  Clothes: "#3357FF",
  Accessories: "#FF33A8",
  Shoes: "#FF9900",
  Beauty: "#8E44AD",
  Tools: "#2ECC71",
  "Unknown Category": "#95A5A6",
};

// Format number helper.
function formatNumber(num) {
  const absVal = Math.abs(num);
  const decimalRemainder = num % 1 !== 0;
  if (absVal < 1000) {
    const integerPart = Math.floor(num);
    return decimalRemainder ? integerPart + "+" : String(integerPart);
  }
  if (absVal < 1_000_000) {
    const thousands = Math.floor(num / 1000);
    return thousands + "k" + (decimalRemainder ? "+" : "");
  }
  const millions = Math.floor(num / 1_000_000);
  return millions + "M" + (decimalRemainder ? "+" : "");
}

// Convert string to Title Case.
function toTitleCase(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Chart data helpers.
function getChartData(labels, values) {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map(
          (label) => categoryColors[label] || "#000000"
        ),
        hoverBackgroundColor: labels.map(
          (label) => categoryColors[label] || "#000000"
        ),
      },
    ],
  };
}

function getBarChartData(labels, values) {
  return {
    labels,
    datasets: [
      {
        label: "Value",
        data: values,
        backgroundColor: labels.map(
          (label) => categoryColors[label] || "#000000"
        ),
        borderColor: labels.map((label) => categoryColors[label] || "#000000"),
        borderWidth: 1,
      },
    ],
  };
}

function Overview() {
  const navigate = useNavigate();

  // State declarations.
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedChartView, setSelectedChartView] = useState("Products"); // "Products", "Purchases", "Sells"
  const [selectedChartType, setSelectedChartType] = useState("Pie"); // "Pie" or "Bar"

  const [productChartData, setProductChartData] = useState({
    labels: [],
    values: [],
  });
  const [purchaseChartData, setPurchaseChartData] = useState({
    labels: [],
    values: [],
  });
  const [sellChartData, setSellChartData] = useState({
    labels: [],
    values: [],
  });

  // Top aggregations.
  const [topProducts, setTopProducts] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [topProfitableProducts, setTopProfitableProducts] = useState([]);
  const [topProfitByPersons, setTopProfitByPersons] = useState([]);

  // Modal state if needed.
  const [allProductsModalOpen, setAllProductsModalOpen] = useState(false);

  // Helper: get full name from a user object.
  function getFullName(userObj, defaultLabel = "Unknown") {
    if (!userObj || typeof userObj !== "object") return defaultLabel;
    const fn = userObj.firstName?.trim() || "";
    const ln = userObj.lastName?.trim() || "";
    let combined = (fn + " " + ln).trim();
    if (!combined) {
      combined = userObj.name?.trim() || userObj.username?.trim() || "";
    }
    return combined || defaultLabel;
  }

  useEffect(() => {
    async function fetchAggregates() {
      try {
        setLoading(true);
        // Fetch products, purchases, and sells.
        const [prodResp, purchResp, sellResp] = await Promise.all([
          apiClient.get("/products?limit=0"),
          apiClient.get("/purchases?limit=0"),
          apiClient.get("/sells?limit=0"),
        ]);
        const productsData = prodResp.data.data || [];

        // Use the real purchase objects from the /purchases endpoint if any.
        const rawPurchases = purchResp.data.data || [];
        // If empty, fallback to deriving from product's embedded arrays:
        const purchasesData =
          rawPurchases.length > 0
            ? rawPurchases
            : productsData.flatMap((prod) =>
                (prod.purchases || []).map((p) => ({
                  ...p,
                  productId: prod._id,
                }))
              );

        // Use the real sell objects from the /sells endpoint if any.
        const rawSells = sellResp.data.data || [];
        // If empty, fallback to deriving from product's embedded arrays:
        const sellsData =
          rawSells.length > 0
            ? rawSells
            : productsData.flatMap((prod) =>
                (prod.sells || []).map((s) => ({ ...s, productId: prod._id }))
              );

        setProducts(productsData);
        setPurchases(purchasesData);
        setSells(sellsData);

        // --- Aggregate Products by Category (count) ---
        const prodCounts = {};
        productsData.forEach((prod) => {
          let categoryName = "Unknown Category";
          if (prod.categoryId) {
            if (typeof prod.categoryId === "object" && prod.categoryId.name) {
              categoryName = prod.categoryId.name;
            } else if (typeof prod.categoryId === "string") {
              categoryName = prod.category || "Unknown Category";
            }
          }
          prodCounts[categoryName] = (prodCounts[categoryName] || 0) + 1;
        });
        const prodLabels = Object.keys(prodCounts);
        const prodValues = Object.values(prodCounts);
        setProductChartData({ labels: prodLabels, values: prodValues });

        // Build productCategoryMap for grouping
        const productCategoryMap = {};
        productsData.forEach((prod) => {
          let categoryName = "Unknown Category";
          if (prod.categoryId) {
            if (typeof prod.categoryId === "object" && prod.categoryId.name) {
              categoryName = prod.categoryId.name;
            } else if (typeof prod.categoryId === "string") {
              categoryName = prod.category || "Unknown Category";
            }
          }
          productCategoryMap[String(prod._id)] = categoryName;
        });

        // --- Aggregate Purchases by Category ---
        const purchTotals = {};
        purchasesData.forEach((p) => {
          const catName =
            productCategoryMap[String(p.productId)] || "Unknown Category";
          // Use p.purchasePrice (not p.price!)
          const totalVal = (p.purchasePrice || 0) * (p.quantity || 0);
          purchTotals[catName] = (purchTotals[catName] || 0) + totalVal;
        });
        const purchLabels = Object.keys(purchTotals);
        const purchValues = Object.values(purchTotals);
        setPurchaseChartData({ labels: purchLabels, values: purchValues });

        // --- Aggregate Sells by Category ---
        const sellTotals = {};
        sellsData.forEach((s) => {
          const catName =
            productCategoryMap[String(s.productId)] || "Unknown Category";
          // Use s.sellPrice (not s.price!)
          const totalVal = (s.sellPrice || 0) * (s.quantity || 0);
          sellTotals[catName] = (sellTotals[catName] || 0) + totalVal;
        });
        const sellLabels = Object.keys(sellTotals);
        const sellValues = Object.values(sellTotals);
        setSellChartData({ labels: sellLabels, values: sellValues });

        // --- Top 3 Products by Purchase Spending ---
        const productPurchaseMap = {};
        purchasesData.forEach((p) => {
          const key = String(p.productId);
          productPurchaseMap[key] =
            (productPurchaseMap[key] || 0) +
            (p.purchasePrice || 0) * (p.quantity || 0);
        });
        const topProd = Object.entries(productPurchaseMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([prodId, total]) => ({
            productName:
              productsData.find((pr) => String(pr._id) === prodId)?.name ||
              "Unknown Product",
            totalSpent: total,
          }));
        setTopProducts(topProd);

        // --- Buyers Aggregation ---
        const buyerMap = {};
        purchasesData.forEach((p) => {
          const buyerObject =
            p.buyerId && typeof p.buyerId === "object" ? p.buyerId : null;
          let buyerKey =
            buyerObject?._id ||
            (p.buyerId && typeof p.buyerId === "string"
              ? p.buyerId.toString()
              : null);
          if (!buyerKey && p.buyerName) buyerKey = p.buyerName.trim();
          if (!buyerKey) buyerKey = "unknown";
          let displayName =
            buyerKey === "unknown"
              ? "Unknown Buyer"
              : toTitleCase(getFullName(buyerObject, "Unknown Buyer"));
          if (buyerKey === p.buyerName) displayName = p.buyerName;

          if (!buyerMap[buyerKey]) {
            buyerMap[buyerKey] = { totalPaid: 0, name: displayName };
          }
          buyerMap[buyerKey].totalPaid +=
            (p.purchasePrice || 0) * (p.quantity || 0);
        });
        const sortedBuyers = Object.entries(buyerMap).sort(
          (a, b) => b[1].totalPaid - a[1].totalPaid
        );
        const topBuyer = sortedBuyers.slice(0, 3).map(([buyerId, info]) => ({
          buyerId,
          name: info.name,
          totalPaid: info.totalPaid,
        }));
        setTopBuyers(topBuyer);

        // --- Sellers Aggregation ---
        const sellerMap = {};
        sellsData.forEach((s) => {
          const sellerObject =
            s.sellerId && typeof s.sellerId === "object" ? s.sellerId : null;
          let sellerKey =
            sellerObject?._id ||
            (s.sellerId && typeof s.sellerId === "string"
              ? s.sellerId.toString()
              : null);
          if (!sellerKey && s.sellerName) sellerKey = s.sellerName.trim();
          if (!sellerKey) sellerKey = "unknown";

          let displayName =
            sellerKey === "unknown"
              ? "Unknown Seller"
              : getFullName(sellerObject, "Unknown Seller");
          if (sellerKey === s.sellerName) displayName = s.sellerName;

          if (!sellerMap[sellerKey]) {
            sellerMap[sellerKey] = { totalSold: 0, name: displayName };
          }
          sellerMap[sellerKey].totalSold +=
            (s.sellPrice || 0) * (s.quantity || 0);
        });
        const sortedSellers = Object.entries(sellerMap).sort(
          (a, b) => b[1].totalSold - a[1].totalSold
        );
        const topSeller = sortedSellers.slice(0, 3).map(([sellerId, info]) => ({
          sellerId,
          name: info.name,
          totalSold: info.totalSold,
        }));
        setTopSellers(topSeller);

        // --- Top 3 Most Profitable Products ---
        // 1) Build average purchase prices map.
        const purchasePriceMap2 = {};
        purchasesData.forEach((p) => {
          const key = String(p.productId);
          if (!purchasePriceMap2[key]) {
            purchasePriceMap2[key] = { total: 0, qty: 0 };
          }
          purchasePriceMap2[key].total +=
            (p.purchasePrice || 0) * (p.quantity || 0);
          purchasePriceMap2[key].qty += p.quantity || 0;
        });
        const avgPurchasePrices = {};
        Object.keys(purchasePriceMap2).forEach((key) => {
          const data = purchasePriceMap2[key];
          avgPurchasePrices[key] = data.qty > 0 ? data.total / data.qty : 0;
        });

        // 2) For sells: compute profit using effective cost.
        const productProfitMap = {};
        sellsData.forEach((s) => {
          const key = String(s.productId);
          const avgCostRaw = avgPurchasePrices[key] || 0;
          // Fallback: if no avg purchase cost, use 75% of product's market price.
          const product = productsData.find((pr) => String(pr._id) === key);
          const fallbackCost = product ? product.price * 0.75 : 0;
          const effectiveCost = avgCostRaw > 0 ? avgCostRaw : fallbackCost;
          const revenue = (s.sellPrice || 0) * (s.quantity || 0);
          const cost = effectiveCost * (s.quantity || 0);
          const profit = revenue - cost;
          productProfitMap[key] = (productProfitMap[key] || 0) + profit;
        });
        const topProfitable = Object.entries(productProfitMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([prodId, profit]) => ({
            productName:
              productsData.find((pr) => String(pr._id) === prodId)?.name ||
              "Unknown Product",
            profit,
          }));
        setTopProfitableProducts(topProfitable);

        // --- Top 3 Persons by Profit ---
        const sellerProfitMap = {};
        sellsData.forEach((s) => {
          const key = String(s.productId);
          const avgCostRaw = avgPurchasePrices[key] || 0;
          const product = productsData.find((pr) => String(pr._id) === key);
          const fallbackCost = product ? product.price * 0.75 : 0;
          const effectiveCost = avgCostRaw > 0 ? avgCostRaw : fallbackCost;
          const revenue = (s.sellPrice || 0) * (s.quantity || 0);
          const cost = effectiveCost * (s.quantity || 0);
          const netProfit = revenue - cost;

          let sellerKey;
          const sellerObject =
            s.sellerId && typeof s.sellerId === "object" ? s.sellerId : null;
          sellerKey = sellerObject
            ? sellerObject._id
            : s.sellerId
              ? s.sellerId.toString()
              : "unknown";

          let displayName =
            sellerKey === "unknown"
              ? "Unknown Seller"
              : getFullName(sellerObject, "Unknown Seller");
          if (s.sellerName && s.sellerName === sellerKey)
            displayName = s.sellerName;

          if (!sellerProfitMap[sellerKey]) {
            sellerProfitMap[sellerKey] = { name: displayName, totalProfit: 0 };
          }
          sellerProfitMap[sellerKey].totalProfit += netProfit;
        });
        const sortedProfitSellers = Object.entries(sellerProfitMap).sort(
          (a, b) => b[1].totalProfit - a[1].totalProfit
        );
        const topProfit = sortedProfitSellers
          .slice(0, 3)
          .map(([key, data]) => ({
            sellerKey: key,
            name: data.name,
            profit: data.totalProfit,
          }));
        setTopProfitByPersons(topProfit);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching aggregated data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    }
    fetchAggregates();
  }, []);

  // Determine chart data.
  let chartData = {};
  let chartTitle = "";
  let isMoneyChart = false;
  if (selectedChartView === "Products") {
    chartData = getChartData(productChartData.labels, productChartData.values);
    chartTitle = "Products by Category";
    isMoneyChart = false;
  } else if (selectedChartView === "Purchases") {
    chartData = getChartData(
      purchaseChartData.labels,
      purchaseChartData.values
    );
    chartTitle = "Purchases by Category";
    isMoneyChart = true;
  } else if (selectedChartView === "Sells") {
    chartData = getChartData(sellChartData.labels, sellChartData.values);
    chartTitle = "Sells by Category";
    isMoneyChart = true;
  }

  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value, context) => {
          const dataset = context.dataset.data;
          const total = dataset.reduce((acc, val) => acc + val, 0);
          const percentage =
            total > 0 ? ((value / total) * 100).toFixed(2) + "%" : "0%";
          return percentage;
        },
        font: { weight: "bold" },
      },
      legend: {
        position: "bottom",
        labels: {
          generateLabels: (chart) => {
            const { data } = chart;
            return data.labels.map((label, i) => {
              const dataset = data.datasets[0];
              const rawValue = dataset.data[i];
              let formatted = rawValue;
              if (isMoneyChart) {
                formatted = "$" + formatNumber(Number(rawValue).toFixed(2));
              }
              return {
                text: `${label} (${formatted})`,
                fillStyle: dataset.backgroundColor[i],
                hidden: isNaN(rawValue) || rawValue === null,
                index: i,
              };
            });
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: chartTitle },
      datalabels: {
        color: "#000",
        anchor: "end",
        align: "top",
        formatter: (value) => {
          if (isMoneyChart) {
            return (
              "$" +
              Number(value)
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            );
          }
          return value;
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="mt-8 text-xl text-center">Loading dashboard data...</div>
    );
  }
  if (error) {
    return <div className="mt-8 text-xl text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 mx-auto max-w-7xl">
      {/* Return to Dashboard Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 text-white bg-blue-600 rounded shadow hover:bg-blue-700"
        >
          ← Dashboard
        </button>
      </div>

      <h1 className="mb-8 text-4xl font-bold text-center">
        Dashboard Overview
      </h1>

      {/* Chart Selection Controls */}
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row">
        <div className="flex items-center space-x-4">
          <label className="font-semibold">View:</label>
          <select
            value={selectedChartView}
            onChange={(e) => setSelectedChartView(e.target.value)}
            className="px-3 py-2 border rounded min-w-[10rem]"
          >
            <option value="Products">Products</option>
            <option value="Purchases">Purchases</option>
            <option value="Sells">Sells</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="font-semibold">Chart Type:</label>
          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value)}
            className="px-3 py-2 border rounded min-w-[10rem]"
          >
            <option value="Pie">Pie Chart</option>
            <option value="Bar">Bar Chart</option>
          </select>
        </div>
      </div>

      {/* Chart Display */}
      <div className="p-4 mb-8 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold text-center">
          {chartTitle}
        </h2>
        {selectedChartType === "Pie" ? (
          <Pie data={chartData} options={pieOptions} />
        ) : (
          <Bar
            data={getBarChartData(chartData.labels, chartData.datasets[0].data)}
            options={barOptions}
          />
        )}
      </div>

      {/* Categories Summary Table */}
      <div className="p-4 mb-8 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold">Categories Summary</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-center border">Category</th>
              <th className="px-2 py-1 text-center border">Count</th>
            </tr>
          </thead>
          <tbody>
            {productChartData.labels.map((label, idx) => (
              <tr key={label}>
                <td className="px-2 py-1 border">{label}</td>
                <td className="px-2 py-1 pr-5 text-right border">
                  {productChartData.values[idx]}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="px-2 py-1 border">Grand Total</td>
              <td className="px-2 py-1 pr-5 text-right border">
                {productChartData.values.reduce((a, b) => a + b, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Purchases Summary Table */}
      <div className="p-4 mb-8 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold">Purchases Summary</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-center border">Category</th>
              <th className="px-2 py-1 text-center border">
                Total Purchase ($)
              </th>
            </tr>
          </thead>
          <tbody>
            {purchaseChartData.labels.map((label, idx) => (
              <tr key={label}>
                <td className="px-2 py-1 border">{label}</td>
                <td className="px-2 py-1 pr-5 text-right border">
                  $
                  {purchaseChartData.values[idx]
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="px-2 py-1 border">Grand Total</td>
              <td className="px-2 py-1 pr-5 text-right border">
                $
                {purchaseChartData.values
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sells Summary Table */}
      <div className="p-4 mb-8 bg-white rounded shadow">
        <h2 className="mb-4 text-2xl font-semibold">Sells Summary</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-center border">Category</th>
              <th className="px-2 py-1 text-center border">Total Sales ($)</th>
            </tr>
          </thead>
          <tbody>
            {sellChartData.labels.map((label, idx) => (
              <tr key={label}>
                <td className="px-2 py-1 border">{label}</td>
                <td className="px-2 py-1 pr-5 text-right border">
                  $
                  {sellChartData.values[idx]
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="px-2 py-1 border">Grand Total</td>
              <td className="px-2 py-1 pr-5 text-right border">
                $
                {sellChartData.values
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Summaries */}
      <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
        {/* Top 3 Products by Purchase Spending */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-2xl font-semibold">
            Top 3 Products (Highest Purchase Spending)
          </h2>
          <ul className="ml-4 text-gray-700 list-disc">
            {topProducts.map((item, idx) => (
              <li key={idx}>
                <div className="basis-[100%] shrink-0">{item.productName}</div>
                <div className="flex items-center">
                  <span className="inline-block text-left w-28">
                    ▶︎ Total Spent:
                  </span>
                  <span className="w-20 basis-[20%] font-bold text-right text-red-500">
                    $
                    {item.totalSpent
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 3 Most Profitable Products */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-2xl font-semibold">
            Top 3 Most Profitable Products
          </h2>
          <ul className="ml-4 text-gray-700 list-disc">
            {topProfitableProducts.map((item, idx) => (
              <li key={idx}>
                <div className="basis-[100%] shrink-0">{item.productName}</div>
                <div className="flex items-center">
                  <span className="inline-block text-left w-28">
                    ▶︎ Total Profit:
                  </span>
                  <span className="w-20 basis-[20%] font-bold text-right text-green-700">
                    $
                    {item.profit
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 3 Buyers */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-2xl font-semibold">Top 3 Buyers</h2>
          <ul className="ml-4 text-gray-700 list-disc">
            {topBuyers.map((item, idx) => (
              <li key={idx} className="flex items-center">
                <span className="inline-block font-bold w-28 text-violet-700">
                  {toTitleCase(item.name)}
                </span>
                <span className="inline-block w-6 text-center">▶︎</span>
                <span className="inline-block w-20 text-left">Total Paid:</span>
                <span className="text-right basis-[20%] font-bold text-red-500">
                  $
                  {item.totalPaid
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 3 Sellers */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-2xl font-semibold">Top 3 Sellers</h2>
          <ul className="ml-4 text-gray-700 list-disc">
            {topSellers.map((item, idx) => (
              <li key={idx} className="flex items-center">
                <span className="inline-block font-bold w-28 text-violet-700">
                  {toTitleCase(item.name)}
                </span>
                <span className="inline-block w-6 text-center">▶︎</span>
                <span className="inline-block w-20 text-left">Total Sold:</span>
                <span className="text-right basis-[20%] font-bold text-blue-700">
                  $
                  {item.totalSold
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 3 Persons with Highest Profit */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-2xl font-semibold">
            Top 3 Persons with Highest Profit
          </h2>
          <ul className="ml-4 text-gray-700 list-disc">
            {topProfitByPersons.map((person, idx) => (
              <li key={idx} className="flex items-center">
                <span className="inline-block font-bold w-28 text-violet-700">
                  {toTitleCase(person.name)}
                </span>
                <span className="inline-block w-6 text-center">▶︎</span>
                <span className="inline-block text-left w-25">
                  Total Profit:
                </span>
                <span className="text-right basis-[20%] text-green-700 font-bold">
                  $
                  {person.profit
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Overview;
