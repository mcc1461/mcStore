const PRODUCTS_URL = "/api/products";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => `${PRODUCTS_URL}`,
      // Define other options like `transformResponse` here if needed.
    }),
    getProductById: builder.query({
      query: (id) => `${PRODUCTS_URL}/${id}`,
    }),
    createProduct: builder.mutation({
      query: (newProductData) => ({
        url: `${PRODUCTS_URL}`,
        method: "POST",
        body: newProductData,
      }),
    }),
    updateProduct: builder.mutation({
      query: ({ id, updatedProductData }) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: "PUT",
        body: updatedProductData,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiSlice;
