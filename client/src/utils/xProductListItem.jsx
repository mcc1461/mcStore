import React, { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

export default function ProductItem({ product, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`relative p-4 rounded-lg shadow-md ${
        product.quantity === 0
          ? "bg-red-100"
          : product.quantity < 5
          ? "bg-yellow-100"
          : "bg-gray-50"
      }`}
    >
      <div className="absolute z-20 top-2 left-2">
        <span
          className={`px-2 py-1 rounded text-white ${
            product.quantity === 0
              ? "bg-red-500"
              : product.quantity < 5
              ? "bg-yellow-500"
              : ""
          }`}
        >
          {product.quantity === 0
            ? "Out of Stock"
            : product.quantity < 5
            ? "Low Stock"
            : "In Stock"}
        </span>
      </div>
      <img
        src={product.image}
        alt={product.name}
        className="object-contain w-full h-56 p-4"
      />
      <div className="p-6">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">Quantity: {product.quantity}</p>
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-indigo-500 hover:text-indigo-600"
          >
            {expanded ? "Hide Details" : "View Details"}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="text-blue-500 hover:text-blue-700"
            >
              <FaEdit />
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrashAlt />
            </button>
          </div>
        </div>
        {expanded && (
          <div className="mt-4">
            <p className="text-gray-600">Brand: {product.brandId?.name}</p>
            <p className="text-gray-600">
              Category: {product.categoryId?.name}
            </p>
            <p className="text-gray-600">Price: ${product.price}</p>
          </div>
        )}
      </div>
    </div>
  );
}
