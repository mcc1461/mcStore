import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: (() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);

        // Ensure the parsed data includes the necessary fields
        if (parsedUserInfo.id && !parsedUserInfo._id) {
          parsedUserInfo._id = parsedUserInfo.id; // Map `id` to `_id`
        }

        return parsedUserInfo;
      }
      return null;
    } catch (error) {
      console.error("Error parsing userInfo from localStorage:", error);
      return null;
    }
  })(),
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Sets user credentials into the Redux store and localStorage.
     * Maps `id` to `_id` for consistency if necessary.
     */
    setCredentials: (state, action) => {
      const { userInfo, token, refreshToken } = action.payload;

      // Map `id` to `_id` if not already mapped
      if (userInfo?.id && !userInfo._id) {
        userInfo._id = userInfo.id;
      }

      state.userInfo = userInfo;
      state.token = token;
      state.refreshToken = refreshToken;

      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    },

    /**
     * Clears user credentials from the Redux store and localStorage.
     */
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      state.refreshToken = null;

      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },

    /**
     * Hydrates the Redux store state from localStorage upon application initialization.
     */
    hydrateFromStorage: (state) => {
      try {
        const storedUserInfo = localStorage.getItem("userInfo");
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);

          // Ensure the parsed data includes the necessary fields
          if (parsedUserInfo.id && !parsedUserInfo._id) {
            parsedUserInfo._id = parsedUserInfo.id; // Map `id` to `_id`
          }

          state.userInfo = parsedUserInfo;
        } else {
          state.userInfo = null;
        }

        state.token = token || null;
        state.refreshToken = refreshToken || null;
      } catch (error) {
        console.error("Error hydrating auth state from localStorage:", error);
        state.userInfo = null;
        state.token = null;
        state.refreshToken = null;
      }
    },

    /**
     * Updates user info in the Redux store with new values. Useful for profile
     * updates without requiring a full re-login.
     */
    updateUserInfo: (state, action) => {
      // Merge the updated fields into the existing user info.
      if (state.userInfo) {
        state.userInfo = {
          ...state.userInfo,
          ...action.payload,
        };

        // Update the localStorage to maintain consistency across reloads.
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      }
    },
  },
});

export const { setCredentials, logout, hydrateFromStorage, updateUserInfo } =
  authSlice.actions;
export default authSlice.reducer;
