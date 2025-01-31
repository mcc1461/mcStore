import React from "react";
import { Dialog, Transition } from "@headlessui/react";

const ConfirmDialog = ({ confirmOpen, setConfirmOpen, deleteProduct }) => {
  return (
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
              Are you sure you want to delete this product? This action cannot
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
                onClick={deleteProduct}
                className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDialog;
