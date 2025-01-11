// src/slices/apiSlice.js

import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      let err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({ url: "profile", method: "GET" }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (updatedProfile) => ({
        url: "profile",
        method: "PUT",
        data: updatedProfile,
      }),
      invalidatesTags: ["Profile"],
    }),
    // Add more endpoints here as needed
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = apiSlice;
