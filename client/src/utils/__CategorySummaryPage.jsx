/********************************************************************************************
 * FILE: src/pages/CategorySummaryPage.jsx
 * This component fetches categories, products, purchases, sells, and users.
 * It displays allowed categories as clickable cards. When a card is clicked, it computes
 * a detailed summary (money spent, money gained, profit, top sold/purchased products,
 * big buyer, big seller, best profit person, etc.) from the fetched data and displays that
 * summary in a modal.
 ********************************************************************************************/

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";

// Define background colors for category cards.
const categoryCardColors = [
  "bg-red-700",
  "bg-green-700",
  "bg-blue-700",
  "bg-yellow-700",
  "bg-purple-700",
  "bg-pink-700",
  "bg-teal-700",
];

// Helper to get a product's category name.
function getProductCategoryName(prod) {
  if (
    prod.categoryId &&
    typeof prod.categoryId === "object" &&
    prod.categoryId.name
  ) {
    return prod.categoryId.name;
  } else if (prod.category) {
    return prod.category;
  }
  return "Unknown Category";
}

// Helper to get a product's name from an array by its _id.
function getProductName(products, productId) {
  const found = products.find((p) => p._id === productId);
  return found ? found.name : "Unknown Product";
}

// Helper to get a user's display name from an array by its _id.
// (Only defined once)
function getUserName(users, userId) {
  if (!userId) return "Unknown Person";
  const found = users.find((u) => u._id === userId);
  if (!found) return "Unknown Person";
  if (found.firstName || found.lastName) {
    return (
      `${found.firstName || ""} ${found.lastName || ""}`.trim() ||
      found.username
    );
  }
  return found.username || "Unknown Person";
}

/* ===========================================================================
   computeCategorySummary
   Computes detailed summary information for a given category using:
     - products: array of product objects.
     - purchases: array of purchase objects.
     - sells: array of sell objects.
     - users: array of user objects.
     
   Returns an object with:
     - productCount
     - totalMoneySpent (from purchases)
     - totalMoneyGained (from sells)
     - profit
     - topSoldProduct { name, soldCount }
     - topPurchasedProduct { name, purchaseCount }
     - profitableProducts: top 3 (by (price - cost) * total sold)
     - bigBuyer: { name, totalSpent }
     - bigSeller: { name, totalSold }
     - bestProfitPerson: { name, profit }
============================================================================ */
function computeCategorySummary(
  categoryName,
  products,
  purchases,
  sells,
  users
) {
  // 1) Filter products in the given category.
  const filteredProducts = products.filter(
    (prod) => getProductCategoryName(prod) === categoryName
  );
  const productCount = filteredProducts.length;
  const filteredProductIds = filteredProducts.map((p) => p._id);

  // 2) Filter purchases and sells for these products.
  const categoryPurchases = purchases.filter((p) =>
    filteredProductIds.includes(p.productId)
  );
  const categorySells = sells.filter((s) =>
    filteredProductIds.includes(s.productId)
  );

  // 3) Compute total money spent from purchases.
  const totalMoneySpent = categoryPurchases.reduce(
    (sum, p) => sum + (p.purchasePrice || 0) * (p.quantity || 0),
    0
  );
  // 4) Compute total money gained from sells.
  const totalMoneyGained = categorySells.reduce(
    (sum, s) => sum + (s.sellPrice || 0) * (s.quantity || 0),
    0
  );
  // const profit = totalMoneyGained - totalMoneySpent;
  const profit = profitableProducts.reduce(
    (sum, prod) => sum + parseNumber(prod.profit),
    0
  );

  // 5) Top sold product (by total quantity sold).
  const productSoldMap = {};
  categorySells.forEach((s) => {
    productSoldMap[s.productId] =
      (productSoldMap[s.productId] || 0) + (s.quantity || 0);
  });
  let topSoldId = null;
  let topSoldCount = 0;
  Object.entries(productSoldMap).forEach(([pid, qty]) => {
    if (qty > topSoldCount) {
      topSoldCount = qty;
      topSoldId = pid;
    }
  });
  const topSoldProduct = topSoldId
    ? { name: getProductName(products, topSoldId), soldCount: topSoldCount }
    : null;

  // 6) Top purchased product (by total quantity purchased).
  const productPurchasedMap = {};
  categoryPurchases.forEach((p) => {
    productPurchasedMap[p.productId] =
      (productPurchasedMap[p.productId] || 0) + (p.quantity || 0);
  });
  let topPurchasedId = null;
  let topPurchasedCount = 0;
  Object.entries(productPurchasedMap).forEach(([pid, qty]) => {
    if (qty > topPurchasedCount) {
      topPurchasedCount = qty;
      topPurchasedId = pid;
    }
  });
  const topPurchasedProduct = topPurchasedId
    ? {
        name: getProductName(products, topPurchasedId),
        purchaseCount: topPurchasedCount,
      }
    : null;

  // 7) Top 3 most profitable products.
  const profitableProducts = filteredProducts.map((prod) => {
    const totalSold = categorySells
      .filter((s) => s.productId === prod._id)
      .reduce((acc, s) => acc + (s.quantity || 0), 0);
    const productProfit = (prod.price - prod.cost) * totalSold;
    return { name: prod.name, profit: productProfit };
  });
  profitableProducts.sort((a, b) => b.profit - a.profit);
  const top3Profitable = profitableProducts.slice(0, 3);

  // 8) Big Buyer: the buyer who spent the most in this category.
  const buyerMap = {};
  categoryPurchases.forEach((p) => {
    const buyerId = p.buyerId && (p.buyerId._id || p.buyerId);
    if (!buyerId) return;
    buyerMap[buyerId] =
      (buyerMap[buyerId] || 0) + (p.purchasePrice || 0) * (p.quantity || 0);
  });
  let bigBuyerId = null;
  let bigBuyerSpent = 0;
  Object.entries(buyerMap).forEach(([bid, spent]) => {
    if (spent > bigBuyerSpent) {
      bigBuyerSpent = spent;
      bigBuyerId = bid;
    }
  });
  const bigBuyer = bigBuyerId
    ? { name: getUserName(users, bigBuyerId), totalSpent: bigBuyerSpent }
    : null;

  // 9) Big Seller: the seller who sold the most in this category.
  const sellerMap = {};
  categorySells.forEach((s) => {
    const sellerId = s.sellerId && (s.sellerId._id || s.sellerId);
    if (!sellerId) return;
    sellerMap[sellerId] =
      (sellerMap[sellerId] || 0) + (s.sellPrice || 0) * (s.quantity || 0);
  });
  let bigSellerId = null;
  let bigSellerAmount = 0;
  Object.entries(sellerMap).forEach(([sid, sold]) => {
    if (sold > bigSellerAmount) {
      bigSellerAmount = sold;
      bigSellerId = sid;
    }
  });
  const bigSeller = bigSellerId
    ? { name: getUserName(users, bigSellerId), totalSold: bigSellerAmount }
    : null;

  // 10) Best Profit Person: the seller with the highest net profit.
  const profitMap = {};
  categorySells.forEach((s) => {
    const sellerId = s.sellerId && (s.sellerId._id || s.sellerId);
    if (!sellerId) return;
    const prod = products.find((p) => p._id === s.productId);
    if (!prod) return;
    const netProfit = ((s.sellPrice || 0) - prod.cost) * (s.quantity || 0);
    profitMap[sellerId] = (profitMap[sellerId] || 0) + netProfit;
  });
  let bestProfitSellerId = null;
  let bestProfitAmount = 0;
  Object.entries(profitMap).forEach(([sid, prof]) => {
    if (prof > bestProfitAmount) {
      bestProfitAmount = prof;
      bestProfitSellerId = sid;
    }
  });
  const bestProfitPerson = bestProfitSellerId
    ? { name: getUserName(users, bestProfitSellerId), profit: bestProfitAmount }
    : null;

  return {
    productCount,
    totalMoneySpent,
    totalMoneyGained,
    profit,
    topSoldProduct,
    topPurchasedProduct,
    profitableProducts: top3Profitable,
    bigBuyer,
    bigSeller,
    bestProfitPerson,
  };
}

function CategorySummaryPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sells, setSells] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for summary modal.
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categorySummary, setCategorySummary] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch all data from the API.
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [catResp, prodResp, purchResp, sellResp, userResp] =
          await Promise.all([
            apiClient.get("/categories?limit=0"),
            apiClient.get("/products?limit=0"),
            apiClient.get("/purchases?limit=0"),
            apiClient.get("/sells?limit=0"),
            apiClient.get("/users?limit=0"),
          ]);

        // Allowed categories.
        const allowedCategories = [
          "Accessories",
          "Beauty",
          "Clothes",
          "Electronics",
          "Home Appliances",
          "Shoes",
          "Tools",
        ];
        const fetchedCategories = (catResp.data.data || [])
          .filter((cat) => allowedCategories.includes(cat.name))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(fetchedCategories);
        setProducts(prodResp.data.data || []);
        setPurchases(purchResp.data.data || []);
        setSells(sellResp.data.data || []);
        setUsers(userResp.data.data || []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handler: when a category card is clicked, compute its summary.
  const handleCategoryClick = (category) => {
    const summary = computeCategorySummary(
      category.name,
      products,
      purchases,
      sells,
      users
    );
    setCategorySummary(summary);
    setSelectedCategoryName(category.name);
    setSummaryModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCategoryName("");
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
            className={`p-6 cursor-pointer ${categoryCardColors[index % categoryCardColors.length]} text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <h2 className="mb-2 text-2xl font-semibold">{cat.name}</h2>
            <p>
              {cat.description ||
                "Explore this category and all it has to offer."}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Modal */}
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
                <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="text-xl font-bold">
                    {selectedCategoryName} Summary
                  </Dialog.Title>
                  <div className="mt-4 space-y-2">
                    <p>
                      <strong>Total Products:</strong>{" "}
                      {categorySummary.productCount}
                    </p>
                    <p>
                      <strong>Total Money Spent:</strong> $
                      {categorySummary.totalMoneySpent.toFixed(2)}
                    </p>
                    <p>
                      <strong>Total Money Gained:</strong> $
                      {categorySummary.totalMoneyGained.toFixed(2)}
                    </p>
                    <p>
                      <strong>Profit:</strong> $
                      {categorySummary.profit.toFixed(2)}
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
                      <strong>Most Profitable Products *****:</strong>
                    </p>
                    <ul className="ml-4 list-disc">
                      {categorySummary.profitableProducts.map((p, idx) => (
                        <li key={idx}>
                          {p.name} (Profit: ${p.profit.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>Big Buyer:</strong>{" "}
                      {categorySummary.bigBuyer
                        ? `${categorySummary.bigBuyer.name} ($${categorySummary.bigBuyer.totalSpent.toFixed(2)})`
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Big Seller:</strong>{" "}
                      {categorySummary.bigSeller
                        ? `${categorySummary.bigSeller.name} ($${categorySummary.bigSeller.totalSold.toFixed(2)})`
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Best Profit Person:</strong>{" "}
                      {categorySummary.bestProfitPerson
                        ? `${categorySummary.bestProfitPerson.name} ($${categorySummary.bestProfitPerson.profit.toFixed(2)})`
                        : "N/A"}
                    </p>
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

export default CategorySummaryPage;
