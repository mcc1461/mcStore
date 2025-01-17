import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaSearch } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import defaultUser from "../assets/default-profile.png";

export default function ProductsList() {
  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [filterStockStatus, setFilterStockStatus] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modal states for add/edit and details
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState(null);

  // Confirm deletion modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Fixed items per page

  const navigate = useNavigate();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/products?limit=100&page=1");
        const fetchedProducts = response.data.data;
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error fetching products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Compute total counts (for stock summary)
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity < 5
  ).length;
  const availableCount = totalProducts - outOfStockCount - lowStockCount;

  // Build filter options (prepend "all" so that filters are not applied by default)
  const allCategories = [
    "all",
    ...new Set(products.map((p) => p.categoryId?.name)),
  ];

  // Filter brands based on selected category
  const allBrands = [
    "all",
    ...new Set(
      products
        .filter(
          (product) =>
            selectedCategory === "all" ||
            product.categoryId?.name === selectedCategory
        )
        .map((product) => product.brandId?.name)
    ),
  ];

  // Apply filtering on the products array
  const filteredProducts = products
    .filter((product) =>
      selectedCategory === "all"
        ? true
        : product.categoryId?.name === selectedCategory
    )
    .filter((product) =>
      selectedBrand === "all" ? true : product.brandId?.name === selectedBrand
    )
    .filter((product) => {
      if (filterStockStatus === "all") return true;
      if (filterStockStatus === "low")
        return product.quantity > 0 && product.quantity < 5;
      if (filterStockStatus === "available") return product.quantity >= 5;
      if (filterStockStatus === "out") return product.quantity === 0;
      return true;
    })
    .filter((product) =>
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Pagination logic
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset current page if any filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, filterStockStatus, searchTerm]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const navigateToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  // Open Details Modal (read-only view)
  const openDetailsModal = (product) => {
    setDetailsProduct(product);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setDetailsProduct(null);
  };

  // Open Add/Edit Modal handlers
  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsAddingNewProduct(false);
    setModalOpen(true);
  };

  const openAddNewModal = () => {
    setEditingProduct({
      name: "",
      brandId: "",
      categoryId: "",
      quantity: 0,
      price: 0,
      image: "",
      image2: "",
    });
    setIsAddingNewProduct(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const saveProductDetails = async () => {
    try {
      if (isAddingNewProduct) {
        const response = await apiClient.post("/products", editingProduct);
        setProducts([...products, response.data]);
      } else {
        await apiClient.put(`/products/${editingProduct._id}`, editingProduct);
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === editingProduct._id ? editingProduct : product
          )
        );
      }
      closeModal();
    } catch (error) {
      console.error("Error saving the product:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Confirm Delete Modal handler for products
  const confirmDeleteProduct = (product) => {
    setSelectedProductForDelete(product);
    setConfirmOpen(true);
  };

  const deleteProduct = async () => {
    try {
      await apiClient.delete(`/products/${selectedProductForDelete._id}`);
      setProducts(
        products.filter(
          (product) => product._id !== selectedProductForDelete._id
        )
      );
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting the product:", error);
    }
  };

  if (loading) {
    return <p className="mt-8 text-xl text-center">Loading products...</p>;
  }
  if (error) {
    return <p className="mt-8 text-xl text-center text-red-500">{error}</p>;
  }

  return (
    <>
      {/* Sticky Header */}
      <div className="fixed top-0 z-10 w-full bg-blue-500 shadow-md">
        <div className="flex items-center justify-between px-4 py-4 text-white">
          <h1 className="text-3xl font-bold">
            Products ({filteredProducts.length})
          </h1>
          <button
            onClick={navigateToDashboard}
            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            ➤ Dashboard
          </button>
        </div>
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Sidebar for Filters */}
        <aside className="fixed top-[4.5rem] left-0 w-1/4 h-[calc(100vh-4.5rem)] p-4 bg-gray-100 z-50 hidden sm:block">
          <h2 className="mb-4 text-xl font-bold">Filters</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {allCategories.map((category, idx) => (
                <option key={idx} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {allBrands.map((brand, idx) => (
                <option key={idx} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">Stock Status</label>
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">All Stock Levels</option>
              <option value="available">Available</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-bold">Stock Summary</h3>
            <p>Total Products: {totalProducts}</p>
            <p>Available: {availableCount}</p>
            <p>Low Stock: {lowStockCount}</p>
            <p>Out of Stock: {outOfStockCount}</p>
          </div>
        </aside>

        {/* Main Products Section */}
        <main className="w-full sm:w-3/4 ml-0 sm:ml-[25%] pt-[4.5rem] flex-1">
          <div className="fixed top-[4.5rem] w-full sm:w-[75%] z-50 flex items-center justify-between p-3 mb-4 bg-gray-100">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-white sm:hidden"
              >
                <FaSearch size={24} className="text-blue-500" />
              </button>
              {isSearchOpen && (
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-4 py-2 text-black border rounded-lg sm:hidden focus:ring focus:ring-indigo-200"
                />
              )}
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="hidden w-full px-4 py-2 text-black border rounded-lg sm:block focus:ring focus:ring-indigo-200"
              />
            </div>
            <button
              onClick={openAddNewModal}
              className="hidden px-4 py-2 text-white bg-green-500 rounded-lg sm:flex hover:bg-green-600"
            >
              <FaPlusCircle className="inline-block mr-2" /> Add New Product
            </button>
            <button onClick={openAddNewModal} className="text-white sm:hidden">
              <FaPlusCircle size={24} className="text-green-500" />
            </button>
          </div>

          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 p-4 mt-20 sm:grid-cols-2 lg:grid-cols-3">
              {currentProducts.map((product) => {
                // Determine stock level tag text and color
                let stockLabel = "";
                let stockClasses = "";
                if (product.quantity === 0) {
                  stockLabel = "Out of Stock";
                  stockClasses = "bg-red-100 text-red-600";
                } else if (product.quantity > 0 && product.quantity < 5) {
                  stockLabel = "Low Stock";
                  stockClasses = "bg-yellow-100 text-yellow-600";
                } else {
                  stockLabel = "In Stock";
                  stockClasses = "bg-green-100 text-green-600";
                }
                return (
                  <div
                    key={product._id}
                    className="relative p-4 transition-transform duration-300 transform rounded-lg shadow-md hover:scale-105"
                  >
                    {/* Stock Level Tag */}
                    <div className="absolute z-10 top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${stockClasses}`}
                      >
                        {stockLabel}
                      </span>
                    </div>
                    {/* Product Card - Clicking opens Details Modal */}
                    <div
                      className="cursor-pointer"
                      onClick={() => openDetailsModal(product)}
                    >
                      <div className="flex items-center justify-center h-48 bg-white">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="object-contain w-full h-full p-4"
                          onError={(e) => {
                            e.currentTarget.src = defaultUser;
                          }}
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="overflow-hidden text-lg font-semibold whitespace-nowrap text-ellipsis">
                          {product.name}
                        </h3>
                        <p className="text-gray-600">Price: ${product.price}</p>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => openDetailsModal(product)}
                        className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
                      >
                        Details
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => confirmDeleteProduct(product)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <FaTrashAlt className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-center text-gray-600">
              No products found for your search.
            </p>
          )}

          {/* Pagination */}
          <div className="w-full py-4 bg-white border-t">
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between px-4 sm:px-6"
            >
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstProduct + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {indexOfLastProduct > filteredProducts.length
                      ? filteredProducts.length
                      : indexOfLastProduct}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  results
                </p>
              </div>
              <div className="flex justify-between flex-1 sm:justify-end">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </nav>
          </div>
        </main>
      </div>
    </>
  );
}
