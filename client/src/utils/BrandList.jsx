import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlusCircle } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import apiClient from "../services/apiClient"; // Import the apiClient for making requests

export default function BrandsList() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Ensure searchTerm is initialized as an empty string
  const [editingBrand, setEditingBrand] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBrandForDelete, setSelectedBrandForDelete] = useState(null);
  const [expandedBrands, setExpandedBrands] = useState({}); // Track expanded details

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiClient.get("/api/brands");
        setBrands(response.data.data);
        setLoading(false);
      } catch (error) {
        setError("Error fetching brands");
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Delete a brand with confirmation modal
  const confirmDeleteBrand = (brand) => {
    setSelectedBrandForDelete(brand);
    setConfirmOpen(true); // Open the confirm dialog
  };

  const deleteBrand = async () => {
    try {
      await apiClient.delete(`/api/brands/${selectedBrandForDelete._id}`);
      setBrands(
        brands.filter((brand) => brand._id !== selectedBrandForDelete._id)
      ); // Remove deleted brand
      setConfirmOpen(false); // Close confirm modal
    } catch (error) {
      console.error("Error deleting the brand:", error);
    }
  };

  // Open modal to edit a brand
  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setIsAddingNewBrand(false); // Ensure it's not in "Add New" mode
    setModalOpen(true); // Open the modal
  };

  // Open modal to add a new brand
  const openAddNewModal = () => {
    setEditingBrand({ name: "", image: "" }); // Empty form for new brand
    setIsAddingNewBrand(true); // Switch to "Add New" mode
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingBrand(null);
  };

  // Save edited or new brand details
  const saveBrandDetails = async () => {
    try {
      if (isAddingNewBrand) {
        // POST request to add a new brand
        const response = await apiClient.post("/api/brands", editingBrand);
        setBrands([...brands, response.data]); // Add new brand to list without reload
      } else {
        // PUT request to update an existing brand
        await apiClient.put(`/api/brands/${editingBrand._id}`, editingBrand);
        setBrands((prevBrands) =>
          prevBrands.map((brand) =>
            brand._id === editingBrand._id ? editingBrand : brand
          )
        );
      }
      closeModal(); // Close modal after saving
    } catch (error) {
      console.error("Error saving the brand:", error);
    }
  };

  // Handle input change in the modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingBrand((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle details on button click
  const toggleDetails = (id) => {
    setExpandedBrands((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the state for the specific brand
    }));
  };

  // Hide details when mouse leaves the card
  const hideDetails = (id) => {
    setExpandedBrands((prev) => ({
      ...prev,
      [id]: false, // Set the state to false when mouse leaves
    }));
  };

  // Filter brands based on the search term, ensuring brand.name is defined
  const filteredBrands = brands.filter((brand) =>
    brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <p>Loading brands...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <>
      {/* Add New Brand Button */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 px-4 py-2 border rounded-lg focus:ring focus:ring-indigo-200"
        />

        <button
          onClick={openAddNewModal}
          className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
        >
          <FaPlusCircle className="inline-block mr-2" /> Add New Brand
        </button>
      </div>

      {/* Brands List */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 px-4 py-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id}
              className="overflow-hidden transition-transform duration-300 transform bg-gray-100 rounded-lg shadow-lg hover:scale-105"
              onMouseLeave={() => hideDetails(brand._id)} // Hide details on mouse leave
            >
              {/* Logo and Name */}
              <div className="flex items-center justify-center h-56 bg-white">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="object-contain w-full h-full p-4"
                />
              </div>
              <div className="p-6 text-center">
                {/* View Details Button */}
                <button
                  onClick={() => toggleDetails(brand._id)}
                  className="font-semibold text-indigo-500 hover:text-indigo-600"
                >
                  {expandedBrands[brand._id] ? "Hide Details" : "View Details"}
                </button>

                {/* Details Section (Visible only if expanded) */}
                {expandedBrands[brand._id] && (
                  <div className="mt-4">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {brand.name}
                    </h3>
                    <p className="text-gray-600">
                      Created at: {new Date(brand.createdAt).toLocaleString()}
                    </p>
                    <p className="text-gray-600">
                      Last updated: {new Date(brand.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
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
