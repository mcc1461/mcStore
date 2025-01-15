import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaSearch } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";

export default function BrandsList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBrandForDelete, setSelectedBrandForDelete] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for showing search input in mobile view

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default items per page
  const [cardsPerRow, setCardsPerRow] = useState(1); // Cards that fit per row

  // Navigate to Dashboard
  const navigate = useNavigate();

  // Card dimension constants
  const CARD_WIDTH = 300; // Width of a card
  const CARD_HEIGHT = 320; // Height of a card

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get("/brands?limit=-1&page=1");
        setBrands(response.data.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching brands");
        setLoading(false);
      }
    };

    fetchBrands();
    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);

    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, []);

  // Navigate to Dashboard
  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  // Function to calculate itemsPerPage based on window size
  const calculateItemsPerPage = () => {
    const containerWidth = window.innerWidth - 64; // Subtracting padding/margins
    const containerHeight = window.innerHeight - 200; // Subtracting header/pagination height

    // Cards per row
    const cardsPerRow = Math.floor(containerWidth / CARD_WIDTH);
    setCardsPerRow(cardsPerRow);

    // Rows per page based on available height
    const rowsPerPage = Math.floor(containerHeight / CARD_HEIGHT);

    // Total items per page
    const totalItemsPerPage = cardsPerRow * rowsPerPage;
    setItemsPerPage(totalItemsPerPage > 0 ? totalItemsPerPage : 1); // Ensure at least 1 item
  };

  const confirmDeleteBrand = (brand) => {
    setSelectedBrandForDelete(brand);
    setConfirmOpen(true); // Open the confirm dialog
  };

  const deleteBrand = async () => {
    try {
      await apiClient.delete(`/brands/${selectedBrandForDelete._id}`);
      setBrands(
        brands.filter((brand) => brand._id !== selectedBrandForDelete._id)
      ); // Remove deleted brand
      setConfirmOpen(false); // Close confirm modal
    } catch (error) {
      console.error("Error deleting the brand:", error);
    }
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setIsAddingNewBrand(false); // Ensure it's not in "Add New" mode
    setModalOpen(true); // Open the modal
  };

  const openAddNewModal = () => {
    setEditingBrand({ name: "", image: "" }); // Empty form for new brand
    setIsAddingNewBrand(true); // Switch to "Add New" mode
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBrand(null);
  };

  const saveBrandDetails = async () => {
    try {
      if (isAddingNewBrand) {
        const response = await apiClient.post("/brands", editingBrand);
        setBrands((prevBrands) => [...prevBrands, response.data.data]);
      } else {
        await apiClient.put(`/api/brands/${editingBrand._id}`, editingBrand);
        setBrands((prevBrands) =>
          prevBrands.map((brand) =>
            brand._id === editingBrand._id ? editingBrand : brand
          )
        );
      }
      closeModal();
    } catch (error) {
      console.error("Error saving the brand:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBrand((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredBrands = brands.filter((brand) =>
    brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastBrand = currentPage * itemsPerPage;
  const indexOfFirstBrand = indexOfLastBrand - itemsPerPage;
  const currentBrands = filteredBrands.slice(
    indexOfFirstBrand,
    indexOfLastBrand
  );
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (loading) {
    return <p>Loading brands...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 bg-blue-500 shadow-md">
        {/* Title Section */}
        <div className="flex items-center justify-between px-4 py-4 text-white">
          <h1 className="text-3xl font-bold">
            Brands ({filteredBrands.length})
          </h1>
        </div>

        {/* Search and Add Button Section */}
        <div className="flex items-center justify-between px-4 py-2 bg-blue-500">
          {/* Search Input and Icon */}
          <div className="flex items-center space-x-4">
            {/* Full search input for larger screens */}
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`hidden md:block w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200 ${
                isSearchOpen ? "block" : "hidden"
              }`}
            />

            {/* Magnifying glass icon for smaller screens */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)} // Toggle the search input
              className="text-white md:hidden"
            >
              <FaSearch size={24} />
            </button>

            {/* Conditionally show search input on small screens */}
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-4 py-2 border rounded-lg md:hidden focus:ring focus:ring-indigo-200"
              />
            )}
          </div>
          <button
            onClick={navigateToDashboard}
            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:!text-custom-yellow md:flex hover:bg-blue-700"
          >
            ➤ Dashboard
          </button>
          {/* Add New Button */}
          <div className="flex items-center space-x-4">
            {/* Full button for larger screens */}
            <button
              onClick={openAddNewModal}
              className="hidden px-4 py-2 text-white bg-green-500 rounded-lg md:flex hover:bg-green-600"
            >
              <FaPlusCircle className="inline-block mr-2" /> Add New Brand
            </button>

            {/* Plus icon for smaller screens */}
            <button onClick={openAddNewModal} className="text-white md:hidden">
              <FaPlusCircle size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Brands List */}
      {currentBrands.length > 0 ? (
        <div
          className="grid gap-6 px-4 py-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, 1fr))`, // Use `auto-fill` for responsive layout
            gridAutoRows: `${CARD_HEIGHT}px`, // Ensure consistent card height
            gap: "1rem", // Ensure consistent spacing between cards
            minHeight: "calc(100vh - 200px)", // Ensure the cards fill the screen
          }}
        >
          {currentBrands.map((brand) => (
            <div
              key={brand._id}
              className="overflow-hidden transition-transform duration-300 transform bg-gray-100 rounded-lg shadow-lg hover:scale-105"
            >
              {/* Logo */}
              <div className="flex items-center justify-center h-56 bg-white">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="object-contain w-full h-full p-4"
                />
              </div>
              <div className="p-6 text-center">
                {/* Display Brand Name */}
                <h3 className="text-2xl font-semibold text-gray-800">
                  {brand.name}
                </h3>
              </div>

              {/* Edit and Delete Icons */}
              <div className="flex justify-center p-4">
                <button
                  className="mr-3 text-blue-500 hover:text-blue-700"
                  onClick={() => openEditModal(brand)} // Open modal to edit brand
                >
                  <FaEdit className="w-5 h-5" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => confirmDeleteBrand(brand)} // Ask for confirmation before deleting
                >
                  <FaTrashAlt className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No brands found for your search.
        </p>
      )}

      {/* Pagination */}
      <div className="sticky bottom-0 left-0 w-full py-4 bg-white border-t">
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between px-4 sm:px-6"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstBrand + 1}</span> to{" "}
              <span className="font-medium">
                {indexOfLastBrand > filteredBrands.length
                  ? filteredBrands.length
                  : indexOfLastBrand}
              </span>{" "}
              of <span className="font-medium">{filteredBrands.length}</span>{" "}
              results
            </p>
          </div>
          <div className="flex justify-between flex-1 sm:justify-end">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-gray-900 bg-white rounded-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
              Next
            </button>
          </div>
        </nav>
      </div>

      {/* Modal for Editing or Adding Brand */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg shadow-lg w-96">
            <h2 className="mb-4 text-2xl font-bold">
              {isAddingNewBrand ? "Add New Brand" : "Edit Brand"}
            </h2>

            {/* Logo Section */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">Logo</label>
              <div className="flex items-center justify-center mb-4">
                <img
                  src={editingBrand?.image}
                  alt={editingBrand?.name}
                  className="object-contain w-full h-32"
                />
              </div>
              <input
                type="text"
                name="image"
                value={editingBrand?.image || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter logo URL"
              />
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={editingBrand?.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
              />
            </div>

            {/* Save and Cancel Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={saveBrandDetails}
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
        </div>
      )}

      {/* Confirm Delete Modal */}
      <Transition show={confirmOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setConfirmOpen(false)}
        >
          <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
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

              <div className="flex justify-end mt-4 space-x-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteBrand}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
