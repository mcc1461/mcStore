import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import { computeCategorySummary, parseNumber } from "../utils/categoryUtils";
import { formatCurrency } from "./..formatCurrency";

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

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sells, setSells] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For the summary modal.
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [categorySummary, setCategorySummary] = useState(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const navigate = useNavigate();

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
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block w-full max-w-md p-6 my-8 text-left transition-all transform bg-white rounded-lg shadow-xl">
              <Dialog.Title className="text-xl font-bold">
                {selectedCategoryName} Summary
              </Dialog.Title>
              {categorySummary ? (
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Number of Products:</strong>{" "}
                    {categorySummary.productCount}
                  </p>
                  <p>
                    <strong>Total Money Spent:</strong>
                    {formatCurrency(
                      parseNumber(categorySummary.totalMoneySpent)
                    )}
                  </p>
                  <p>
                    <strong>Total Money Gained:</strong>
                    {formatCurrency(
                      parseNumber(categorySummary.totalMoneyGained)
                    )}
                  </p>
                  <p>
                    <strong>Profit:</strong> $
                    {formatCurrency(parseNumber(categorySummary.profit))}
                  </p>
                  <p>
                    <strong>Most Profitable Products:</strong>
                  </p>
                  <ul className="ml-4 list-disc">
                    {categorySummary.profitableProducts.map((prod, idx) => (
                      <li key={idx}>
                        <div>{prod.name}</div>
                        <div>(Profit: {formatCurrency(prod.profit)})</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-4">
                  <p>No summary available.</p>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default CategoryList;
