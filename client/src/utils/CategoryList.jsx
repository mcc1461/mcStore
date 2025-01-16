import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch up to 7 categories
        const response = await apiClient.get("/categories?limit=7&page=1");
        setCategories(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching categories");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    // Navigate to a route that shows products for this category.
    // For example, you might define a route like /categories/:categoryId/products.
    navigate(`/categories/${categoryId}/products`);
  };

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <ul className="space-y-4">
        {categories.map((category) => (
          <li key={category._id}>
            <button
              onClick={() => handleCategoryClick(category._id)}
              className="text-xl text-blue-600 hover:underline focus:outline-none"
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
