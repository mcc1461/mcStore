import { configureStore } from "@reduxjs/toolkit";

// Import your reducers
import authReducer from "./slices/authSlice"; // <-- Make sure path matches the actual file location
import productReducer from "./slices/products/productSlice";
import boardReducer from "./slices/products/boardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer, // Auth slice
    product: productReducer,
    board: boardReducer,
  },
  // No RTK Query middleware since we've removed `apiSlice`
  devTools: true,
});

export default store;
