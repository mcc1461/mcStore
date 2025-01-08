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
    e.preventDefault();

    try {
      const response = await productUpdate({ id, updatedProductData });

      if (response.data) {
        toast.success("Product Updated Successfully!");

        dispatch(updateProduct(response.data));

        navigate(`/dashboard/board`);
      }
    } catch (error) {
      console.error("Error updating product:", error);

      toast.error("Error updating product, please try again later!");
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
                  className="w-full border border-gray-400 p-2 rounded-lg"
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
                  className="w-full border border-gray-400 p-2 rounded-lg"
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
                  className="w-full border border-gray-400 p-2 rounded-lg"
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
                  className="w-full border border-gray-400 p-2 rounded-lg"
                  value={updatedProductData?.quantity || productData?.quantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="">
                <label htmlFor="message" className=" font-bold">
                  Product Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Product Description"
                  className="w-full border border-gray-400 p-2 rounded-lg"
                  value={
                    updatedProductData?.description || productData?.description
                  }
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
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
