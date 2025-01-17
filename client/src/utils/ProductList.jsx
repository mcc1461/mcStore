import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaSearch } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import ConfirmDialog from "./ProductListConfirm"; // Optional; remove if not needed
import defaultUser from "../assets/default-profile.png";

// --- Base Dimensions & Layout Constants ---
const HEADER_HEIGHT = 50; // Header height in pixels
const FOOTER_HEIGHT = 50; // Footer height in pixels
const BASE_CARD_WIDTH = 250; // Base card width (px) – adjust as needed
const BASE_CARD_HEIGHT = 280; // Base card height (px) – adjust as needed

export default function ProductsList() {
  // Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedFirm, setSelectedFirm] = useState("all");
  const [filterStockStatus, setFilterStockStatus] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Modal States for Add/Edit and Details
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState(null);

  // Confirm Deletion Modal State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState(null);

  // Pagination & Grid Layout State
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState(1);
  const [rows, setRows] = useState(1);
  const [cardWidth, setCardWidth] = useState(BASE_CARD_WIDTH);
  const [cardHeight, setCardHeight] = useState(BASE_CARD_HEIGHT);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [gridHeight, setGridHeight] = useState(0);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // --- Helper: Calculate available columns based on viewport width ---
  const calculateColumns = () => {
    const isSm = window.innerWidth >= 640;
    // When sidebar is visible, assume it occupies 25% of width
    const availableWidth = isSm ? window.innerWidth * 0.75 : window.innerWidth;
    const cols = Math.floor(availableWidth / BASE_CARD_WIDTH);
    return cols > 0 ? cols : 1;
  };

  // --- Helper: Calculate the grid layout using fixed available space ---
  const calculateGridLayout = () => {
    // Calculate columns from available width:
    const cols = calculateColumns();
    setColumns(cols);

    // Calculate available height for the grid (viewport minus header and footer)
    const availableHeight = window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT;

    // Calculate how many rows can fully fit using the base card height.
    // We use Math.floor so that we do not show any partial row.
    const computedRows = Math.floor(availableHeight / BASE_CARD_HEIGHT);
    setRows(computedRows > 0 ? computedRows : 1);

    // Option 1: Keep card dimensions fixed (use BASE_CARD_WIDTH, BASE_CARD_HEIGHT)
    // and set the grid container height to rows*BASE_CARD_HEIGHT.
    // Option 2: Scale cards to fill exactly the available grid area.
    // Here we choose Option 2:
    const newCardHeight =
      availableHeight / (computedRows > 0 ? computedRows : 1);
    setCardHeight(newCardHeight);
    // For width, available width per column:
    const isSm = window.innerWidth >= 640;
    const availableWidth = isSm ? window.innerWidth * 0.75 : window.innerWidth;
    const newCardWidth = availableWidth / cols;
    setCardWidth(newCardWidth);

    const computedItemsPerPage = cols * (computedRows > 0 ? computedRows : 1);
    setItemsPerPage(computedItemsPerPage);
    setGridHeight(computedRows * newCardHeight);
  };

  // --- Fetch products and calculate grid layout on mount and on resize ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch a high limit to retrieve all products (e.g., 100)
        const response = await apiClient.get("/products?limit=100&page=1");
        const fetchedProducts = response.data.data;
        console.log("Total products fetched:", fetchedProducts.length);
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error fetching products");
        setLoading(false);
      }
    };
    fetchProducts();
    calculateGridLayout();
    window.addEventListener("resize", calculateGridLayout);
    return () => window.removeEventListener("resize", calculateGridLayout);
  }, []);

  // --- Summary counts for Sidebar ---
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity < 5
  ).length;
  const availableCount = totalProducts - outOfStockCount - lowStockCount;

  // --- Build filter options (prepend "all") ---
  const allCategories = [
    "all",
    ...new Set(products.map((p) => p.categoryId?.name)),
  ];
  const allBrands = ["all", ...new Set(products.map((p) => p.brandId?.name))];
  const allFirms = ["all", ...new Set(products.map((p) => p.firmId?.name))];

  // --- Apply filtering ---
  const filteredProducts = products
    .filter((product) =>
      selectedCategory === "all"
        ? true
        : product.categoryId?.name === selectedCategory
    )
    .filter((product) =>
      selectedBrand === "all" ? true : product.brandId?.name === selectedBrand
    )
    .filter((product) =>
      selectedFirm === "all" ? true : product.firmId?.name === selectedFirm
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

  console.log("Filtered products count:", filteredProducts.length);

  // --- Pagination calculations ---
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // When filters/search change, reset to page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedBrand,
    selectedFirm,
    filterStockStatus,
    searchTerm,
  ]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const navigateToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  // --- Modal Handlers ---
  const openDetailsModal = (product) => {
    setDetailsProduct(product);
    setDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setDetailsProduct(null);
  };
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
      firmId: "",
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

  // --- Confirm Deletion Handlers ---
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

  // --- Helper: Pad current page's products with placeholders so total cell count equals itemsPerPage ---
  function paddedProducts() {
    const pageProducts = filteredProducts.slice(
      indexOfFirstProduct,
      indexOfLastProduct
    );
    const countToFill = itemsPerPage - pageProducts.length;
    return [...pageProducts, ...new Array(countToFill).fill(null)];
  }

  if (loading) {
    return <p className="mt-8 text-xl text-center">Loading products...</p>;
  }
  if (error) {
    return <p className="mt-8 text-xl text-center text-red-500">{error}</p>;
  }

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 z-10 w-full bg-blue-500 shadow-md">
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
      </header>

      <div className="flex">
        {/* Sidebar for Filters */}
        <aside className="fixed top-[50px] left-0 w-1/4 p-4 bg-gray-100 z-50 hidden sm:block">
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
            <label className="block text-sm font-semibold">Firm</label>
            <select
              value={selectedFirm}
              onChange={(e) => setSelectedFirm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {allFirms.map((firm, idx) => (
                <option key={idx} value={firm}>
                  {firm}
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
        <main className="w-full sm:w-3/4 ml-0 sm:ml-[25%] pt-[50px] pb-[50px]">
          {/* Top Bar for Search & Add */}
          <div className="fixed top-[50px] w-full sm:w-[75%] z-50 flex items-center justify-between p-3 bg-gray-100">
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

          {/* Products Grid Container with fixed height */}
          <div className="p-4 mt-20" style={{ height: `${gridHeight}px` }}>
            {paddedProducts().length > 0 ? (
              <div
                className="grid h-full gap-6"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {paddedProducts().map((item, idx) =>
                  item ? (
                    <div
                      key={item._id}
                      className="relative overflow-hidden transition-transform duration-300 transform rounded-lg shadow-md hover:scale-105"
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                      }}
                    >
                      {/* Stock Level Tag */}
                      <div className="absolute z-10 top-2 left-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            item.quantity === 0
                              ? "bg-red-100 text-red-600"
                              : item.quantity > 0 && item.quantity < 5
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
                          }`}
                        >
                          {item.quantity === 0
                            ? "Out of Stock"
                            : item.quantity > 0 && item.quantity < 5
                              ? "Low Stock"
                              : "In Stock"}
                        </span>
                      </div>
                      {/* Product Card – clicking opens Details Modal */}
                      <div
                        className="cursor-pointer"
                        onClick={() => openDetailsModal(item)}
                      >
                        <div
                          className="flex items-center justify-center bg-white"
                          style={{ height: "70%" }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-contain w-full h-full p-4"
                            onError={(e) => {
                              e.currentTarget.src = defaultUser;
                            }}
                          />
                        </div>
                        <div
                          className="p-2 text-center"
                          style={{ height: "30%" }}
                        >
                          <h3 className="overflow-hidden text-lg font-semibold whitespace-nowrap text-ellipsis">
                            {item.name}
                          </h3>
                          <p className="text-gray-600">Price: ${item.price}</p>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex justify-between px-2 pb-2">
                        <button
                          onClick={() => openDetailsModal(item)}
                          className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
                        >
                          Details
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          {userInfo?.role === "admin" && (
                            <button
                              onClick={() => confirmDeleteProduct(item)}
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                            >
                              <FaTrashAlt className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Empty placeholder cell
                    <div
                      key={idx}
                      className="border border-gray-300 border-dashed rounded-lg"
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                      }}
                    ></div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-8 text-center text-gray-600">
                No products found for your search.
              </p>
            )}
          </div>
        </main>
      </div>

      {/* Footer with Pagination Controls (fixed at bottom) */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
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
              className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </footer>

      {/* Modal for Editing or Adding Product */}
      <Transition appear show={modalOpen} as={React.Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50" onClose={closeModal}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
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
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900">
                  {isAddingNewProduct ? "Add New Product" : "Edit Product"}
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingProduct?.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={editingProduct?.price || 0}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={editingProduct?.quantity || 0}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Category
                    </label>
                    <input
                      type="text"
                      name="categoryId"
                      value={editingProduct?.categoryId || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brandId"
                      value={editingProduct?.brandId || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Firm
                    </label>
                    <input
                      type="text"
                      name="firmId"
                      value={editingProduct?.firmId || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Image
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={editingProduct?.image || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Additional Image
                    </label>
                    <input
                      type="text"
                      name="image2"
                      value={editingProduct?.image2 || ""}
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
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Details Modal */}
      <Transition appear show={detailsModalOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50"
          onClose={closeDetailsModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={React.Fragment}
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
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900">
                  Brand Details
                </Dialog.Title>
                {detailsProduct ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={detailsProduct.image}
                        alt={detailsProduct.name}
                        className="object-contain w-32 h-32"
                        onError={(e) => {
                          e.currentTarget.src = defaultUser;
                        }}
                      />
                    </div>
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {detailsProduct.name}
                    </p>
                    {detailsProduct.description ? (
                      <p>
                        <span className="font-semibold">Description:</span>{" "}
                        {detailsProduct.description}
                      </p>
                    ) : (
                      <p>
                        <span className="font-semibold">Description:</span> No
                        description provided.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4">No details available.</p>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={closeDetailsModal}
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Confirm Delete Modal */}
      <Transition appear show={confirmOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50"
          onClose={() => setConfirmOpen(false)}
        >
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <Dialog.Title className="text-2xl font-bold text-gray-800">
                Confirm Deletion
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600">
                Are you sure you want to delete this brand? This action cannot
                be undone.
              </Dialog.Description>
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProduct()}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Optional: Render ConfirmDialog component if you use it */}
      <ConfirmDialog
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        deleteProduct={deleteProduct}
      />
    </>
  );
}
