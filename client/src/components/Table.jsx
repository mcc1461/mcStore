import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsEye } from "react-icons/bs";
import { HiOutlineRefresh } from "react-icons/hi";
import { ImBin } from "react-icons/im";
import { Link } from "react-router-dom";
import axios from "axios";
import Search from "./Search";

import { deleteProduct, setProducts } from "../slices/products/productSlice";

export default function Table() {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Make sure the data is an array. If not, store an empty array or adjust to your API shape.
        if (response.status === 200) {
          const fetched = Array.isArray(response.data) ? response.data : [];
          dispatch(setProducts(fetched));
        }
      } catch (error) {
        console.error("Error Fetching Products:", error);
        alert("Failed to fetch products.");
      }
    };

    fetchProducts();
  }, [dispatch]);

  // Delete product
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove from Redux
      dispatch(deleteProduct(id));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error Deleting Product:", error);
      alert("Failed to delete product.");
    } finally {
      setShowModal(false);
    }
  };

  // Filtered products based on search input
  const filteredProducts = useMemo(() => {
    // Guard in case `products` is not an array
    if (!Array.isArray(products)) return [];

    return products.filter((product) =>
      product?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return (
    <div>
      {/* Search Bar */}
      <div className="bg-white h-[15%] w-[98%] flex items-center justify-center">
        <Search value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Products Table */}
      <div className="flex flex-col items-center justify-start h-[55vh] mt-3 w-[98%]">
        <table className="w-full text-center table-auto">
          <thead>
            <tr className="border-t-2 border-b-2 border-black">
              <th className="w-[5%]">S/N</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="h-[300px] overflow-y-auto">
            {filteredProducts.map((product, index) => (
              <tr
                key={product?._id}
                className="h-[40px] bg-gray-100 border-b-2 border-white"
              >
                <td>{index + 1}</td>
                <td>{product?.name || "-"}</td>
                <td>{product?.category || "-"}</td>
                <td>#{product?.price ?? "-"}</td>
                <td>{product?.quantity ?? "-"}</td>
                <td>#{product?.value ?? "-"}</td>
                <td className="flex items-center justify-center gap-3 mt-3">
                  {/* View product */}
                  <Link to={`/dashboard/products/${product?._id}`}>
                    <BsEye className="text-[#0F1377]" />
                  </Link>
                  {/* Edit product */}
                  <Link to={`/dashboard/editproduct/${product?._id}`}>
                    <HiOutlineRefresh className="text-[#0A6502]" />
                  </Link>
                  {/* Delete product */}
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowModal(true);
                    }}
                  >
                    <ImBin className="text-[#850707]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="w-full mt-4 text-center text-slate-400">
          by MusCo ©️ {new Date().getFullYear()}
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[40vw] h-[40vh] p-6 bg-white rounded-lg shadow-lg">
            <p className="text-lg font-semibold">
              Are you sure you want to delete <b>{selectedProduct.name}</b>?
            </p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => handleDeleteProduct(selectedProduct._id)}
                className="px-6 py-2 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
