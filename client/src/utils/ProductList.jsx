import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaSearch } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import defaultUser from "../assets/default-profile.png";

export default function ProductsList() {
  // --------------------------------------------------
  // 1) USER ROLE FROM LOCALSTORAGE
  // --------------------------------------------------
  const savedUser = localStorage.getItem("userInfo");
  const initialRole = savedUser ? JSON.parse(savedUser).role : "user";
  // This sets the userRole to whatever is in localStorage, or "user" if none found
  const [userRole, setUserRole] = useState(initialRole);

  // For color-coding the top bar by role
  const roleColors = {
    admin: "bg-red-500",
    staff: "bg-yellow-500",
    user: "bg-green-500",
  };

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  // --------------------------------------------------
  // STATE: Data & UI
  // --------------------------------------------------
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [filterStockStatus, setFilterStockStatus] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Brands & Categories (for dropdowns, filter, etc.)
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);

  // The product state used in Add or Edit forms
  const [editingProduct, setEditingProduct] = useState(null);

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState(null);

  // Delete Confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // --------------------------------------------------
  // HELPER FUNCTIONS
  // --------------------------------------------------
  function getProductId(prod) {
    return prod._id || prod.id;
  }

  function resolveCategoryName(catId) {
    if (!catId) return "";
    const found = categories.find((c) => c._id === catId);
    return found ? found.name : catId;
  }

  function resolveBrandName(brandId) {
    if (!brandId) return "";
    const found = brands.find((b) => b._id === brandId);
    return found ? b.name : brandId;
  }

  // --------------------------------------------------
  // FETCH PRODUCTS
  // --------------------------------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get("/products?limit=100&page=1");
        setProducts(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error fetching products");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --------------------------------------------------
  // FETCH BRANDS & CATEGORIES
  // --------------------------------------------------
  const fetchBrands = async () => {
    try {
      const response = await apiClient.get("/brands?limit=0");
      const sortedBrands = response.data.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setBrands(sortedBrands || []);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories?limit=0");
      const sortedCategories = response.data.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCategories(sortedCategories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  // --------------------------------------------------
  // SIDEBAR FILTER DROPDOWN OPTIONS
  // --------------------------------------------------
  const allCategoriesForFilter = [
    "all",
    ...categories.map((c) => c.name).sort(),
  ];

  const filteredBrandsForSidebar =
    selectedCategory === "all"
      ? ["all", ...brands.map((b) => b.name).sort()]
      : [
          "all",
          ...Array.from(
            new Set(
              products
                .filter(
                  (p) => resolveCategoryName(p.categoryId) === selectedCategory
                )
                .map((p) => resolveBrandName(p.brandId))
            )
          ).sort(),
        ];

  // --------------------------------------------------
  // STOCK SUMMARY
  // --------------------------------------------------
  const totalProducts = products.length;

  // 0 => Out of Stock, 1–4 => Low Stock, 5+ => Available
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity < 5
  ).length;
  const availableCount = products.filter((p) => p.quantity >= 5).length;

  // --------------------------------------------------
  // FILTER PRODUCTS (Listing)
  // --------------------------------------------------
  const filteredProducts = products
    .filter((product) =>
      selectedCategory === "all"
        ? true
        : resolveCategoryName(product.categoryId) === selectedCategory
    )
    .filter((product) =>
      selectedBrand === "all"
        ? true
        : resolveBrandName(product.brandId) === selectedBrand
    )
    .filter((product) => {
      if (filterStockStatus === "all") return true;
      if (filterStockStatus === "low") {
        // 1–4 => “Low Stock”
        return product.quantity > 0 && product.quantity < 5;
      }
      if (filterStockStatus === "available") {
        // 5+ => “Available”
        return product.quantity >= 5;
      }
      if (filterStockStatus === "out") {
        // 0 => “Out of Stock”
        return product.quantity === 0;
      }
      return true;
    })
    // search by product name
    .filter((product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, filterStockStatus, searchTerm]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // --------------------------------------------------
  // ADD / EDIT PRODUCT MODAL
  // --------------------------------------------------
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

  const openEditModal = (product) => {
    const prod = { ...product };

    if (prod.brandId && typeof prod.brandId === "object") {
      prod.brandId = prod.brandId._id;
    } else if (typeof prod.brandId === "string" && prod.brandId.length !== 24) {
      const foundBrand = brands.find((b) => b.name === prod.brandId);
      if (foundBrand) prod.brandId = foundBrand._id;
    }

    if (prod.categoryId && typeof prod.categoryId === "object") {
      prod.categoryId = prod.categoryId._id;
    } else if (
      typeof prod.categoryId === "string" &&
      prod.categoryId.length !== 24
    ) {
      const foundCategory = categories.find((c) => c.name === prod.categoryId);
      if (foundCategory) prod.categoryId = foundCategory._id;
    }

    setEditingProduct(prod);
    setIsAddingNewProduct(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  // --------------------------------------------------
  // DETAILS MODAL
  // --------------------------------------------------
  const openDetailsModal = (product) => {
    const prod = { ...product };
    prod.brandName = resolveBrandName(prod.brandId);
    prod.categoryName = resolveCategoryName(prod.categoryId);
    setDetailsProduct(prod);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setDetailsProduct(null);
  };

  // --------------------------------------------------
  // SAVE (ADD/EDIT) PRODUCT
  // --------------------------------------------------
  const saveProductDetails = async () => {
    try {
      const payload = { ...editingProduct };

      // Convert to Number & clamp
      payload.quantity = Number(payload.quantity);
      if (payload.quantity < 0) payload.quantity = 0;

      payload.price = Number(payload.price);
      if (payload.price < 0) payload.price = 0;

      if (!payload.brandId) {
        alert("Please select a brand. It must be predefined.");
        return;
      }
      if (!payload.categoryId) {
        alert("Please select a category. It must be predefined.");
        return;
      }

      if (isAddingNewProduct) {
        const response = await apiClient.post("/products", payload);
        const createdProd = response.data.data;
        if (createdProd) {
          setProducts((prev) => [...prev, createdProd]);
          fetchBrands();
          fetchCategories();
        }
      } else {
        const productId = getProductId(payload);
        const response = await apiClient.put(`/products/${productId}`, payload);
        const updatedProd = response.data.new;
        if (updatedProd) {
          setProducts((prev) =>
            prev.map((p) =>
              getProductId(p) === getProductId(updatedProd) ? updatedProd : p
            )
          );
          fetchBrands();
          fetchCategories();
        }
      }

      closeModal();
    } catch (err) {
      console.error(">>> Error saving the product:", err.response?.data || err);
    }
  };

  // --------------------------------------------------
  // INPUT HANDLER
  // --------------------------------------------------
  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if ((name === "quantity" || name === "price") && value !== "") {
      const numVal = parseFloat(value);
      if (numVal < 0) {
        value = "0";
      }
    }

    setEditingProduct((prev) => ({ ...prev, [name]: value }));
  };

  // --------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------
  const confirmDeleteProduct = (product) => {
    setSelectedProductForDelete(product);
    setConfirmOpen(true);
  };

  const deleteProduct = async () => {
    if (!selectedProductForDelete) return;
    const productId = getProductId(selectedProductForDelete);
    try {
      await apiClient.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => getProductId(p) !== productId));
      setConfirmOpen(false);
    } catch (err) {
      console.error(">>> Error deleting the product:", err);
    }
  };

  // --------------------------------------------------
  // CONDITIONAL RENDERS
  // --------------------------------------------------
  if (loading) {
    return <p className="mt-8 text-xl text-center">Loading products...</p>;
  }
  if (error) {
    return <p className="mt-8 text-xl text-center text-red-500">{error}</p>;
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <>
      {/* Sticky Header with color-coded role */}
      <div
        className={`fixed top-0 z-10 w-full shadow-md ${roleColors[userRole]}`}
      >
        <div className="flex items-center justify-between px-4 py-4 text-white">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">
              Products ({filteredProducts.length})
            </h1>
            {/* Label to show user role */}
            <span className="px-2 py-1 text-sm font-medium text-black bg-white rounded">
              {userRole.toUpperCase()}
            </span>
          </div>
          <button
            onClick={navigateToDashboard}
            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            ➤ Dashboard
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar for Filters */}
        <aside className="fixed top-[4.5rem] left-0 w-1/4 h-[calc(100vh-4.5rem)] p-4 bg-gray-100 z-50 hidden sm:block">
          <h2 className="mb-4 text-xl font-bold">Filters</h2>
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {allCategoriesForFilter.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {filteredBrandsForSidebar.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          {/* Stock Status Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold">Stock Status</label>
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock (1-4)</option>
              <option value="available">Available (5+)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>
          {/* Stock Summary */}
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-bold">Stock Summary</h3>
            <p>Total Products: {totalProducts}</p>
            <p>Out of Stock (0): {outOfStockCount}</p>
            <p>Low Stock (1-4): {lowStockCount}</p>
            <p>Available (5+): {availableCount}</p>
          </div>
          {/* Products Summary */}
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-bold">Products Summary</h3>
            <p>
              {filteredProducts.length === 0
                ? "There is no product."
                : filteredProducts.length === 1
                  ? "There is 1 product."
                  : `There are ${filteredProducts.length} products.`}
            </p>
          </div>
        </aside>

        {/* Main Products Section */}
        <main className="w-full sm:w-3/4 ml-0 sm:ml-[25%] pt-[4.5rem] pb-20">
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
            {/* "Add New Product" only for staff & admin */}
            {(userRole === "staff" || userRole === "admin") && (
              <>
                <button
                  onClick={openAddNewModal}
                  className="hidden px-4 py-2 text-white bg-green-500 rounded-lg sm:flex hover:bg-green-600"
                >
                  <FaPlusCircle className="inline-block mr-2" /> Add New Product
                </button>
                <button
                  onClick={openAddNewModal}
                  className="text-white sm:hidden"
                >
                  <FaPlusCircle size={24} className="text-green-500" />
                </button>
              </>
            )}
          </div>

          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 p-4 mt-20 sm:grid-cols-2 lg:grid-cols-3">
              {currentProducts.map((product) => {
                const qty = product.quantity || 0;
                let stockLabel = "";
                let stockClasses = "";

                if (qty === 0) {
                  stockLabel = "Out of Stock";
                  stockClasses = "bg-red-100 text-red-600";
                } else if (qty < 5) {
                  stockLabel = "Low Stock";
                  stockClasses = "bg-yellow-100 text-yellow-600";
                } else {
                  stockLabel = "Available";
                  stockClasses = "bg-green-100 text-green-600";
                }

                const productId = getProductId(product);
                return (
                  <div
                    key={productId}
                    className="relative p-4 transition-transform duration-300 transform rounded-lg shadow-md hover:scale-105"
                  >
                    <div className="absolute z-10 top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${stockClasses}`}
                      >
                        {stockLabel}
                      </span>
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => openDetailsModal(product)}
                    >
                      <div className="flex items-center justify-center h-56 bg-white">
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

                    {/* Actions (Details/Edit/Delete) */}
                    <div className="flex justify-between mt-2">
                      {/* Everyone can see Details */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailsModal(product);
                        }}
                        className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
                      >
                        Details
                      </button>

                      <div className="flex space-x-2">
                        {/* Edit only for staff or admin */}
                        {(userRole === "staff" || userRole === "admin") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(product);
                            }}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}

                        {/* Delete only for admin */}
                        {userRole === "admin" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteProduct(product);
                            }}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <FaTrashAlt className="w-5 h-5" />
                          </button>
                        )}
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
        </main>
      </div>

      {/* Pagination Footer */}
      <div className="fixed h-[4.5rem] bottom-0 left-0 w-full sm:ml-[25%] sm:w-[75%] bg-white border-t">
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between px-4 py-2 sm:px-6"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstProduct + 1}</span> to{" "}
              <span className="font-medium">
                {indexOfLastProduct > filteredProducts.length
                  ? filteredProducts.length
                  : indexOfLastProduct}
              </span>{" "}
              of <span className="font-medium">{filteredProducts.length}</span>{" "}
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

      {/* MODAL: Add/Edit Product */}
      <Transition appear show={modalOpen} as="div">
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as="div"
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
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {editingProduct && (
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900">
                    {isAddingNewProduct ? "Add New Product" : "Edit Product"}
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingProduct.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        onWheel={(e) => e.currentTarget.blur()}
                        value={editingProduct.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="0"
                        step="1"
                        onWheel={(e) => e.currentTarget.blur()}
                        value={editingProduct.quantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Category
                      </label>
                      <select
                        name="categoryId"
                        value={editingProduct.categoryId || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 overflow-y-auto border rounded-lg focus:ring focus:ring-indigo-200 max-h-64"
                      >
                        <option value="">Select a Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand Dropdown */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Brand
                      </label>
                      <select
                        name="brandId"
                        value={editingProduct.brandId || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 overflow-y-auto border rounded-lg focus:ring focus:ring-indigo-200 max-h-64"
                      >
                        <option value="">Select a Brand</option>
                        {brands.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Main Image */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Image
                      </label>
                      <input
                        type="text"
                        name="image"
                        value={editingProduct.image}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      />
                    </div>

                    {/* Additional Image */}
                    <div>
                      <label className="block mb-2 text-sm font-semibold">
                        Additional Image
                      </label>
                      <input
                        type="text"
                        name="image2"
                        value={editingProduct.image2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-4">
                    <button
                      onClick={saveProductDetails}
                      className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* DELETE CONFIRMATION MODAL */}
      <Transition appear show={confirmOpen} as="div">
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setConfirmOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as="div"
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
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {selectedProductForDelete && (
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="mb-4 text-2xl font-bold text-gray-900">
                    Confirm Deletion
                  </Dialog.Title>
                  <p className="text-gray-600">
                    Are you sure you want to delete{" "}
                    <strong>{selectedProductForDelete.name}</strong>? This
                    action is permanent.
                  </p>
                  <div className="flex justify-end mt-6 space-x-4">
                    <button
                      onClick={deleteProduct}
                      className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmOpen(false)}
                      className="px-4 py-2 text-white bg-gray-400 rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* DETAILS MODAL */}
      <Transition appear show={detailsModalOpen} as="div">
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeDetailsModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as="div"
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
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {detailsProduct && (
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="mb-4 text-2xl font-bold text-gray-900">
                    {detailsProduct.name}
                  </Dialog.Title>
                  <div className="space-y-3">
                    <img
                      src={detailsProduct.image}
                      alt={detailsProduct.name}
                      className="object-contain w-full h-48"
                      onError={(e) => {
                        e.currentTarget.src = defaultUser;
                      }}
                    />
                    <p className="text-gray-600">
                      Price: ${detailsProduct.price}
                    </p>
                    <p className="text-gray-600">
                      Quantity: {detailsProduct.quantity}
                    </p>
                    <p className="text-gray-600">
                      Category: {detailsProduct.categoryName}
                    </p>
                    <p className="text-gray-600">
                      Brand: {detailsProduct.brandName}
                    </p>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={closeDetailsModal}
                      className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
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
    </>
  );
}
