/********************************************************************************************
 * FILE: src/pages/Overview.jsx
 * This file displays an outstanding dashboard overview with charts, aggregated summaries,
 * filters, and a new feature: clicking on a category row shows a detailed category summary.
 ********************************************************************************************/

import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Dialog, Transition } from "@headlessui/react";
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

// Mapping of category names to colors.
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

// Helper to format numbers.
function formatNumber(num) {
  const absVal = Math.abs(num);
  if (absVal < 1000) return Math.floor(num);
  if (absVal < 1_000_000) return Math.floor(num / 1000) + "k";
  return Math.floor(num / 1_000_000) + "M";
}

// Helper to convert a string to title case.
function toTitleCase(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Helper to build Pie chart data.
function getChartData(labels, values) {
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((label) => categoryColors[label] || "#000"),
        hoverBackgroundColor: labels.map(
          (label) => categoryColors[label] || "#000"
        ),
      },
    ],
  };
}

// Helper to build Bar chart data.
function getBarChartData(labels, values) {
  return {
    labels,
    datasets: [
      {
        label: "Value",
        data: values,
        backgroundColor: labels.map((label) => categoryColors[label] || "#000"),
        borderColor: labels.map((label) => categoryColors[label] || "#000"),
        borderWidth: 1,
      },
    ],
  };
}

/* =====================================================================
   NEW: Helper Function to Compute Category Summary from Existing Products
   Computes:
    - Total products
    - Total money spent (cost × soldCount)
    - Total money gained (price × soldCount)
    - Profit (gained - spent)
    - Top sold product (by soldCount)
    - Top purchased product (by purchaseCount)
    - Top 3 most profitable products (by (price - cost) * soldCount)
===================================================================== */
const computeCategorySummary = (categoryName, productsArray) => {
  // Filter products that belong to the specified category.
  const filteredProducts = productsArray.filter((prod) => {
    let catName = "Unknown Category";
    if (
      prod.categoryId &&
      typeof prod.categoryId === "object" &&
      prod.categoryId.name
    ) {
      catName = prod.categoryId.name;
    } else if (prod.category) {
      catName = prod.category;
    }
    return catName === categoryName;
  });

  const productCount = filteredProducts.length;
  const totalMoneySpent = filteredProducts.reduce(
    (sum, prod) => sum + prod.cost * (prod.soldCount || 0),
    0
  );
  const totalMoneyGained = filteredProducts.reduce(
    (sum, prod) => sum + prod.price * (prod.soldCount || 0),
    0
  );
  const profit = totalMoneyGained - totalMoneySpent;
  const topSoldProduct = filteredProducts.sort(
    (a, b) => (b.soldCount || 0) - (a.soldCount || 0)
  )[0];
  const topPurchasedProduct = filteredProducts.sort(
    (a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0)
  )[0];
  const profitableProducts = [...filteredProducts]
    .sort(
      (a, b) =>
        (b.price - b.cost) * (b.soldCount || 0) -
        (a.price - a.cost) * (a.soldCount || 0)
    )
    .slice(0, 3);

  return {
    categoryName,
    productCount,
    totalMoneySpent,
    totalMoneyGained,
    profit,
    topSoldProduct: topSoldProduct
      ? { name: topSoldProduct.name, soldCount: topSoldProduct.soldCount }
      : null,
    topPurchasedProduct: topPurchasedProduct
      ? {
          name: topPurchasedProduct.name,
          purchaseCount: topPurchasedProduct.purchaseCount,
        }
      : null,
    profitableProducts,
  };
};

