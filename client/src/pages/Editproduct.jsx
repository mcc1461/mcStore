import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { updateProduct } from "../slices/products/productSlice";
import milo from "../assets/milo.png";

export default function Editproducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //Fetch the existing product data
  const { data: productData, isLoading: isLoadingProduct } =
    useGetProductByIdQuery(id);

  //state to hold product data
  const [updatedProductData, setUpdatedProductData] = useState(
    productData || {}
  );

  const [productUpdate, { isLoading }] = useUpdateProductMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProductData({
      ...updatedProductData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault(); // Prevent default form submission behavior
    } else {
      console.warn("Event does not support preventDefault:", e);
    }

    try {
      // Log the data being sent for debugging
      console.log("Updating product with data:", { id, updatedProductData });

      // Make the API call to update the product
      const response = await productUpdate({ id, updatedProductData });

      if (response?.data) {
        // Show success feedback
        toast.success("Product updated successfully!");

        // Dispatch Redux action to update state
        dispatch(updateProduct(response.data));

        // Navigate to the board or another page as needed
        navigate(`/dashboard/board`);
      } else {
        // Handle unexpected response structure
        console.warn("Unexpected response format:", response);
        toast.error("Unexpected response. Please try again.");
      }
    } catch (error) {
      console.error("Error updating product:", error);

      // Display specific error messages if available
      const errorMessage =
        error.response?.data?.message ||
        "Error updating product. Please try again later!";
      toast.error(errorMessage);
    }
  };

  if (isLoadingProduct) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col justify-center w-[80vw] h-[85vh]">
      <div className="flex items-center justify-center w-[100%] h-[100%] gap-10">
        <div className="bg-white rounded-lg shadow-lg w-[45%] h-[88%] flex flex-col items-center justify-center ">
          <div className="h-[100%] w-[95%] ">
            <h2 className="text-2xl font-bold ">Update Product Details</h2>

            <form className="" onSubmit={handleSubmit}>
              {isLoading && <Loader />}
              <div className="">
                <label htmlFor="subject" className="font-bold">
                  Product Name :
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Product Name"
                  className="w-full p-2 border border-gray-400 rounded-lg"
                  value={updatedProductData?.name || productData?.name || ""}
                  onChange={handleInputChange}
                />
                <label htmlFor="" className="font-bold">
                  Product Category :
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  placeholder="Product Category"
                  className="w-full p-2 border border-gray-400 rounded-lg"
                  value={updatedProductData?.category || productData?.category}
                  onChange={handleInputChange}
                />
                <label htmlFor="" className="font-bold">
                  Product Price :
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  placeholder="Product Price"
                  className="w-full p-2 border border-gray-400 rounded-lg"
                  value={updatedProductData?.price || productData?.price}
                  onChange={handleInputChange}
                />
                <label htmlFor="" className="font-bold">
                  Product Quantity :
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  placeholder="10"
                  className="w-full p-2 border border-gray-400 rounded-lg"
                  value={updatedProductData?.quantity || productData?.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="">
                <label htmlFor="message" className="font-bold ">
                  Product Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Product Description"
                  className="w-full p-2 border border-gray-400 rounded-lg"
                  value={
                    updatedProductData?.description || productData?.description
                  }
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white transition duration-200 bg-red-500 rounded-lg hover:bg-red-600"
              >
                Update Product
              </button>
            </form>
          </div>
        </div>
        <div className="w-[45%] h-[100%]">
          <p className="text-xl">Product Image:</p>
          <img src={milo} alt="Image of a milo" className="w-[100%] h-[92%]" />
        </div>
      </div>
    </div>
  );
}
