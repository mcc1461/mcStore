import { useParams, useNavigate } from "react-router-dom";
import { deleteProduct } from "../slices/products/productSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

export default function DeleteProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use the deleteProduct mutation from productApiSlice
  const [productDelete, { isLoading }] = useDeleteProductMutation();

  const handleDelete = async () => {
    try {
      console.log("Deleting product with ID:", id);
      // Execute the deleteProduct mutation
      const response = await productDelete(id);

      // Check if the deletion was successful
      if (response.payload) {
        // If deletion is successful, navigate to a success page or back to the product list.

        dispatch(deleteProduct(id));

        navigate("/dashboard/board");
        toast.success("Product deleted successfully");
      } else {
        // Handle the error and display a message to the user if needed.
        console.log("Product deleted successfully");
        toast.success("Product deleted Successfully");

        navigate("/dashboard/board");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      // Handle the error and display a message to the user if needed.
      toast("Error deleting products!, Please try again later");
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center text-4xl text-center font-bold">
      <div>
        <p>This product is being deleted permanently.</p>
        <p>Are you sure you want to delete it?</p>
        <div className="flex items-center justify-evenly mt-4">
          <button
            className="text-white bg-red-500 hover:bg-red-300 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Delete
          </button>
          <button
            className="text-white bg-blue-500 hover:bg-blue-300 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
            type="button"
            onClick={() => navigate("/dashboard/board")}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
