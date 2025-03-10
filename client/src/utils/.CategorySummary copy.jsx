/********************************************************************************************
 * FILE: src/pages/CategorySummary.jsx
 * This component fetches real data for categories and products. When a category card is
 * clicked, it computes a summary (total products, total money spent, total money gained,
 * profit, top sold product, top purchased product, and top 3 most profitable products)
 * from the already‑fetched products data and displays that summary in a modal.
 ********************************************************************************************/

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";

// Mapping of category names to background colors.
const categoryColors = [
  "bg-red-700",
  "bg-green-700",
  "bg-blue-700",
  "bg-yellow-700",
  "bg-purple-700",
  "bg-pink-700",
  "bg-teal-700",
];

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

/* ===========================================================================
   computeCategorySummary
   Computes summary information for a given category from the products array.
   It computes:
     - Total number of products in the category.
     - Total money spent (cost × soldCount).
     - Total money gained (price × soldCount).
     - Profit (gained - spent).
     - Top sold product (by soldCount).
     - Top purchased product (by purchaseCount).
     - Top 3 most profitable products (by (price - cost) * soldCount).
============================================================================ */
const computeCategorySummary = (categoryName, productsArray) => {
  // Filter products that belong to the given category name.
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

function CategorySummary() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySummary, setCategorySummary] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch categories and products from API.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catResp, prodResp] = await Promise.all([
          apiClient.get("/categories?limit=0"),
          apiClient.get("/products?limit=0"),
        ]);
        // For categories, filter to allowed list
        const allowedCategories = [
          "Accessories",
          "Beauty",
          "Clothes",
          "Electronics",
          "Home Appliances",
          "Shoes",
          "Tools",
        ];
        const cats = (catResp.data.data || [])
          .filter((cat) => allowedCategories.includes(cat.name))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCategories(cats);
        setProducts(prodResp.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories or products:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // When a category card is clicked, compute its summary from the products data.
  const handleCategoryClick = (category) => {
    const summary = computeCategorySummary(category.name, products);
    setCategorySummary(summary);
    setSelectedCategory(category);
    setSummaryModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setCategorySummary(null);
    setSummaryModalOpen(false);
  };

  if (loading)
    return <div className="mt-10 text-xl text-center">Loading data...</div>;
  if (error)
    return <div className="mt-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl p-4 mx-auto mt-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Categories</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
        >
          ➤ Dashboard
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, index) => (
          <div
            key={cat._id}
            onClick={() => handleCategoryClick(cat)}
            className={`p-6 cursor-pointer ${categoryColors[index % categoryColors.length]} text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <h2 className="mb-2 text-2xl font-semibold">{cat.name}</h2>
            <p>
              {/* You can include a description here if desired */}
              {cat.description ||
                "Explore this category and all it has to offer."}
            </p>
          </div>
        ))}
      </div>

      {/* Category Summary Modal */}
      <Transition appear show={summaryModalOpen} as="div">
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
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
                    {selectedCategory.name} Summary
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
                      onClick={closeModal}
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
    </div>
  );
}

export default CategorySummary;
