import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

export default function Products() {
  const { id } = useParams();

  // Fetch the product details using the product Id
  const { data: productData, isLoading, isError } = useGetProductByIdQuery(id);

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !productData) {
    // Handle error or product not found
    return (
      <div className="text-2xl font-bold">
        Error: Unable to fetch Product Details.................
        <br />
        <div>Please confirm you clicked on the right product!!!!</div>
      </div>
    );
  }

  const { name, sku, categories, price, quantity, description } = productData;

  return (
    <div className="flex flex-col justify-center w-[80vw] h-[85vh] mt-3">
      <div className="flex items-start justify-center w-[100%] h-[100%] gap-10">
        {/* Left Section */}
        <div className="bg-white rounded-lg shadow-lg w-[45%] h-[100%] flex flex-col gap-2 items-center justify-start">
          <div className="w-[95%]">
            <h2 className="text-2xl font-bold">Product</h2>
            <p className="font-bold border-t-2 border-b-2 border-gray-300">
              Products Availability :{" "}
              <span className="font-semibold text-green-700">In Stock</span>
            </p>
          </div>

          <div className="h-[73vh] w-[95%]">
            <p>
              <b className="p-1 mb-2 text-xl text-white bg-red-500 red">
                Name:
              </b>{" "}
              <span>{name}</span>
            </p>
            <p>
              <b>SKU: {sku}</b>{" "}
              <span className="font-semibold text-gray-500">
                -183547496489307
              </span>
            </p>
            <p>
              <b>Categories:</b>{" "}
              <span className="ml-3 font-semibold text-gray-500">
                {categories}
              </span>
            </p>
            <p>
              <b>Price:</b>{" "}
              <span className="ml-3 font-semibold text-gray-500">#{price}</span>
            </p>
            <p>
              <b>Quantity in Stock:</b>{" "}
              <span className="ml-3 font-semibold text-gray-500">
                {quantity}
              </span>
            </p>
            <p className="border-b-2 border-gray-300">
              <b>Total value in Stock:</b>{" "}
              <span className="ml-3 font-semibold text-gray-500">
                #{price * quantity}
              </span>
            </p>
            <b>Description:</b>
            <p className="font-semibold text-gray-500">{description}</p>
          </div>

          <Link to={`/dashboard/editproduct/${id}`}>
            <button className="p-1 mt-2 font-semibold text-center text-white no-underline bg-red-500 rounded hover:bg-red-600">
              Edit Product
            </button>
          </Link>
        </div>

        {/* Right Section */}
        <div className="w-[45%]">
          <p className="text-xl">Product Image:</p>
          <img src={photo} alt="Image of a milo" className="h-[92%] w-[100%]" />
          <img src={productData.image} alt={`Image of ${name}`} />
        </div>
      </div>
    </div>
  );
}
