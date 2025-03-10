/********************************************************************************************
 * FILE: src/pages/CategorySummaryList.jsx
 * This component displays a modal with summary details for a given category.
 * It receives three props:
 *   - isOpen (boolean): whether the modal is open.
 *   - onClose (function): callback to close the modal.
 *   - summary (object): the computed summary for the category.
 *   - categoryName (string): the name of the category.
 ********************************************************************************************/

import React from "react";
import { Dialog, Transition } from "@headlessui/react";

const CategorySummaryList = ({ isOpen, onClose, summary, categoryName }) => {
  return (
    <Transition appear show={isOpen} as="div">
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
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
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {summary ? (
              <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                <Dialog.Title className="text-xl font-bold">
                  {categoryName} Summary
                </Dialog.Title>
                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Number of Products:</strong> {summary.productCount}
                  </p>
                  <p>
                    <strong>Total Money Spent:</strong> $
                    {Number(summary.totalMoneySpent).toFixed(2)}
                  </p>
                  <p>
                    <strong>Total Money Gained:</strong> $
                    {Number(summary.totalMoneyGained).toFixed(2)}
                  </p>
                  <p>
                    <strong>Profit:</strong> $
                    {Number(summary.profit).toFixed(2)}
                  </p>
                  <p>
                    <strong>Top Sold Product:</strong>{" "}
                    {summary.topSoldProduct
                      ? `${summary.topSoldProduct.name} (${summary.topSoldProduct.soldCount})`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Top Purchased Product:</strong>{" "}
                    {summary.topPurchasedProduct
                      ? `${summary.topPurchasedProduct.name} (${summary.topPurchasedProduct.purchaseCount})`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Most Profitable Products:</strong>
                  </p>
                  <ul className="ml-4 list-disc">
                    {summary.profitableProducts.map((prod, idx) => (
                      <li key={idx}>
                        {prod.name} (Profit: $
                        {((prod.price - prod.cost) * prod.soldCount).toFixed(2)}
                        )
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="inline-block w-full max-w-md p-6 my-8 text-center align-middle transition-all transform bg-white rounded-lg shadow-xl">
                <Dialog.Title className="text-xl font-bold">
                  No Summary Available
                </Dialog.Title>
                <div className="mt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
  );
};

export default CategorySummaryList;
