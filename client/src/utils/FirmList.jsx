import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaSearch } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient"; // Ensure the path is correct

export default function FirmsList() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFirm, setEditingFirm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewFirm, setIsAddingNewFirm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFirmForDelete, setSelectedFirmForDelete] = useState(null);
  const [expandedFirms, setExpandedFirms] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Toggle search for mobile view

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default items per page
  const [cardsPerRow, setCardsPerRow] = useState(1); // Cards that fit per row

  // Navigation
  const navigate = useNavigate();

  // Card dimension constants
  const CARD_HEIGHT = 320; // Height of a card
  const CARD_WIDTH = 300; // Width of a card

  // Calculate itemsPerPage based on window size
  const calculateItemsPerPage = () => {
    const containerWidth = window.innerWidth - 64; // Subtract margins/padding
    const containerHeight = window.innerHeight - 200; // Subtract header/pagination height

    // Cards per row (ensure at least 1 card per row)
    const cardsPerRow = Math.max(1, Math.floor(containerWidth / CARD_WIDTH));
    setCardsPerRow(cardsPerRow);

    // Rows per page (ensure at least 1 row per page)
    const rowsPerPage = Math.max(1, Math.floor(containerHeight / CARD_HEIGHT));

    // Update items per page
    const totalItemsPerPage = cardsPerRow * rowsPerPage;
    setItemsPerPage(totalItemsPerPage);
  };

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const response = await apiClient.get("/api/firms?limit=-1&page=1");
        setFirms(response.data.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching firms");
        setLoading(false);
      }
    };

    fetchFirms();
    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);

    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, []);

  const navigateToDashboard = () => {
    navigate("/dashboard", { replace: true }); // Use this to replace the current URL
  };

  const confirmDeleteFirm = (firm) => {
    setSelectedFirmForDelete(firm);
    setConfirmOpen(true);
  };

  const deleteFirm = async () => {
    try {
      await apiClient.delete(`/api/firms/${selectedFirmForDelete._id}`);
      setFirms((prevFirms) =>
        prevFirms.filter((firm) => firm._id !== selectedFirmForDelete._id)
      );
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting the firm:", error);
    }
  };

  const openEditModal = (firm) => {
    setEditingFirm(firm);
    setIsAddingNewFirm(false);
    setModalOpen(true);
    setFormError(null);
  };

  const openAddNewModal = () => {
    setEditingFirm({ name: "", image: "", phone: "", address: "" });
    setIsAddingNewFirm(true);
    setModalOpen(true);
    setFormError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFirm(null);
    setFormError(null);
  };

  const saveFirmDetails = async () => {
    try {
      if (!editingFirm.name || !editingFirm.image) {
        setFormError("Firm name and image are required.");
        return;
      }

      if (isAddingNewFirm) {
        const response = await apiClient.post("/api/firms", editingFirm);
        setFirms([...firms, response.data.data]);
      } else {
        const updateResponse = await apiClient.put(
          `/api/firms/${editingFirm._id}`,
          editingFirm
        );

        if (updateResponse.status === 202 || updateResponse.status === 200) {
          setFirms((prevFirms) =>
            prevFirms.map((firm) =>
              firm._id === editingFirm._id ? { ...editingFirm } : firm
            )
          );
        } else {
          throw new Error("Failed to update the firm.");
        }
      }

      closeModal();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Error saving the firm. Please try again."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingFirm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDetails = (id) => {
    setExpandedFirms((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const hideDetails = (id) => {
    setExpandedFirms((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const filteredFirms = firms.filter((firm) =>
    firm?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastFirm = currentPage * itemsPerPage;
  const indexOfFirstFirm = indexOfLastFirm - itemsPerPage;
  const currentFirms = filteredFirms.slice(indexOfFirstFirm, indexOfLastFirm);
  const totalPages = Math.ceil(filteredFirms.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (loading) {
    return <p>Loading firms...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-blue-500 shadow-md">
        <div className="flex items-center justify-between px-4 py-4 text-white">
          <h1 className="text-3xl font-bold">Firms ({filteredFirms.length})</h1>
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-blue-500">
          {/* Search Input for large screens */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search firms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`hidden md:block w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200 ${
                isSearchOpen ? "block" : "hidden"
              }`}
            />

            {/* Magnifying glass icon for mobile screens */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)} // Toggle search input for small screens
              className="text-white md:hidden"
            >
              <FaSearch size={24} />
            </button>

            {/* Conditionally show the search input on small screens */}
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search firms..."
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

          <button
            onClick={openAddNewModal}
            className="hidden px-4 py-2 text-white bg-green-500 rounded-lg md:flex hover:bg-green-600"
          >
            <FaPlusCircle className="inline-block mr-2" /> Add New Firm
          </button>

          {/* Plus icon for small screens */}
          <button onClick={openAddNewModal} className="text-white md:hidden">
            <FaPlusCircle size={24} />
          </button>
        </div>
      </div>

      {/* Firm Cards */}
      <div
        className="grid gap-6 px-4 py-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, 1fr))`, // Use `auto-fill` for responsive layout
          gridAutoRows: `${CARD_HEIGHT}px`, // Ensure consistent card height
          gap: "1rem", // Ensure consistent spacing between cards
          minHeight: "calc(100vh - 200px)", // Ensure the cards fill the screen
        }}
      >
        {currentFirms.map((firm) => (
          <div
            key={firm._id}
            className="overflow-hidden transition-transform duration-300 transform bg-gray-100 rounded-lg shadow-lg hover:scale-105"
            onMouseLeave={() => hideDetails(firm._id)}
          >
            <div
              className="flex items-center justify-center bg-white"
              style={{ height: "100%" }} // Allow the image to fill the card
            >
              <img
                src={firm.image}
                alt={firm.name}
                className="object-contain w-full h-full p-4"
              />
            </div>
            <div className="p-6 text-center">
              <button
                onClick={() => toggleDetails(firm._id)}
                className="font-semibold text-indigo-500 hover:text-indigo-600"
              >
                {expandedFirms[firm._id] ? "Hide Details" : "View Details"}
              </button>
              {expandedFirms[firm._id] && (
                <div className="mt-4">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {firm.name}
                  </h3>
                  <p className="text-gray-600">{firm.address}</p>
                  <p className="mt-4 font-medium text-gray-500">
                    Phone: {firm.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="sticky bottom-0 left-0 w-full py-4 bg-white border-t">
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between px-4 sm:px-6"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstFirm + 1}</span> to{" "}
              <span className="font-medium">
                {indexOfLastFirm > filteredFirms.length
                  ? filteredFirms.length
                  : indexOfLastFirm}
              </span>{" "}
              of <span className="font-medium">{filteredFirms.length}</span>{" "}
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

      {/* Modal for Editing or Adding Firm */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg shadow-lg w-96">
            <h2 className="mb-4 text-2xl font-bold">
              {isAddingNewFirm ? "Add New Firm" : "Edit Firm"}
            </h2>

            {formError && <p className="mb-4 text-red-500">{formError}</p>}

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">Logo</label>
              <div className="flex items-center justify-center mb-4">
                <img
                  src={editingFirm?.image}
                  alt={editingFirm?.name}
                  className="object-contain w-full h-32"
                />
              </div>
              <input
                type="text"
                name="image"
                value={editingFirm?.image || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                placeholder="Enter logo URL"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={editingFirm?.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">Phone</label>
              <input
                type="text"
                name="phone"
                value={editingFirm?.phone || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={editingFirm?.address || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={saveFirmDetails}
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
                Are you sure you want to delete this firm? This action cannot be
                undone.
              </Dialog.Description>

              <div className="flex justify-end mt-4 space-x-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteFirm}
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
