import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/categories");
        console.log("Fetched categories from API:", response.data.data);

        // Filter and sort only the specified categories alphabetically
        const allowedCategories = [
          "Accessories",
          "Beauty",
          "Clothes",
          "Electronics",
          "Home Appliances",
          "Shoes",
          "Tools",
        ];
        const filteredCategories = response.data.data
          .filter((category) => allowedCategories.includes(category.name))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(filteredCategories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
        setError("Error fetching categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading)
    return (
      <div className="mt-10 text-xl text-center">Loading categories...</div>
    );
  if (error)
    return <div className="mt-10 text-center text-red-500">{error}</div>;

  // Darker background colors for better readability
  const categoryColors = [
    "bg-red-700",
    "bg-green-700",
    "bg-blue-700",
    "bg-yellow-700",
    "bg-purple-700",
    "bg-pink-700",
    "bg-teal-700",
  ];

  // Descriptions for specified categories
  const categoryDescriptions = {
    Accessories: "Complete your look with stylish and functional accessories.",
    Beauty: "Enhance your natural beauty with premium skincare and cosmetics.",
    Clothes: "Stay fashionable with a curated collection of stylish clothing.",
    Electronics:
      "Discover cutting-edge technology and devices to elevate your daily life.",
    Home_Appliances:
      "Upgrade your home with modern and efficient appliances for every task.",
    Shoes: "Find the perfect pair of shoes for every occasion and style.",
    Tools: "Equip yourself with reliable tools for every project and need.",
  };

  return (
    <div className="max-w-6xl p-4 mx-auto mt-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Categories</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 text-white transition bg-blue-500 rounded-lg shadow hover:bg-blue-600"
        >
          ➤ Dashboard
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <div
            key={category._id}
            className={`p-6 ${categoryColors[index % categoryColors.length]} text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <h2 className="mb-2 text-2xl font-semibold">{category.name}</h2>
            <p>
              {categoryDescriptions[category.name] ||
                "Explore this exciting category and all it has to offer!"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
