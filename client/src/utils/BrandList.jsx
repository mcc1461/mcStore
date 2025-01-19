import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaEdit, FaTrashAlt, FaPlusCircle, FaSearch } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient";
import defaultUser from "../assets/default-profile.png";

export default function BrandsList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states for add/edit
  const [editingBrand, setEditingBrand] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);

  // Modal state for details
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsBrand, setDetailsBrand] = useState(null);

  // Modal state for deletion confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBrandForDelete, setSelectedBrandForDelete] = useState(null);

  // Mobile search toggle state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fixed pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // fixed items per page

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get("/brands?limit=100&page=1");
        console.log("Fetched brands from API:", response.data.data);

        // Validate API response
        const isValidData = response.data.data.every(
          (brand) => brand && brand._id
        );
        if (!isValidData) {
          console.error("Invalid brand data detected:", response.data.data);
        }

        setBrands(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching brands:", error);
        setError("Error fetching brands");
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Filter brands based on search term.
  const filteredBrands = brands.filter((brand) =>
    brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extractUpdatedBrand = (response, key) => {
    try {
      console.log("Extracting updated brand from response:", response);

      const data = response?.data;
      if (!data) {
        console.error("Response data is missing:", response);
        return null;
      }

      // Extract the brand from `data.new` if key is 'updated'
      if (key === "updated" && data.new) {
        console.log(`Successfully extracted brand from key 'new':`, data.new);
        return data.new;
      }

      // Fallback to generic key extraction
      const brand = data[key];
      if (brand && typeof brand === "object" && brand._id) {
        console.log(`Successfully extracted brand from key '${key}':`, brand);
        return brand;
      }

      console.warn(
        `Brand not found or invalid under key '${key}'. Expected object with _id.`
      );
      console.log("Full response data:", data);
      return null;
    } catch (error) {
      console.error("Error extracting updated brand:", error);
      return null;
    }
  };

  // Pagination logic.
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

  // Navigation handler: go to Dashboard.
  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  // Open Details Modal to view all info about a brand.
  const openDetailsModal = (brand) => {
    setDetailsBrand(brand);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setDetailsBrand(null);
  };

  // Modal and deletion handlers.
  const confirmDeleteBrand = (brand) => {
    setSelectedBrandForDelete(brand);
    setConfirmOpen(true);
  };

  const deleteBrand = async () => {
    try {
      const brandId = selectedBrandForDelete._id;

      // Optimistic UI Update
      setBrands((prevBrands) =>
        prevBrands.filter((brand) => brand._id !== brandId)
      );

      // API Call
      await apiClient.delete(`/brands/${brandId}`);
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error deleting brand:", error);
      alert("Failed to delete brand. Reverting changes.");
      refetchBrands();
      // Revert UI Update
      setBrands((prevBrands) => [...prevBrands, selectedBrandForDelete]);
    }
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setIsAddingNewBrand(false);
    setModalOpen(true);
  };

  const openAddNewModal = () => {
    setEditingBrand({ name: "", image: "", description: "" });
    setIsAddingNewBrand(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBrand(null);
  };

  const refetchBrands = async () => {
    try {
      const response = await apiClient.get("/brands?limit=100&page=1");
      setBrands(response.data.data); // Update the state with fresh data
    } catch (error) {
      console.error("Error refetching brands:", error);
      setError("Failed to refresh brand list.");
    }
  };
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredBrands.length / itemsPerPage)
    );
    if (currentPage > totalPages) {
      setCurrentPage(totalPages); // Adjust to the last valid page
    }
  }, [filteredBrands.length, currentPage, itemsPerPage]);

  const saveBrandDetails = async () => {
    try {
      console.log("Starting saveBrandDetails function");
      console.log("Editing brand:", editingBrand);
      console.log("Is adding new brand:", isAddingNewBrand);

      if (!editingBrand || (!isAddingNewBrand && !editingBrand._id)) {
        console.error("Invalid editingBrand:", editingBrand);
        alert("Invalid brand data. Please try again.");
        return;
      }

      if (isAddingNewBrand) {
        const tempId = `temp-${Date.now()}`;
        const tempBrand = { ...editingBrand, _id: tempId };

        console.log("Adding temporary brand:", tempBrand);

        setBrands((prevBrands) => [...prevBrands, tempBrand]);

        const response = await apiClient.post("/brands", editingBrand);
        console.log("Full API response (POST):", response);

        const newBrand = extractUpdatedBrand(response, "new");

        if (!newBrand) {
          console.error("New brand not found in API response. Re-fetching...");
          await refetchBrands();
        } else {
          setBrands((prevBrands) =>
            prevBrands.map((brand) => (brand._id === tempId ? newBrand : brand))
          );
        }
      } else {
        console.log("Updating brand with ID:", editingBrand._id);

        setBrands((prevBrands) => {
          console.log("Previous brands before update:", prevBrands);
          return prevBrands.map((brand) =>
            brand._id === editingBrand._id
              ? { ...brand, ...editingBrand }
              : brand
          );
        });

        const response = await apiClient.put(
          `/brands/${editingBrand._id}`,
          editingBrand
        );
        console.log("Full API response (PUT):", response);

        // Extract the updated brand from `data.new`
        const updatedBrand = extractUpdatedBrand(response, "updated");

        if (!updatedBrand) {
          console.error(
            "Updated brand not found in API response. Using fallback."
          );
          setBrands((prevBrands) =>
            prevBrands.map((brand) =>
              brand._id === editingBrand._id ? editingBrand : brand
            )
          );
          await refetchBrands();
        } else {
          setBrands((prevBrands) =>
            prevBrands.map((brand) =>
              brand._id === editingBrand._id ? updatedBrand : brand
            )
          );
        }
      }

      setSearchTerm("");
      closeModal();
      console.log("Finished saveBrandDetails function");
    } catch (error) {
      console.error("Critical error in saveBrandDetails:", error);
      alert("A critical error occurred. Please try again.");
      await refetchBrands();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBrand((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading brands...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-blue-500 shadow-md">
        <div className="flex items-center justify-between px-4 py-4 text-white">
          <h1 className="text-3xl font-bold">
            Brands ({filteredBrands.length})
          </h1>
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-blue-500">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search brands..."
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
          <div className="flex items-center space-x-4">
            <button
              onClick={openAddNewModal}
              className="flex items-center px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
            >
              <FaPlusCircle className="inline-block mr-2" /> Add New Brand
            </button>
            <button onClick={openAddNewModal} className="text-white md:hidden">
              <FaPlusCircle size={24} />
            </button>
          </div>
        </div>
        {isSearchOpen && (
          <div className="px-4 pb-2 md:hidden">
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 text-black border rounded-lg focus:ring focus:ring-indigo-200"
            />
          </div>
        )}
      </header>

      {/* Brands List - Responsive Grid */}
      <main className="p-4 pb-20">
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentBrands.map((brand) => {
              if (!brand || !brand._id) {
                console.error("Skipping invalid brand:", brand);
                return null; // Skip rendering for invalid brands
              }
              return (
                <div
                  key={brand._id}
                  className="overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-lg hover:shadow-2xl"
                >
                  {/* Brand Card Clickable Area for Details */}
                  <div
                    className="cursor-pointer"
                    onClick={() => openDetailsModal(brand)}
                  >
                    <div className="flex items-center justify-center h-48 bg-gray-100">
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="object-contain w-32 h-32 mx-auto"
                        onError={(e) => {
                          e.currentTarget.src = defaultUser;
                        }}
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {brand.name}
                      </h3>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-around p-4 border-t">
                    <button
                      onClick={() => openDetailsModal(brand)}
                      className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openEditModal(brand)}
                      className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    {userInfo?.role === "admin" && (
                      <button
                        onClick={() => confirmDeleteBrand(brand)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <FaTrashAlt className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-8 text-center text-gray-600">
            No brands found for your search.
          </p>
        )}
      </main>

      {/* Fixed Pagination Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between px-4 py-2"
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
              className="inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 ml-3 text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </nav>
      </footer>

      {/* Modal for Editing or Adding Brand */}
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
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
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900">
                  {isAddingNewBrand ? "Add New Brand" : "Edit Brand"}
                </Dialog.Title>
                <div className="mt-4">
                  {/* Logo Section */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Logo
                    </label>
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={editingBrand?.image || defaultUser}
                        alt={editingBrand?.name || "Default Logo"}
                        className="object-contain w-24 h-24"
                        onError={(e) => {
                          e.currentTarget.src = defaultUser;
                        }}
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
                  {/* Name Section */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editingBrand?.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      placeholder="Enter brand name"
                    />
                  </div>
                  {/* Description Section */}
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-semibold">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={editingBrand?.description || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      placeholder="Enter brand description"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
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
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Details Modal */}
      <Transition appear show={detailsModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeDetailsModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
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
              as={Fragment}
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
                {detailsBrand ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={detailsBrand.image}
                        alt={detailsBrand.name}
                        className="object-contain w-32 h-32"
                        onError={(e) => {
                          e.currentTarget.src = defaultUser;
                        }}
                      />
                    </div>
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {detailsBrand.name}
                    </p>
                    {detailsBrand.description ? (
                      <p>
                        <span className="font-semibold">Description:</span>{" "}
                        {detailsBrand.description}
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
      <Transition appear show={confirmOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setConfirmOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
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
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                <Dialog.Title className="text-2xl font-bold leading-6 text-gray-900">
                  Confirm Deletion
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-gray-600">
                    Are you sure you want to delete this brand? This action
                    cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end mt-6 space-x-4">
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
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
