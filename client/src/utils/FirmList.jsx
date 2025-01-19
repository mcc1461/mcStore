import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaSearch } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import defaultUser from "../assets/default-profile.png";

function FirmsList() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFirm, setEditingFirm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewFirm, setIsAddingNewFirm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFirmForDelete, setSelectedFirmForDelete] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Details Modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsFirm, setDetailsFirm] = useState(null);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Helper function to get firm id
  const getFirmId = (firm) => firm._id || firm.id;

  // -------------------------
  // FETCH FIRMS FUNCTION
  // -------------------------
  const fetchFirms = useCallback(async () => {
    try {
      const response = await apiClient.get("/firms?limit=100&page=1");
      const validFirms = response.data.data.filter((firm) => firm && firm._id);
      setFirms(validFirms);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching firms:", err);
      setError("Error fetching firms");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFirms();
  }, [fetchFirms]);

  // -------------------------
  // FILTER FIRMS BASED ON SEARCH
  // -------------------------
  const filteredFirms = firms.filter((firm) =>
    firm?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------
  // PAGINATION LOGIC
  // -------------------------
  const indexOfLastFirm = currentPage * itemsPerPage;
  const indexOfFirstFirm = indexOfLastFirm - itemsPerPage;
  const currentFirms = filteredFirms.slice(indexOfFirstFirm, indexOfLastFirm);
  const totalPages = Math.ceil(filteredFirms.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // -------------------------
  // NAVIGATION HANDLER
  // -------------------------
  const navigateToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  // -------------------------
  // MODAL HANDLERS
  // -------------------------
  const openAddNewModal = () => {
    setEditingFirm({ name: "", image: "", phone: "", address: "" });
    setIsAddingNewFirm(true);
    setModalOpen(true);
  };

  const openEditModal = (firm) => {
    setEditingFirm({ ...firm });
    setIsAddingNewFirm(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFirm(null);
  };

  const openDetailsModal = (firm) => {
    setDetailsFirm(firm);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setDetailsFirm(null);
  };

  // -------------------------
  // DELETE HANDLERS
  // -------------------------
  const confirmDeleteFirm = (firm) => {
    setSelectedFirmForDelete(firm);
    setConfirmOpen(true);
  };

  const deleteFirm = async () => {
    try {
      await apiClient.delete(`/firms/${selectedFirmForDelete._id}`);
      setFirms((prevFirms) =>
        prevFirms.filter((firm) => firm._id !== selectedFirmForDelete._id)
      );
      setConfirmOpen(false);
    } catch (err) {
      console.error("Error deleting the firm:", err);
    }
  };

  // -------------------------
  // SAVE (ADD/EDIT) HANDLER
  // -------------------------
  const saveFirmDetails = async () => {
    try {
      if (!editingFirm.name || !editingFirm.image) {
        alert("Name and logo URL are required.");
        return;
      }
      if (isAddingNewFirm) {
        await apiClient.post("/firms", editingFirm);
      } else {
        await apiClient.put(`/firms/${editingFirm._id}`, editingFirm);
      }
      await fetchFirms();
      closeModal();
    } catch (err) {
      console.error(
        "Error saving the firm:",
        err.response?.data || err.message || err
      );
    }
  };

  // -------------------------
  // INPUT HANDLER
  // -------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingFirm((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------
  // RENDERING
  // -------------------------
  if (loading) {
    return <p className="mt-8 text-xl text-center">Loading firms...</p>;
  }

  if (error) {
    return <p className="mt-8 text-xl text-center text-red-500">{error}</p>;
  }

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-blue-500 shadow-md">
        <div className="flex items-center justify-between px-4 py-4 text-white">
          <h1 className="text-3xl font-bold">Firms ({filteredFirms.length})</h1>
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-blue-500">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search firms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hidden w-full px-4 py-2 text-black border rounded-lg md:block focus:ring focus:ring-indigo-200"
            />
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white md:hidden"
            >
              <FaSearch size={24} />
            </button>
          </div>
          <button
            onClick={navigateToDashboard}
            className="flex items-center px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            ➤ Dashboard
          </button>
          <button
            onClick={openAddNewModal}
            className="flex items-center hidden px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 md:flex"
          >
            <FaPlusCircle className="inline-block mr-2" /> Add New Firm
          </button>
          <button onClick={openAddNewModal} className="text-white md:hidden">
            <FaPlusCircle size={24} />
          </button>
        </div>
        {isSearchOpen && (
          <div className="px-4 pb-2 md:hidden">
            <input
              type="text"
              placeholder="Search firms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-black border rounded-lg focus:ring focus:ring-indigo-200"
            />
          </div>
        )}
      </header>

      {/* Firms List as Responsive Grid */}
      <main className="p-4">
        {filteredFirms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentFirms.map((firm) =>
              firm && firm._id ? (
                <div
                  key={firm._id}
                  className="overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-lg hover:shadow-2xl"
                >
                  {/* Clickable area to open details modal */}
                  <div
                    className="cursor-pointer"
                    onClick={() => openDetailsModal(firm)}
                  >
                    <div className="flex items-center justify-center h-48 bg-gray-100">
                      <img
                        src={firm.image}
                        alt={firm.name}
                        className="object-contain w-32 h-32 mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = defaultUser;
                        }}
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {firm.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-around p-4 border-t">
                    <button
                      onClick={() => openDetailsModal(firm)}
                      className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openEditModal(firm)}
                      className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    {userInfo?.role === "admin" && (
                      <button
                        onClick={() => confirmDeleteFirm(firm)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <FaTrashAlt className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="mt-8 text-center text-gray-600">
            No firms found for your search.
          </p>
        )}
      </main>

      {/* Fixed Full-Width Pagination Footer */}
      <div className="fixed bottom-0 left-0 flex items-center w-full h-16 bg-white border-t">
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between w-full px-4 sm:px-6"
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

      {/* Modal: Add/Edit Firm */}
      <Transition appear show={modalOpen} as={React.Fragment}>
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
              {editingFirm && (
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900">
                    {isAddingNewFirm ? "Add New Firm" : "Edit Firm"}
                  </Dialog.Title>
                  <div className="mt-4">
                    {/* Logo Section */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-semibold">
                        Logo
                      </label>
                      <div className="flex items-center justify-center mb-4">
                        <img
                          src={editingFirm?.image || defaultUser}
                          alt={editingFirm?.name || "Default Logo"}
                          className="object-contain w-24 h-24"
                          onError={(e) => {
                            e.currentTarget.src = defaultUser;
                          }}
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
                    {/* Name Section */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-semibold">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingFirm?.name || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                        placeholder="Enter firm name"
                      />
                    </div>
                    {/* Phone Section */}
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-semibold">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={editingFirm?.phone || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                        placeholder="Enter firm phone"
                      />
                    </div>
                    {/* Address Section */}
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
                        placeholder="Enter firm address"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 space-x-4">
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
              )}
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Confirm Delete Modal */}
      <Transition appear show={confirmOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setConfirmOpen(false)}
        >
          <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
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
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
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
              {selectedFirmForDelete && (
                <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="mb-4 text-2xl font-bold text-gray-900">
                    Confirm Deletion
                  </Dialog.Title>
                  <p className="text-gray-600">
                    Are you sure you want to delete{" "}
                    <strong>{selectedFirmForDelete.name}</strong>? This action
                    is permanent.
                  </p>
                  <div className="flex justify-end mt-6 space-x-4">
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
              )}
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Details Modal */}
      <Transition appear show={detailsModalOpen} as={React.Fragment}>
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
              {detailsFirm && (
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                  <Dialog.Title className="mb-4 text-2xl font-bold text-gray-900">
                    {detailsFirm.name}
                  </Dialog.Title>
                  <div className="space-y-3">
                    <img
                      src={detailsFirm.image}
                      alt={detailsFirm.name}
                      className="object-contain w-full h-48"
                      onError={(e) => {
                        e.currentTarget.src = defaultUser;
                      }}
                    />
                    <p className="text-gray-600">
                      <span className="font-semibold">Name:</span>{" "}
                      {detailsFirm.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Phone:</span>{" "}
                      {detailsFirm.phone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Address:</span>{" "}
                      {detailsFirm.address}
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

export default FirmsList;