function Overview() {
  // =====================
  // Existing state variables.
  // =====================
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart selection state.
  const [selectedChartView, setSelectedChartView] = useState("Products");
  const [selectedChartType, setSelectedChartType] = useState("Pie");

  // Aggregated chart data states.
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

  // =====================
  // New: State for Category Summary Modal.
  // =====================
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySummary, setCategorySummary] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  // =====================
  // Data fetching: products, purchases, sells, etc.
  // =====================
  useEffect(() => {
    async function fetchAggregates() {
      try {
        setLoading(true);
        const [prodResp, purchResp, sellResp] = await Promise.all([
          apiClient.get("/products?limit=0&page=1"),
          apiClient.get("/purchases?limit=0"),
          apiClient.get("/sells?limit=0"),
        ]);
        const prods = prodResp.data.data || [];
        const purch = purchResp.data.data || [];
        const sellsData = sellResp.data.data || [];
        setProducts(prods);
        setPurchases(purch);
        setSells(sellsData);

        // Aggregate products by category for the Products chart.
        const prodCounts = {};
        prods.forEach((prod) => {
          let catName = "Unknown Category";
          if (
            prod.categoryId &&
            typeof prod.categoryId === "object" &&
            prod.categoryId.name
          ) {
            catName = prod.categoryId.name;
          } else if (prod.category) {
            catName = prod.category;
          }
          prodCounts[catName] = (prodCounts[catName] || 0) + 1;
        });
        const pLabels = Object.keys(prodCounts);
        const pValues = Object.values(prodCounts);
        setProductChartData({ labels: pLabels, values: pValues });

        // (Assume similar aggregation for purchaseChartData and sellChartData if needed.)
        // For simplicity, we leave them empty in this example.
        setLoading(false);
      } catch (err) {
        console.error("Error fetching aggregated data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    }
    fetchAggregates();
  }, []);

  // =====================
  // New: Handler for Category Row Click to compute summary using products data.
  // =====================
  const handleCategoryRowClick = (categoryName) => {
    const summary = computeCategorySummary(categoryName, products);
    setCategorySummary(summary);
    setSelectedCategory(categoryName);
    setSummaryModalOpen(true);
  };

  // =====================
  // Chart Data Selection (existing logic)
  // =====================
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

  // =====================
  // Chart Options (unchanged)
  // =====================
  const pieOptions = {
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value, context) => {
          const dataset = context.dataset.data;
          const total = dataset.reduce((acc, val) => acc + val, 0);
          return total > 0 ? ((value / total) * 100).toFixed(2) + "%" : "0%";
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

  // =====================
  // Render JSX
  // =====================
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
              <tr
                key={label}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleCategoryRowClick(label)}
              >
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

      {/* Category Summary Modal */}
      <Transition appear show={summaryModalOpen} as="div">
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setSummaryModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {categorySummary && (
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="text-xl font-bold">
                    {selectedCategory} Summary
                  </Dialog.Title>
                  <div className="mt-4 space-y-2">
                    <p>
                      <strong>Total Products:</strong>{" "}
                      {categorySummary.productCount}
                    </p>
                    <p>
                      <strong>Total Money Spent:</strong> $
                      {Number(categorySummary.totalMoneySpent).toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Money Gained:</strong> $
                      {Number(categorySummary.totalMoneyGained).toFixed(2)}
                    </p>
                    <p>
                      <strong>Profit:</strong> $
                      {Number(categorySummary.profit).toFixed(2)}
                    </p>
                    <p>
                      <strong>Top Sold Product:</strong>{" "}
                      {categorySummary.topSoldProduct
                        ? `${categorySummary.topSoldProduct.name} (${categorySummary.topSoldProduct.soldCount})`
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Top Purchased Product:</strong>{" "}
                      {categorySummary.topPurchasedProduct
                        ? `${categorySummary.topPurchasedProduct.name} (${categorySummary.topPurchasedProduct.purchaseCount})`
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Most Profitable Products:</strong>
                    </p>
                    <ul className="ml-4 list-disc">
                      {categorySummary.profitableProducts.map((prod, idx) => (
                        <li key={idx}>
                          {prod.name} (Profit: $
                          {((prod.price - prod.cost) * prod.soldCount).toFixed(
                            2
                          )}
                          )
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setSummaryModalOpen(false)}
                      className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* =====================================================================
          Additional Overview Content: Purchases Summary and Sells Summary Tables
      ===================================================================== */}
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
                  ${Number(purchaseChartData.values[idx]).toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="px-2 py-1 border">Grand Total</td>
              <td className="px-2 py-1 pr-5 text-right border">
                $
                {Number(
                  purchaseChartData.values.reduce((a, b) => a + b, 0)
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
                  ${Number(sellChartData.values[idx]).toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="px-2 py-1 border">Grand Total</td>
              <td className="px-2 py-1 pr-5 text-right border">
                $
                {Number(
                  sellChartData.values.reduce((a, b) => a + b, 0)
                ).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* You may include additional sections (like top products, top buyers, etc.) here as needed */}

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
