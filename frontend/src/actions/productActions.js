import axios from "axios";
import {
  productsRequest,
  productsSuccess,
  productsFail,
  adminProductsRequest,
  adminProductsSuccess,
  adminProductsFail,
} from "../slices/productSlice";
import {
  productRequest,
  productSuccess,
  productFail,
  createReviewRequest,
  createReviewSuccess,
  createReviewFail,
  newProductRequest,
  newproductSuccess,
  newProductFail,
  deleteProductRequest,
  deleteproductSuccess,
  deleteProductFail,
  updateProductRequest,
  updateProductSuccess,
  updateProductFail,
  reviewsRequest,
  reviewsSuccess,
  reviewsFail,
  deleteReviewRequest,
  deleteReviewSuccess,
  deleteReviewFail,
  sellerProductSuccess,
  sellerProductRequest,
  sellerProductFail,
  createSellerProductRequest,
  createSellerProductSuccess,
  createSellerProductFail,
  updateSellerProductRequest,
  updateSellerProductSuccess,
  updateSellerProductFail,
  getSellerSingleProductRequest,
  getSellerSingleProductSuccess,
  getSellerSingleProductFail,
} from "../slices/singleProductSlice";
import {
  relatedProductsRequest,
  relatedProductsSuccess,
  relatedProductsFail,
} from "../slices/relatedProductSlice";

export const getProducts =
  (keyword, price, maincategory, category, subcategory, rating, currentPage) =>
  async (dispatch) => {
    try {
      dispatch(productsRequest());

      let link = `/api/v1/products?page=${currentPage}`;

      if (keyword) link += `&keyword=${keyword}`;
      if (price) link += `&price[gte]=${price[0]}&price[lte]=${price[1]}`;
      if (maincategory) link += `&maincategory=${maincategory}`;
      if (category) link += `&category=${category}`;
      if (subcategory) link += `&subcategory=${subcategory}`;
      if (rating) link += `&ratings=${rating}`;

      const { data } = await axios.get(link);

      dispatch(productsSuccess(data));
      return { payload: data }; // Ensure the data is returned for useEffect
    } catch (error) {
      dispatch(
        productsFail(
          error.response?.data?.message || "Failed to fetch products",
        ),
      );
    }
  };

export const getRelatedProducts = (maincategory) => async (dispatch) => {
  try {
    dispatch(relatedProductsRequest());

    const { data } = await axios.get(
      `/api/v1/products?maincategory=${maincategory}`,
    );
    dispatch(relatedProductsSuccess(data));
  } catch (error) {
    dispatch(relatedProductsFail(error.response.data.message));
  }
};
export const getProduct = (id) => async (dispatch) => {
  try {
    dispatch(productRequest());
    const { data } = await axios.get(`/api/v1/product/${id}`);
    dispatch(productSuccess(data));
  } catch (error) {
    //handle error
    dispatch(productFail(error.response.data.message));
  }
};
export const createReview = (reviewData) => async (dispatch) => {
  try {
    dispatch(createReviewRequest());
    const config = {
      headers: {
        "Content-type": "application/json",
      },
    };
    const { data } = await axios.put(`/api/v1/review`, reviewData, config);
    dispatch(createReviewSuccess(data));
  } catch (error) {
    //handle error
    dispatch(createReviewFail(error.response.data.message));
  }
};
export const getAdminProducts =
  (keyword, status, currentPage) => async (dispatch) => {
    try {
      dispatch(productsRequest());
      let link = `/api/v1/admin/products?page=${currentPage}`;
      if (keyword) link += `&keyword=${keyword}`;
      if (status) link += `&status=${status}`;
      const { data } = await axios.get(link);
      dispatch(productsSuccess(data));
    } catch (error) {
      dispatch(productsFail(error.response.data.message));
    }
  };
export const createNewProduct = (productData) => async (dispatch) => {
  try {
    dispatch(newProductRequest());
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const { data } = await axios.post(
      `/api/v1/admin/product/new`,
      productData,
      config,
    );
    dispatch(newproductSuccess(data));
  } catch (error) {
    //handle error
    dispatch(newProductFail(error.response.data.message));
  }
};
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch(deleteProductRequest());
    await axios.delete(`/api/v1/admin/product/${id}`);
    dispatch(deleteproductSuccess());
  } catch (error) {
    //handle error
    dispatch(deleteProductFail(error.response.data.message));
  }
};
export const updateProduct = (id, productData) => async (dispatch) => {
  try {
    dispatch(updateProductRequest());
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const { data } = await axios.put(
      `/api/v1/admin/product/${id}`,
      productData,
      config,
    );
    dispatch(updateProductSuccess(data));
  } catch (error) {
    //handle error
    dispatch(updateProductFail(error.response.data.message));
  }
};
export const getReviews = (id) => async (dispatch) => {
  try {
    dispatch(reviewsRequest());

    const { data } = await axios.get(`/api/v1/admin/reviews`, {
      params: { id },
    });
    dispatch(reviewsSuccess(data));
  } catch (error) {
    //handle error
    dispatch(reviewsFail(error.response.data.message));
  }
};
export const deleteReview = (productId, id) => async (dispatch) => {
  try {
    dispatch(deleteReviewRequest());

    await axios.delete(`/api/v1/admin/review`, { params: { productId, id } });
    dispatch(deleteReviewSuccess());
  } catch (error) {
    //handle error
    dispatch(deleteReviewFail(error.response.data.message));
  }
};
export const getSellerProducts =
  (keyword, status, currentPage) => async (dispatch) => {
    try {
      dispatch(sellerProductRequest());
      let link = `/api/v1/seller/products?page=${currentPage}`;
      if (keyword) link += `&keyword=${keyword}`;
      if (status) link += `&status=${status}`;
      const { data } = await axios.get(link);
      dispatch(sellerProductSuccess(data));
    } catch (error) {
      dispatch(sellerProductFail(error.response.data.message));
    }
  };
export const addSellerNewProduct = (productData) => async (dispatch) => {
  try {
    dispatch(createSellerProductRequest());
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const { data } = await axios.post(
      `/api/v1/seller/product/new`,
      productData,
      config,
    );
    dispatch(createSellerProductSuccess(data));
  } catch (error) {
    dispatch(createSellerProductFail(error.response.data.message));
  }
};
export const updateSellerProduct = (id, productData) => async (dispatch) => {
  try {
    dispatch(updateSellerProductRequest());
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const { data } = await axios.put(
      `/api/v1/seller/product/${id}`,
      productData,
      config,
    );
    dispatch(updateSellerProductSuccess(data));
  } catch (error) {
    dispatch(updateSellerProductFail(error.response.data.message));
  }
};
export const getSellerSingleProduct = (id) => async (dispatch) => {
  try {
    dispatch(getSellerSingleProductRequest());
    const { data } = await axios.get(`/api/v1/seller/product/${id}`);
    dispatch(getSellerSingleProductSuccess(data));
  } catch (error) {
    dispatch(getSellerSingleProductFail(error.response.data.message));
  }
};
