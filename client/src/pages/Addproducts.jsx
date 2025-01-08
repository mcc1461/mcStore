import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";
import { addProduct } from "../slices/products/productSlice";

export default function Addproducts() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("No file selected");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, price, quantity, description } = formData;

    console.log("Form Data", formData);

    // Validation logic here (you can check if fields are empty, etc.)

    try {
      const response = await createProduct({
        name,
        category,
        price,
        quantity,
        description,
        // Add other fields as needed based on your schema
      });

      // Check if the mutation was successful
      if (response.data) {
        dispatch(addProduct(response.data));
        // Clear the form fields and image
        setFormData({
          name: "",
          category: "",
          price: "",
          quantity: "",
          description: "",
        });

        console.log("API RESPONSE:", response);
        setFileName("No selected file");
        setImage(null);

        // Optionally, you can show a success message using toast
        toast.success("Product added successfully!");

        // Navigate to a different page if needed
        navigate("/dashboard/board");
      }
    } catch (error) {
      // Handle errors here, you can display an error message to the user or log errors to the console
      console.error("Error adding product:", error);

      if (
        error.response &&
        error.response.data.message === "Nmae already exists"
      ) {
        toast.error(
          "Product name already exists. Please choose a different name"
        );
        console.error("name already exists,", error);
      } else {
        toast.error("Error adding product. Please try again later.");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[80vw] h-[85vh] ">
      <div className="flex items-center justify-center gap-5 w-[100%] h-[90%] ">
        <div className="bg-white rounded-lg shadow-lg w-[45%] h-[95%] px-3 ">
          <h2 className="text-2xl font-bold ">Add Products Details</h2>
          <form className="" onSubmit={handleSubmit}>
            {isLoading && <Loader />}
            <div className="">
              <label htmlFor="subject" className="font-bold">
                product Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="product Names"
                className="w-full border border-gray-400 pt-2 rounded-lg"
                value={formData.name}
                onChange={handleInputChange}
              />
              <label htmlFor="" className="font-bold">
                Product Category:
              </label>
              <input
                type="text"
                id="category"
                name="category"
                placeholder="Product Category"
                className="w-full border border-gray-400 pt-2 rounded-lg"
                value={formData.category}
                onChange={handleInputChange}
              />
              <label htmlFor="" className="font-bold">
                Product Price:
              </label>
              <input
                type="text"
                id="price"
                name="price"
                placeholder="Product Price"
                className="w-full border border-gray-400 pt-2 rounded-lg"
                value={formData.price}
                onChange={handleInputChange}
              />
              <label htmlFor="" className="font-bold">
                Product Quantity:
              </label>
              <input
                type="text"
                id="quantity"
                name="quantity"
                placeholder="Product Quantity"
                className="w-full border border-gray-400 pt-2 rounded-lg"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div className="">
              <label htmlFor="message" className=" font-bold">
                Message
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                placeholder="Enter message"
                className="w-full border border-gray-400 pt-2 rounded-lg"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Add Products
            </button>
          </form>
        </div>
        <div className="w-[45%] flex flex-col justify-center gap-5 h-[95%]">
          <b>
            {" "}
            Product Image:{" "}
            <span className="text-neutral-500">Jpg, Png, Jpeg</span>
          </b>

          <form
            className="flex flex-col items-center justify-center h-[300px] w-[450px] cursor-pointer rounded-xl bg-white shadow-lg"
            onClick={() => document.querySelector(".input-field").click()}
          >
            <input
              type="file"
              accept="image/*"
              className="input-field"
              hidden
              onChange={handleImageChange}
            />
            {image ? (
              <img src={image} width={150} height={150} alt={fileName} />
            ) : (
              <>
                <MdCloudUpload color="#1475cf" size={60} />
                <p>Browse Files to upload</p>
              </>
            )}
          </form>
          <section className="flex items-center justify-between w-full p-[15px] rounded-3xl bg-white shadow-lg">
            <AiFillFileImage color="#1475cf" />
            <span className="flex items-center">
              {fileName} -{" "}
              <MdDelete
                onClick={() => {
                  setFileName("No selected File");
                  setImage(null);
                }}
              />
            </span>
          </section>
        </div>
      </div>
    </div>
  );
}
