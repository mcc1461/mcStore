/********************************************************************************************
 * FILE: src/pages/Overview.jsx
 * This file displays an outstanding dashboard overview with charts and aggregated summaries.
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
import apiClient from "../services/apiClient";

// Register the necessary Chart.js components and plugins.
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

// Define a mapping of category names to distinct, contrasting colors.
const categoryColors = {
  Electronics: "#FF5733", // Vibrant Orange-Red
  "Home Appliances": "#33aF99", // Bright Green
  Clothes: "#3357FF", // Bold Blue
  Accessories: "#FF33A8", // Hot Pink
  Shoes: "#FF9900", // Vivid Yellow
  Beauty: "#8E44AD", // Deep Purple
  Tools: "#2ECC71", // Bright Green (or change if desired)
  "Unknown Category": "#95A5A6", // Gray for unknown
};

// Format Number
function formatNumber(num) {
  const absVal = Math.abs(num);
  // Check if there's any decimal remainder
  const decimalRemainder = num % 1 !== 0;

  // 1) Less than 1000
  if (absVal < 1000) {
    const integerPart = Math.floor(num);
    return decimalRemainder ? integerPart + "+" : String(integerPart);
  }

  // 2) 1000 <= value < 1,000,000
  if (absVal < 1_000_000) {
    // e.g., 23000 => 23k
    const thousands = Math.floor(num / 1000);
    return thousands + "k" + (decimalRemainder ? "+" : "");
  }

  // 3) 1,000,000 or more => X M
  const millions = Math.floor(num / 1_000_000);
  return millions + "M" + (decimalRemainder ? "+" : "");
}

// Title Case
function toTitleCase(str) {
  if (!str) return "";
  return str
    .split(" ") // Split into words by space
    .map((word) => {
      return word[0]?.toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

// Helper function to build data for a Pie chart.
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

// Helper function to build data for a Bar chart.
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
  // States for raw data
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart selection state
  const [selectedChartView, setSelectedChartView] = useState("Products"); // "Products", "Purchases", or "Sells"
  const [selectedChartType, setSelectedChartType] = useState("Pie"); // "Pie" or "Bar"

  // States for aggregated chart data
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

  // ---- Existing "top" states ----
  const [topProducts, setTopProducts] = useState([]); // Top 3 products by purchase spending
  const [topBuyers, setTopBuyers] = useState([]); // Top 3 buyers (from purchases)
  const [topSellers, setTopSellers] = useState([]); // Top 3 sellers (from sells)
  const [topProfitableProducts, setTopProfitableProducts] = useState([]); // Top 3 most profitable products

  // ---- New state for top persons' profit ----
  const [topProfitByPersons, setTopProfitByPersons] = useState([]); // Top 3 persons with highest total profit

  // State for the "See All" modal (assumed to be defined elsewhere)
  const [allProductsModalOpen, setAllProductsModalOpen] = useState(false);

  // A small helper to retrieve any available name fields
  function getFullName(userObj, defaultLabel = "Unknown") {
    if (!userObj || typeof userObj !== "object") return defaultLabel;

    // 1. Attempt "firstName lastName"
    const fn = userObj.firstName?.trim() || "";
    const ln = userObj.lastName?.trim() || "";
    let combined = (fn + " " + ln).trim();

    // 2. If that fails, fallback to userObj.name or userObj.username
    if (!combined) {
      combined = userObj.name?.trim() || userObj.username?.trim() || "";
    }

    return combined || defaultLabel;
  }

  // Fetch and aggregate data
  useEffect(() => {
    async function fetchAggregates() {
      try {
        setLoading(true);
        const [prodResp, purchResp, sellResp] = await Promise.all([
          apiClient.get("/products?limit=0"),
          apiClient.get("/purchases?limit=0"),
          apiClient.get("/sells?limit=0"),
        ]);
        const productsData = prodResp.data.data || [];
        const purchasesData = purchResp.data.data || [];
        const sellsData = sellResp.data.data || [];

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

        // --- Build a mapping: productId => category name ---
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
          productCategoryMap[prod._id] = categoryName;
        });

        // --- Aggregate Purchases by Category ---
        const purchTotals = {};
        purchasesData.forEach((p) => {
          const catName = productCategoryMap[p.productId] || "Unknown Category";
          const totalVal = (p.purchasePrice || 0) * (p.quantity || 0);
          purchTotals[catName] = (purchTotals[catName] || 0) + totalVal;
        });
        const purchLabels = Object.keys(purchTotals);
        const purchValues = Object.values(purchTotals);
        setPurchaseChartData({ labels: purchLabels, values: purchValues });

        // --- Aggregate Sells by Category ---
        const sellTotals = {};
        sellsData.forEach((s) => {
          const catName = productCategoryMap[s.productId] || "Unknown Category";
          const totalVal = (s.sellPrice || 0) * (s.quantity || 0);
          sellTotals[catName] = (sellTotals[catName] || 0) + totalVal;
        });
        const sellLabels = Object.keys(sellTotals);
        const sellValues = Object.values(sellTotals);
        setSellChartData({ labels: sellLabels, values: sellValues });

        // --- Additional Aggregations ---

        // Top 3 Products by Purchase Spending
        const productPurchaseMap = {};
        purchasesData.forEach((p) => {
          productPurchaseMap[p.productId] =
            (productPurchaseMap[p.productId] || 0) +
            (p.purchasePrice || 0) * (p.quantity || 0);
        });
        const topProd = Object.entries(productPurchaseMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([prodId, total]) => ({
            productName:
              productsData.find((pr) => pr._id === prodId)?.name ||
              "Unknown Product",
            totalSpent: total,
          }));
        setTopProducts(topProd);

        /* -----------------------------------------------------------------------------------
         * BUYERS AGGREGATION
         * If buyerId is an object, we use that. Otherwise, if buyerName is present, use that
         * as a unique key so multiple buyers appear (Melih, Mustafa, Dilecus, etc.)
         ----------------------------------------------------------------------------------- */
        const buyerMap = {};
        purchasesData.forEach((p) => {
          // If p.buyerId is an object, get an ID string from it
          const buyerObject =
            p.buyerId && typeof p.buyerId === "object" ? p.buyerId : null;

          let buyerKey =
            buyerObject?._id ||
            (p.buyerId && typeof p.buyerId === "string"
              ? p.buyerId.toString()
              : null);

          // Fallback: if there's a p.buyerName or similar field, use that as the key
          if (!buyerKey && p.buyerName) {
            buyerKey = p.buyerName.trim();
          }
          if (!buyerKey) {
            buyerKey = "unknown";
          }

          // Generate a display name (from object or fallback)
          let displayName =
            buyerKey === "unknown"
              ? "Unknown Buyer"
              : toTitleCase(getFullName(buyerObject, "Unknown Buyer"));

          // If we used p.buyerName as the key, let's also use that as the display name
          if (buyerKey === p.buyerName) {
            displayName = p.buyerName;
          }

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

        /* -----------------------------------------------------------------------------------
         * SELLERS AGGREGATION
         * Similarly, if sellerId is an object, we use that. Otherwise, if sellerName is present,
         * use that as a unique key to differentiate multiple sellers
         ----------------------------------------------------------------------------------- */
        const sellerMap = {};
        sellsData.forEach((s) => {
          const sellerObject =
            s.sellerId && typeof s.sellerId === "object" ? s.sellerId : null;

          let sellerKey =
            sellerObject?._id ||
            (s.sellerId && typeof s.sellerId === "string"
              ? s.sellerId.toString()
              : null);

          // Fallback to s.sellerName if present
          if (!sellerKey && s.sellerName) {
            sellerKey = s.sellerName.trim();
          }
          if (!sellerKey) {
            sellerKey = "unknown";
          }

          // Generate a display name
          let displayName =
            sellerKey === "unknown"
              ? "Unknown Seller"
              : getFullName(sellerObject, "Unknown Seller");

          if (sellerKey === s.sellerName) {
            displayName = s.sellerName;
          }

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

        // Top 3 Most Profitable Products
        const purchasePriceMap = {};
        purchasesData.forEach((p) => {
          if (!purchasePriceMap[p.productId]) {
            purchasePriceMap[p.productId] = { total: 0, qty: 0 };
          }
          purchasePriceMap[p.productId].total +=
            (p.purchasePrice || 0) * (p.quantity || 0);
          purchasePriceMap[p.productId].qty += p.quantity || 0;
        });
        const avgPurchasePrices = {};
        Object.keys(purchasePriceMap).forEach((pid) => {
          const data = purchasePriceMap[pid];
          avgPurchasePrices[pid] = data.qty > 0 ? data.total / data.qty : 0;
        });
        const productProfitMap = {};
        sellsData.forEach((s) => {
          const pid = s.productId;
          const profitPerUnit =
            (s.sellPrice || 0) - (avgPurchasePrices[pid] || 0);
          const profit = profitPerUnit * (s.quantity || 0);
          productProfitMap[pid] = (productProfitMap[pid] || 0) + profit;
        });
        const topProfitable = Object.entries(productProfitMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([pid, profit]) => ({
            productName:
              productsData.find((pr) => pr._id === pid)?.name ||
              "Unknown Product",
            profit,
          }));
        setTopProfitableProducts(topProfitable);

        /* -----------------------------------------------------------------------------------
         * TOP 3 PERSONS BY PROFIT
         * We'll compute each seller's total profit by subtracting the average purchase cost
         * for the product from the sell price, times quantity sold, aggregated by seller.
         ----------------------------------------------------------------------------------- */
        // 1) Build an average purchase price for each product
        const purchasePriceMap2 = {};
        purchasesData.forEach((p) => {
          if (!purchasePriceMap2[p.productId]) {
            purchasePriceMap2[p.productId] = { total: 0, qty: 0 };
          }
          purchasePriceMap2[p.productId].total +=
            (p.purchasePrice || 0) * (p.quantity || 0);
          purchasePriceMap2[p.productId].qty += p.quantity || 0;
        });
        const avgPricesByPid = {};
        Object.keys(purchasePriceMap2).forEach((pid) => {
          const data = purchasePriceMap2[pid];
          avgPricesByPid[pid] = data.qty > 0 ? data.total / data.qty : 0;
        });

        // 2) For each sell, figure out the profit
        //    Then accumulate by "sellerKey"
        const sellerProfitMap = {};
        sellsData.forEach((s) => {
          const sellerObject =
            s.sellerId && typeof s.sellerId === "object" ? s.sellerId : null;
          let sellerKey =
            sellerObject?._id ||
            (s.sellerId && typeof s.sellerId === "string"
              ? s.sellerId.toString()
              : null);

          // fallback if there's s.sellerName
          if (!sellerKey && s.sellerName) {
            sellerKey = s.sellerName.trim();
          }
          if (!sellerKey) sellerKey = "unknown";

          // Construct a display name
          let displayName =
            sellerKey === "unknown"
              ? "Unknown Seller"
              : getFullName(sellerObject, "Unknown Seller");

          if (sellerKey === s.sellerName) {
            displayName = s.sellerName;
          }

          // Compute profit
          const avgCost = avgPricesByPid[s.productId] || 0;
          const revenue = (s.sellPrice || 0) * (s.quantity || 0);
          const cost = avgCost * (s.quantity || 0);
          const netProfit = revenue - cost;

          // Accumulate in sellerProfitMap
          if (!sellerProfitMap[sellerKey]) {
            sellerProfitMap[sellerKey] = {
              name: displayName,
              totalProfit: 0,
            };
          }
          sellerProfitMap[sellerKey].totalProfit += netProfit;
        });

        // Sort the sellers by totalProfit descending
        const sortedProfitSellers = Object.entries(sellerProfitMap).sort(
          (a, b) => b[1].totalProfit - a[1].totalProfit
        );

        // Take top 3
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

  // Determine which chart data to display based on the selected chart view.
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

  // Options for the PIE chart: show percentage in dataLabels, show values in legend
  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value, context) => {
          // Calculate percentage
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
                // Money: 2 decimals + $
                formatted = "$" + formatNumber(Number(rawValue).toFixed(2));
              }
              // Otherwise just the raw integer for product counts
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

  // Options for the BAR chart: dataLabels show numeric or money accordingly
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
            // 2 decimals + $
            return (
              "$" +
              Number(value)
                .toFixed(2)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            );
          }
          // just raw integer for product chart
          return value;
        },
      },
    },
  };

  return (
    <div className="p-4 mx-auto max-w-7xl">
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
                    {" "}
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
                    {" "}
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

        {/* Top 3 Buyers (by name) */}
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

        {/* Top 3 Sellers (by name) */}
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

        {/* NEW: Top 3 Persons with Highest Profit */}
        <div className="p-4 bg-white rounded shadow">
          <h2 className="mb-2 text-2xl font-semibold">
            Top 3 Persons with Highest Profit
          </h2>
          <ul className="ml-4 text-gray-700 list-disc">
            {topProfitByPersons.map((person, idx) => (
              <li key={idx} className="flex items-center">
                {/* Left side: a fixed width for the name */}
                <span className="inline-block font-bold w-28 text-violet-700">
                  {toTitleCase(person.name)}
                </span>

                {/* The arrow: aligned after name */}
                <span className="inline-block w-6 text-center">▶︎</span>

                {/* The profit: right-aligned to the remainder */}
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
